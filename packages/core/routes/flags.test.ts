import { test, describe, expect, beforeEach } from "bun:test";

import router from "./flags";
import * as store from "../store";
import { ISO8601 } from "../utils";
import { Hono } from "hono";
import { sql } from "drizzle-orm";

store.init();

describe("router", () => {
  let testRouter: Hono<{ Variables: Variables }>;
  beforeEach(() => {
    store.db.run(sql`DELETE FROM flags`);
    store.createFlag({
      appId: "some-app-id",
      flagId: "test",
      name: "test",
      description: "test",
      value: true,
    });

    testRouter = new Hono<{ Variables: Variables }>();
    testRouter.use("*", async (c, next) => {
      c.set("X-App-Id", "some-app-id");
      await next();
    });
    testRouter.route("/", router);
  });

  test("get /", async () => {
    const req = new Request("http://localhost/");
    const res = await testRouter.request(req);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual([
      {
        appId: "some-app-id",
        createdAt: expect.stringMatching(ISO8601),
        description: "test",
        flagId: "test",
        name: "test",
        updatedAt: expect.stringMatching(ISO8601),
        value: true,
      },
    ]);
  });

  test("get /:flagId", async () => {
    const req = new Request("http://localhost/test");
    const res = await testRouter.request(req);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({
      appId: "some-app-id",
      createdAt: expect.stringMatching(ISO8601),
      description: "test",
      flagId: "test",
      name: "test",
      updatedAt: expect.stringMatching(ISO8601),
      value: true,
    });
  });

  test("get /:flagId not found", async () => {
    const req = new Request("http://localhost/unknown");
    const res = await testRouter.request(req);
    expect(res.status).toBe(404);
    expect(await res.json()).toEqual({ error: "not found" });
  });
});
