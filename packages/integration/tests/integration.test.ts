import { FlagWithOverrides } from "@feature-flag-service/common";
import { getApp } from "@feature-flag-service/core/app";
import { addHook, clearHooks } from "@feature-flag-service/core/logger";
import { init } from "@feature-flag-service/core/store";
import {
  FeatureFlagClient,
  type FeatureFlagClientConfig,
} from "@feature-flag-service/sdk";
import { serve, type Server } from "bun";
import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
} from "bun:test";

import { getMockAuthServer } from "../src/auth";
import { LogLinesStore } from "../src/logstore";

function makeFetcher(core: Server): FeatureFlagClientConfig["fetcher"] {
  return async (input, init) => {
    const reqInit = init ? { ...init, url: input } : (input as Request);
    const req = new Request(reqInit.url.toString(), {
      ...init,
    });
    return core.fetch(req);
  };
}

describe("Integration tests", () => {
  let hostname: string;
  let core: Server;
  let auth: Server;
  let sdk: FeatureFlagClient;
  let unauthSDK: FeatureFlagClient;

  function makeAuthenticatedRequest(url: string, opts: RequestInit = {}) {
    return new Request(`${hostname}${url}`, {
      ...opts,
      headers: {
        Authorization: "Bearer secret",
      },
    });
  }

  const logStore = new LogLinesStore();

  beforeAll(() => {
    init({ provisionMockData: true });
    addHook(([obj, msg]) => {
      logStore.add(obj, msg);
    });
    const randomAuthPort = Math.floor(Math.random() * 10000) + 20000;
    auth = serve({
      port: randomAuthPort,
      fetch: getMockAuthServer({
        port: randomAuthPort,
      }),
    });
    const randomPort = Math.floor(Math.random() * 10000) + 10000;
    const env = {
      PORT: randomPort,
      PROVISION_MOCK_DATA: true,
      PUBLIC_URL: `http://localhost:${randomPort}`,
      ISSUER: `http://localhost:${randomAuthPort}`,
      CLIENT_ID: "test-client-id",
      CLIENT_SECRET: "test-client-secret",
      SESSION_COOKIE_NAME: "test-session-cookie-name",
      SESSION_SECRET: "some-secret",
    };
    hostname = `http://0.0.0.0:${randomPort}`;
    core = serve({
      port: randomPort,
      fetch: getApp(env).fetch,
    });
    sdk = new FeatureFlagClient({
      endpoint: hostname,
      appId: "test-client-id",
      token: "secret",
      fetcher: makeFetcher(core),
    });
    unauthSDK = new FeatureFlagClient({
      endpoint: hostname,
      appId: "test-client-id",
      token: "bad-secret",
      fetcher: makeFetcher(core),
    });
  });

  afterAll(() => {
    core.stop();
    auth.stop();
    clearHooks();
  });

  beforeEach(() => {
    logStore.clear();
  });

  it("should return current version", async () => {
    const res = await core.fetch("/version");
    const httpLogs = logStore.filter({
      logEvent: "httpResponse",
      method: "GET",
      url: `${hostname}/version`,
    });
    expect(res.status).toBe(200);
    expect(httpLogs.get("msg")).toContain(`GET ${hostname}/version -> 200`);
  });

  it("should return a 404 for a /404 route", async () => {
    const res = await core.fetch("/404");
    const httpLogs = logStore.filter({
      logEvent: "httpResponse",
      method: "GET",
      url: `${hostname}/404`,
    });
    expect(res.status).toBe(404);
    expect(httpLogs.get("msg")).toContain(`GET ${hostname}/404 -> 404`);
  });

  it("should return a list of flags", async () => {
    const res = await sdk.getFlags();
    const httpLogs = logStore.filter({
      logEvent: "httpResponse",
      method: "GET",
      url: `${hostname}/api/flags`,
    });
    expect(res.length).toBeGreaterThan(0);
    for (const item of res) {
      FlagWithOverrides.parse(item);
    }
    expect(httpLogs.get("msg")).toContain(`GET ${hostname}/api/flags -> 200`);
  });

  it("should return 401 for a list of flags without auth", async () => {
    const res = (await unauthSDK.getFlags().catch((e: Error) => e)) as Error;
    const httpLogs = logStore.filter({
      logEvent: "httpResponse",
      method: "GET",
      url: `${hostname}/api/flags`,
    });
    expect(res).toBeInstanceOf(Error);
    expect(res.message).toBe("unauthorized");
    expect(httpLogs.get("msg")).toContain(`GET ${hostname}/api/flags -> 401`);
  });

  it("should return a flag", async () => {
    const res = await sdk.getFlag({ flagId: "maintenance" });
    const httpLogs = logStore.filter({
      logEvent: "httpResponse",
      method: "GET",
      url: `${hostname}/api/flags/maintenance`,
    });
    FlagWithOverrides.parse(res);
    expect(httpLogs.get("msg")).toContain(
      `GET ${hostname}/api/flags/maintenance -> 200`,
    );
  });

  it("should return 401 for a flag without auth", async () => {
    const res = await core.fetch("/api/flags/maintenance");
    const httpLogs = logStore.filter({
      logEvent: "httpResponse",
      method: "GET",
      url: `${hostname}/api/flags/maintenance`,
    });
    expect(res.status).toBe(401);
    expect(httpLogs.get("msg")).toContain(
      `GET ${hostname}/api/flags/maintenance -> 401`,
    );
  });

  it("should return 404 for a flag that doesn't exist", async () => {
    const res = await core.fetch(
      makeAuthenticatedRequest("/api/flags/does-not-exist"),
    );
    const httpLogs = logStore.filter({
      logEvent: "httpResponse",
      method: "GET",
      url: `${hostname}/api/flags/does-not-exist`,
    });
    expect(res.status).toBe(404);
    expect(httpLogs.get("msg")).toContain(
      `GET ${hostname}/api/flags/does-not-exist -> 404`,
    );
  });

  it("should create a flag", async () => {
    const res = await core.fetch(
      makeAuthenticatedRequest("/api/flags", {
        method: "POST",
        body: JSON.stringify({
          flagId: "test-flag",
          name: "test-flag",
          description: "test flag",
          type: "boolean",
          value: true,
        }),
      }),
    );
    const httpLogs = logStore.filter({
      logEvent: "httpResponse",
      method: "POST",
      url: `${hostname}/api/flags`,
    });
    expect(res.status).toBe(200);
    expect(httpLogs.get("msg")).toContain(`POST ${hostname}/api/flags -> 200`);
  });

  // NEXT: we should start using SDK here as it's what we're building our contract against, not the raw api calls
});
