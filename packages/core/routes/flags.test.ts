import { test, describe, expect, beforeEach } from "bun:test";

import router from "./flags";
import * as store from "../store";
import { ISO8601 } from "../utils";
import { Hono } from "hono";
import { sql } from "drizzle-orm";

store.init();

describe("Flags Router", () => {
  let testRouter: Hono<{ Variables: Variables }>;
  beforeEach(() => {
    store.db.run(sql`DELETE FROM flags`);
    store.db.run(sql`DELETE FROM audiences`);
    store.db.run(sql`DELETE FROM overrides`);
    store.createFlag({
      appId: "some-app-id",
      flagId: "test",
      name: "test",
      description: "test",
      type: "boolean",
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
        updatedAt: expect.stringMatching(ISO8601),
        description: "test",
        flagId: "test",
        name: "test",
        overrides: [],
        type: "boolean",
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
      updatedAt: expect.stringMatching(ISO8601),
      description: "test",
      flagId: "test",
      name: "test",
      overrides: [],
      type: "boolean",
      value: true,
    });
  });

  test("get /:flagId not found", async () => {
    const req = new Request("http://localhost/unknown");
    const res = await testRouter.request(req);
    expect(res.status).toBe(404);
    expect(await res.json()).toEqual({ error: "not found" });
  });

  test("post /", async () => {
    const req = new Request("http://localhost/", {
      method: "POST",
      body: JSON.stringify({
        flagId: "test2",
        name: "test2",
        description: "test2",
        type: "boolean",
        value: true,
      }),
    });
    const res = await testRouter.request(req);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({
      appId: "some-app-id",
      createdAt: expect.stringMatching(ISO8601),
      updatedAt: expect.stringMatching(ISO8601),
      description: "test2",
      flagId: "test2",
      name: "test2",
      overrides: [],
      type: "boolean",
      value: true,
    });
  });

  test("post / already exists", async () => {
    const req = new Request("http://localhost/", {
      method: "POST",
      body: JSON.stringify({
        flagId: "test",
        name: "test2",
        description: "test2",
        type: "boolean",
        value: true,
      }),
    });
    const res = await testRouter.request(req);
    expect(res.status).toBe(409);
    expect(await res.json()).toEqual({ error: "already exists" });
  });

  test("post / invalid params", async () => {
    const req = new Request("http://localhost/", {
      method: "POST",
      body: JSON.stringify({
        flagId: "test2",
        name: "test2",
        description: "test2",
        type: "boolean",
      }),
    });
    const res = await testRouter.request(req);
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: "invalid params" });
  });

  test("put /:flagId", async () => {
    const req = new Request("http://localhost/test", {
      method: "PUT",
      body: JSON.stringify({
        name: "test2",
        description: "test2",
        type: "boolean",
        value: true,
      }),
    });
    const res = await testRouter.request(req);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({
      appId: "some-app-id",
      createdAt: expect.stringMatching(ISO8601),
      updatedAt: expect.stringMatching(ISO8601),
      description: "test2",
      flagId: "test",
      name: "test2",
      overrides: [],
      type: "boolean",
      value: true,
    });
  });

  test("put /:flagId not found", async () => {
    const req = new Request("http://localhost/unknown", {
      method: "PUT",
      body: JSON.stringify({
        name: "test2",
        description: "test2",
        type: "boolean",
        value: true,
      }),
    });
    const res = await testRouter.request(req);
    expect(res.status).toBe(404);
    expect(await res.json()).toEqual({ error: "not found" });
  });

  test("put /:flagId invalid params", async () => {
    const req = new Request("http://localhost/test", {
      method: "PUT",
      body: JSON.stringify({
        name: "test2",
        description: "test2",
        type: "boolean",
      }),
    });
    const res = await testRouter.request(req);
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: "invalid params" });
  });

  test("delete /:flagId", async () => {
    const req = new Request("http://localhost/test", {
      method: "DELETE",
    });
    const res = await testRouter.request(req);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({
      appId: "some-app-id",
      createdAt: expect.stringMatching(ISO8601),
      updatedAt: expect.stringMatching(ISO8601),
      description: "test",
      flagId: "test",
      name: "test",
      overrides: [],
      type: "boolean",
      value: true,
    });
  });

  test("delete /:flagId not found", async () => {
    const req = new Request("http://localhost/unknown", {
      method: "DELETE",
    });
    const res = await testRouter.request(req);
    expect(res.status).toBe(404);
    expect(await res.json()).toEqual({ error: "not found" });
  });
});
