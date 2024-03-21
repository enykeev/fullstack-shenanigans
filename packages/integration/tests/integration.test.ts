import { FlagWithOverrides } from "@feature-flag-service/common";
import { ISO8601 } from "@feature-flag-service/common/utils/test";
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
    expect(res.status).toBe(200);
    const httpLogs = logStore.filter({
      logEvent: "httpResponse",
      method: "GET",
      url: `${hostname}/version`,
    });
    expect(httpLogs.get("msg")).toContain(`GET ${hostname}/version -> 200`);
  });

  it("should return a 404 for a /404 route", async () => {
    const res = await core.fetch("/404");
    expect(res.status).toBe(404);
    const httpLogs = logStore.filter({
      logEvent: "httpResponse",
      method: "GET",
      url: `${hostname}/404`,
    });
    expect(httpLogs.get("msg")).toContain(`GET ${hostname}/404 -> 404`);
  });

  it("should return a list of flags", async () => {
    const res = await sdk.getFlags();
    expect(res.length).toBeGreaterThan(0);
    for (const item of res) {
      FlagWithOverrides.parse(item);
    }
    const httpLogs = logStore.filter({
      logEvent: "httpResponse",
      method: "GET",
      url: `${hostname}/api/flags`,
    });
    expect(httpLogs.get("msg")).toContain(`GET ${hostname}/api/flags -> 200`);
  });

  it("should throw an error for a list of flags without auth", async () => {
    const promise = unauthSDK.getFlags();
    const res = (await promise.catch((e: Error) => e)) as Error;
    expect(res).toBeInstanceOf(Error);
    expect(res.message).toBe("unauthorized");
    const httpLogs = logStore.filter({
      logEvent: "httpResponse",
      method: "GET",
      url: `${hostname}/api/flags`,
    });
    expect(httpLogs.get("msg")).toContain(`GET ${hostname}/api/flags -> 401`);
  });

  it("should return a flag", async () => {
    const res = await sdk.getFlag({ flagId: "maintenance" });
    FlagWithOverrides.parse(res);
    const httpLogs = logStore.filter({
      logEvent: "httpResponse",
      method: "GET",
      url: `${hostname}/api/flags/maintenance`,
    });
    expect(httpLogs.get("msg")).toContain(
      `GET ${hostname}/api/flags/maintenance -> 200`,
    );
  });

  it("should throw an error for a flag without auth", async () => {
    const promise = unauthSDK.getFlag({ flagId: "maintenance" });
    const res = (await promise.catch((e: Error) => e)) as Error;
    expect(res).toBeInstanceOf(Error);
    expect(res.message).toBe("unauthorized");
    const httpLogs = logStore.filter({
      logEvent: "httpResponse",
      method: "GET",
      url: `${hostname}/api/flags/maintenance`,
    });
    expect(httpLogs.get("msg")).toContain(
      `GET ${hostname}/api/flags/maintenance -> 401`,
    );
  });

  it("should throw an error for a flag that doesn't exist", async () => {
    const promise = sdk.getFlag({ flagId: "does-not-exist" });
    await expect(promise).rejects.toThrow("not found");
    const httpLogs = logStore.filter({
      logEvent: "httpResponse",
      method: "GET",
      url: `${hostname}/api/flags/does-not-exist`,
    });
    expect(httpLogs.get("msg")).toContain(
      `GET ${hostname}/api/flags/does-not-exist -> 404`,
    );
  });

  it("should create a flag", async () => {
    const res = await sdk.createFlag({
      flagId: "test-flag",
      name: "test-flag",
      description: "test flag",
      type: "boolean",
      value: true,
    });
    expect(res).toEqual({
      appId: "some-app-id",
      flagId: "test-flag",
      name: "test-flag",
      description: "test flag",
      createdAt: expect.stringMatching(ISO8601),
      updatedAt: expect.stringMatching(ISO8601),
      type: "boolean",
      value: true,
      overrides: [],
    });
    const httpLogs = logStore.filter({
      logEvent: "httpResponse",
      method: "POST",
      url: `${hostname}/api/flags`,
    });
    expect(httpLogs.get("msg")).toContain(`POST ${hostname}/api/flags -> 200`);
  });

  it("should throw an error for an attempt to create a flag without auth", async () => {
    const promise = unauthSDK.createFlag({
      flagId: "test-flag",
      name: "test-flag",
      description: "test flag",
      type: "boolean",
      value: true,
    });
    const res = (await promise.catch((e: Error) => e)) as Error;
    expect(res).toBeInstanceOf(Error);
    expect(res.message).toBe("unauthorized");
    const httpLogs = logStore.filter({
      logEvent: "httpResponse",
      method: "POST",
      url: `${hostname}/api/flags`,
    });
    expect(httpLogs.get("msg")).toContain(`POST ${hostname}/api/flags -> 401`);
  });

  it("should throw an error for an attempt to create a flag that already exist", async () => {
    const promise = sdk.createFlag({
      flagId: "maintenance",
      name: "maintenance",
      description: "test flag",
      type: "boolean",
      value: true,
    });
    await expect(promise).rejects.toThrow("already exists");
    const httpLogs = logStore.filter({
      logEvent: "httpResponse",
      method: "POST",
      url: `${hostname}/api/flags`,
    });
    expect(httpLogs.get("msg")).toContain(`POST ${hostname}/api/flags -> 409`);
  });

  it("should update a flag", async () => {
    try {
      await sdk.deleteFlag({
        flagId: "test-create-flag",
      });
    } catch (e) {
      // Do nothing
    }
    await sdk.createFlag({
      flagId: "test-create-flag",
      name: "test-flag",
      description: "test flag",
      type: "boolean",
      value: true,
    });
    const res = await sdk.updateFlag({
      flagId: "test-create-flag",
      name: "updated-test-flag",
      description: "updated test flag",
      type: "boolean",
      value: true,
    });
    expect(res).toEqual({
      appId: "some-app-id",
      flagId: "test-create-flag",
      name: "updated-test-flag",
      description: "updated test flag",
      createdAt: expect.stringMatching(ISO8601),
      updatedAt: expect.stringMatching(ISO8601),
      type: "boolean",
      value: true,
      overrides: [],
    });
    const httpLogs = logStore.filter({
      logEvent: "httpResponse",
      method: "PUT",
      url: `${hostname}/api/flags/test-create-flag`,
    });
    expect(httpLogs.get("msg")).toContain(
      `PUT ${hostname}/api/flags/test-create-flag -> 200`,
    );
  });

  it("should throw an error for an attempt to update a flag without auth", async () => {
    try {
      await sdk.deleteFlag({
        flagId: "test-create-flag",
      });
    } catch (e) {
      // Do nothing
    }
    await sdk.createFlag({
      flagId: "test-create-flag",
      name: "test-flag",
      description: "test flag",
      type: "boolean",
      value: true,
    });
    const promise = unauthSDK.updateFlag({
      flagId: "test-create-flag",
      name: "updated-test-flag",
      description: "updated test flag",
      type: "boolean",
      value: true,
    });
    const res = (await promise.catch((e: Error) => e)) as Error;
    expect(res).toBeInstanceOf(Error);
    expect(res.message).toBe("unauthorized");
    const httpLogs = logStore.filter({
      logEvent: "httpResponse",
      method: "PUT",
      url: `${hostname}/api/flags/test-create-flag`,
    });
    expect(httpLogs.get("msg")).toContain(
      `PUT ${hostname}/api/flags/test-create-flag -> 401`,
    );
  });

  it("should throw an error for an attempt to update a flag that doesn't exist", async () => {
    try {
      await sdk.deleteFlag({
        flagId: "test-create-flag",
      });
    } catch (e) {
      // Do nothing
    }
    const promise = sdk.updateFlag({
      flagId: "test-create-flag",
      name: "updated-test-flag",
      description: "updated test flag",
      type: "boolean",
      value: true,
    });
    await expect(promise).rejects.toThrow("not found");
    const httpLogs = logStore.filter({
      logEvent: "httpResponse",
      method: "PUT",
      url: `${hostname}/api/flags/test-create-flag`,
    });
    expect(httpLogs.get("msg")).toContain(
      `PUT ${hostname}/api/flags/test-create-flag -> 404`,
    );
  });

  it("should delete a flag", async () => {
    try {
      await sdk.createFlag({
        flagId: "test-delete-flag",
        name: "test-flag",
        description: "test flag",
        type: "boolean",
        value: true,
      });
    } catch (e) {
      // Do nothing
    }
    const res = await sdk.deleteFlag({
      flagId: "test-delete-flag",
    });
    expect(res).toEqual({
      appId: "some-app-id",
      flagId: "test-delete-flag",
      name: "test-flag",
      description: "test flag",
      createdAt: expect.stringMatching(ISO8601),
      updatedAt: expect.stringMatching(ISO8601),
      type: "boolean",
      value: true,
      overrides: [],
    });
    const httpLogs = logStore.filter({
      logEvent: "httpResponse",
      method: "DELETE",
      url: `${hostname}/api/flags/test-delete-flag`,
    });
    expect(httpLogs.get("msg")).toContain(
      `DELETE ${hostname}/api/flags/test-delete-flag -> 200`,
    );
  });

  it("should throw an error for an attempt to delete a flag without auth", async () => {
    try {
      await sdk.createFlag({
        flagId: "test-delete-flag",
        name: "test-flag",
        description: "test flag",
        type: "boolean",
        value: true,
      });
    } catch (e) {
      // Do nothing
    }
    const promise = unauthSDK.deleteFlag({
      flagId: "test-delete-flag",
    });
    const res = (await promise.catch((e: Error) => e)) as Error;
    expect(res).toBeInstanceOf(Error);
    expect(res.message).toBe("unauthorized");
    const httpLogs = logStore.filter({
      logEvent: "httpResponse",
      method: "DELETE",
      url: `${hostname}/api/flags/test-delete-flag`,
    });
    expect(httpLogs.get("msg")).toContain(
      `DELETE ${hostname}/api/flags/test-delete-flag -> 401`,
    );
  });

  it("should throw an error for an attempt to delete a flag that doesn't exist", async () => {
    try {
      await sdk.deleteFlag({
        flagId: "test-delete-flag",
      });
    } catch (e) {
      // Do nothing
    }
    const promise = sdk.deleteFlag({
      flagId: "test-delete-flag",
    });
    await expect(promise).rejects.toThrow("not found");
    const httpLogs = logStore.filter({
      logEvent: "httpResponse",
      method: "DELETE",
      url: `${hostname}/api/flags/test-delete-flag`,
    });
    expect(httpLogs.get("msg")).toContain(
      `DELETE ${hostname}/api/flags/test-delete-flag -> 404`,
    );
  });
});
