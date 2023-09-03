import { expect, test, describe, beforeEach, setSystemTime } from "bun:test";

import * as store from "./store";
import { ISO8601 } from "./utils";
import { sql } from "drizzle-orm";

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
    store.createFlag({
      appId: "test",
      flagId: "test",
      name: "test",
      description: "test",
      type: "boolean",
      value: true,
    });
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
