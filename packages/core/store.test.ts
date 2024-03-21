import { ISO8601 } from "@feature-flag-service/common/utils/test";
import { beforeEach, describe, expect, setSystemTime, test } from "bun:test";
import { sql } from "drizzle-orm";

import * as store from "./store";

store.init();

function advanceTime(ms: number) {
  const now = new Date();
  now.setMilliseconds(now.getMilliseconds() + ms);
  setSystemTime(now);
}

describe("store", () => {
  beforeEach(() => {
    setSystemTime();
    store.db.run(sql`DELETE FROM flags`);
    store.db.run(sql`DELETE FROM apiKeys`);
    store.createApiKey({
      appId: "test",
      apiKey: "test-key",
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
    });
    store.createFlag({
      appId: "test",
      flagId: "test",
      name: "test",
      description: "test",
      type: "boolean",
      value: true,
    });
  });

  test("listApiKeys", () => {
    const apiKeys = store.listApiKeys({ appId: "test" });
    expect(apiKeys).toEqual([
      {
        appId: "test",
        apiKey: "test-key",
        createdAt: expect.stringMatching(ISO8601),
        expiresAt: expect.stringMatching(ISO8601),
      },
    ]);
  });

  test("getApiKey", () => {
    const apiKey = store.getApiKey({ appId: "test", apiKey: "test-key" });
    expect(apiKey).toEqual({
      appId: "test",
      apiKey: "test-key",
      createdAt: expect.stringMatching(ISO8601),
      expiresAt: expect.stringMatching(ISO8601),
    });
  });

  test("createApiKey", () => {
    store.createApiKey({
      appId: "test",
      apiKey: "test-key2",
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
    });
    const apiKey = store.getApiKey({ appId: "test", apiKey: "test-key2" });
    expect(apiKey).toEqual({
      appId: "test",
      apiKey: "test-key2",
      createdAt: expect.stringMatching(ISO8601),
      expiresAt: expect.stringMatching(ISO8601),
    });
  });

  test("deleteApiKey", () => {
    let apiKey = store.getApiKey({ appId: "test", apiKey: "test-key" });
    expect(apiKey).not.toEqual(undefined);
    store.deleteApiKey({
      appId: "test",
      apiKey: "test-key",
    });
    apiKey = store.getApiKey({ appId: "test", apiKey: "test-key" });
    expect(apiKey).toEqual(undefined);
  });

  test("findApiKey", () => {
    const apiKey = store.findApiKey({ apiKey: "test-key" });
    expect(apiKey).toEqual({
      appId: "test",
      apiKey: "test-key",
      createdAt: expect.stringMatching(ISO8601),
      expiresAt: expect.stringMatching(ISO8601),
    });
  });

  test("findApiKey with expired key", () => {
    advanceTime(1000 * 60 * 60 * 24);
    const apiKey = store.findApiKey({ apiKey: "test-key" });
    expect(apiKey).toEqual(undefined);
  });

  test("listFlags", () => {
    const flags = store.listFlags({ appId: "test" });
    expect(flags).toEqual([
      {
        appId: "test",
        flagId: "test",
        name: "test",
        description: "test",
        createdAt: expect.stringMatching(ISO8601),
        updatedAt: expect.stringMatching(ISO8601),
        overrides: [],
        type: "boolean",
        value: true,
      },
    ]);
  });

  test("getFlag", () => {
    const flag = store.getFlag({ appId: "test", flagId: "test" });
    expect(flag).toEqual({
      appId: "test",
      flagId: "test",
      name: "test",
      description: "test",
      createdAt: expect.stringMatching(ISO8601),
      updatedAt: expect.stringMatching(ISO8601),
      overrides: [],
      type: "boolean",
      value: true,
    });
  });

  test("createFlag", () => {
    store.createFlag({
      appId: "test",
      flagId: "test2",
      name: "test2",
      description: "test2",
      type: "boolean",
      value: false,
    });
    const flag = store.getFlag({ appId: "test", flagId: "test2" });
    expect(flag).toEqual({
      appId: "test",
      flagId: "test2",
      name: "test2",
      description: "test2",
      createdAt: expect.stringMatching(ISO8601),
      updatedAt: expect.stringMatching(ISO8601),
      overrides: [],
      type: "boolean",
      value: false,
    });
  });

  test("updateFlag", () => {
    advanceTime(1);
    store.updateFlag({
      appId: "test",
      flagId: "test",
      name: "test2",
      description: "test2",
      type: "boolean",
      value: false,
    });
    const flag = store.getFlag({ appId: "test", flagId: "test" });
    expect(flag).toEqual({
      appId: "test",
      flagId: "test",
      name: "test2",
      description: "test2",
      createdAt: expect.stringMatching(ISO8601),
      updatedAt: expect.stringMatching(ISO8601),
      overrides: [],
      type: "boolean",
      value: false,
    });
    expect(flag?.updatedAt).not.toEqual(flag?.createdAt);
  });

  test("deleteFlag", () => {
    store.deleteFlag({ appId: "test", flagId: "test" });
    const flag = store.getFlag({ appId: "test", flagId: "test" });
    expect(flag).toEqual(null);
  });

  test("getFlagValue", () => {
    const value = store.getFlagValue({ appId: "test", flagId: "test" });
    expect(value).toEqual({ type: "boolean", value: true });
  });

  test("setFlagValue", () => {
    advanceTime(1);
    store.setFlagValue({
      appId: "test",
      flagId: "test",
      type: "boolean",
      value: false,
    });
    const value = store.getFlagValue({ appId: "test", flagId: "test" });
    expect(value).toEqual({ type: "boolean", value: false });
    const flag = store.getFlag({ appId: "test", flagId: "test" });
    expect(flag?.updatedAt).not.toEqual(flag?.createdAt);
  });
});
