import { beforeEach, describe, expect, test } from "bun:test";
import { sql } from "drizzle-orm";
import { Hono } from "hono";

import * as store from "../store";
import { type Variables } from "../types";
import { ISO8601 } from "../utils";

import router from "./audiences";

store.init();

describe("Audiences Router", () => {
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
    store.createAudience({
      appId: "some-app-id",
      audienceId: "test",
      name: "test",
      description: "test",
      filter: "some == 'thing'",
    });
    store.createOverride({
      appId: "some-app-id",
      overrideId: "test",
      flagId: "test",
      audienceId: "test",
      type: "boolean",
      value: false,
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
        audienceId: "test",
        name: "test",
        updatedAt: expect.stringMatching(ISO8601),
        overrides: [
          {
            appId: "some-app-id",
            createdAt: expect.stringMatching(ISO8601),
            overrideId: "test",
            flagId: "test",
            audienceId: "test",
            updatedAt: expect.stringMatching(ISO8601),
            type: "boolean",
            value: false,
            flag: {
              appId: "some-app-id",
              createdAt: expect.stringMatching(ISO8601),
              updatedAt: expect.stringMatching(ISO8601),
              description: "test",
              flagId: "test",
              name: "test",
              type: "boolean",
              value: true,
            },
          },
        ],
        filter: "some == 'thing'",
      },
    ]);
  });

  test("get /:audienceId", async () => {
    const req = new Request("http://localhost/test");
    const res = await testRouter.request(req);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({
      appId: "some-app-id",
      createdAt: expect.stringMatching(ISO8601),
      description: "test",
      audienceId: "test",
      name: "test",
      updatedAt: expect.stringMatching(ISO8601),
      overrides: [
        {
          appId: "some-app-id",
          createdAt: expect.stringMatching(ISO8601),
          overrideId: "test",
          flagId: "test",
          audienceId: "test",
          updatedAt: expect.stringMatching(ISO8601),
          type: "boolean",
          value: false,
          flag: {
            appId: "some-app-id",
            createdAt: expect.stringMatching(ISO8601),
            updatedAt: expect.stringMatching(ISO8601),
            description: "test",
            flagId: "test",
            name: "test",
            type: "boolean",
            value: true,
          },
        },
      ],
      filter: "some == 'thing'",
    });
  });

  test("get /:audienceId not found", async () => {
    const req = new Request("http://localhost/unknown");
    const res = await testRouter.request(req);
    expect(res.status).toBe(404);
    expect(await res.json()).toEqual({ error: "not found" });
  });

  test("post /", async () => {
    const req = new Request("http://localhost/", {
      method: "POST",
      body: JSON.stringify({
        audienceId: "test2",
        name: "test2",
        description: "test2",
        filter: "some == 'thing'",
      }),
    });
    const res = await testRouter.request(req);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({
      appId: "some-app-id",
      createdAt: expect.stringMatching(ISO8601),
      description: "test2",
      audienceId: "test2",
      name: "test2",
      updatedAt: expect.stringMatching(ISO8601),
      overrides: [],
      filter: "some == 'thing'",
    });
  });

  test("post / already exists", async () => {
    const req = new Request("http://localhost/", {
      method: "POST",
      body: JSON.stringify({
        audienceId: "test",
        name: "test",
        description: "test",
        filter: "some == 'thing'",
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
        audienceId: "test",
        name: "test",
        description: "test",
      }),
    });
    const res = await testRouter.request(req);
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: "invalid params" });
  });

  test("put /:audienceId", async () => {
    const req = new Request("http://localhost/test", {
      method: "PUT",
      body: JSON.stringify({
        name: "test2",
        description: "test2",
        filter: "some == 'thing'",
      }),
    });
    const res = await testRouter.request(req);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({
      appId: "some-app-id",
      createdAt: expect.stringMatching(ISO8601),
      description: "test2",
      audienceId: "test",
      name: "test2",
      updatedAt: expect.stringMatching(ISO8601),
      overrides: [
        {
          appId: "some-app-id",
          createdAt: expect.stringMatching(ISO8601),
          overrideId: "test",
          flagId: "test",
          audienceId: "test",
          updatedAt: expect.stringMatching(ISO8601),
          type: "boolean",
          value: false,
          flag: {
            appId: "some-app-id",
            createdAt: expect.stringMatching(ISO8601),
            updatedAt: expect.stringMatching(ISO8601),
            description: "test",
            flagId: "test",
            name: "test",
            type: "boolean",
            value: true,
          },
        },
      ],
      filter: "some == 'thing'",
    });
  });

  test("put /:audienceId not found", async () => {
    const req = new Request("http://localhost/unknown", {
      method: "PUT",
      body: JSON.stringify({
        name: "test2",
        description: "test2",
        filter: "some == 'thing'",
      }),
    });
    const res = await testRouter.request(req);
    expect(res.status).toBe(404);
    expect(await res.json()).toEqual({ error: "not found" });
  });

  test("put /:audienceId invalid params", async () => {
    const req = new Request("http://localhost/test", {
      method: "PUT",
      body: JSON.stringify({
        name: "test2",
        description: "test2",
      }),
    });
    const res = await testRouter.request(req);
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: "invalid params" });
  });

  test("delete /:audienceId", async () => {
    const req = new Request("http://localhost/test", { method: "DELETE" });
    const res = await testRouter.request(req);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({
      appId: "some-app-id",
      createdAt: expect.stringMatching(ISO8601),
      description: "test",
      audienceId: "test",
      name: "test",
      updatedAt: expect.stringMatching(ISO8601),
      overrides: [
        {
          appId: "some-app-id",
          createdAt: expect.stringMatching(ISO8601),
          overrideId: "test",
          flagId: "test",
          audienceId: "test",
          updatedAt: expect.stringMatching(ISO8601),
          type: "boolean",
          value: false,
          flag: {
            appId: "some-app-id",
            createdAt: expect.stringMatching(ISO8601),
            updatedAt: expect.stringMatching(ISO8601),
            description: "test",
            flagId: "test",
            name: "test",
            type: "boolean",
            value: true,
          },
        },
      ],
      filter: "some == 'thing'",
    });
  });

  test("delete /:audienceId not found", async () => {
    const req = new Request("http://localhost/unknown", { method: "DELETE" });
    const res = await testRouter.request(req);
    expect(res.status).toBe(404);
    expect(await res.json()).toEqual({ error: "not found" });
  });

  test("post /evaluate", async () => {
    const req = new Request("http://localhost/evaluate", {
      method: "POST",
      body: JSON.stringify({
        context: {
          some: "thing",
        },
      }),
    });
    const res = await testRouter.request(req);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual([
      {
        appId: "some-app-id",
        createdAt: expect.stringMatching(ISO8601),
        description: "test",
        audienceId: "test",
        name: "test",
        updatedAt: expect.stringMatching(ISO8601),
        overrides: [
          {
            appId: "some-app-id",
            createdAt: expect.stringMatching(ISO8601),
            overrideId: "test",
            flagId: "test",
            audienceId: "test",
            updatedAt: expect.stringMatching(ISO8601),
            type: "boolean",
            value: false,
            flag: {
              appId: "some-app-id",
              createdAt: expect.stringMatching(ISO8601),
              updatedAt: expect.stringMatching(ISO8601),
              description: "test",
              flagId: "test",
              name: "test",
              type: "boolean",
              value: true,
            },
          },
        ],
        filter: "some == 'thing'",
      },
    ]);
  });
});
