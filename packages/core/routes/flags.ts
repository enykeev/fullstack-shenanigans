import { PostFlagBody, PutFlagBody } from "@feature-flag-service/common";
import { EvaluateRequest } from "@feature-flag-service/common/models/match";
import { filterPredicate } from "1ql";
import { Hono } from "hono";

import * as store from "../store";
import { Variables } from "../types";

const router = new Hono<{ Variables: Variables }>();

router.get("/", (c) => {
  const appId = c.get("X-App-Id");
  const flags = store.listFlags({ appId });
  return c.json(flags);
});

router.get("/:flagId", (c) => {
  const appId = c.get("X-App-Id");
  const { flagId } = c.req.param();
  const flag = store.getFlag({ appId, flagId });
  if (!flag) {
    return c.json({ error: "not found" }, 404);
  }
  return c.json(flag);
});

router.post("/", async (c) => {
  const appId = c.get("X-App-Id");
  const params = PostFlagBody.safeParse(await c.req.json());
  if (!params.success) {
    return c.json({ error: "invalid params" }, 400);
  }
  const { flagId } = params.data;
  const existingFlag = store.getFlag({ appId, flagId });
  if (existingFlag) {
    return c.json({ error: "already exists" }, 409);
  }
  const { description, ...rest } = params.data;
  store.createFlag({
    ...rest,
    description: description || null,
    appId,
    flagId,
  });
  const flag = store.getFlag({ appId, flagId });
  return c.json(flag);
});

router.put("/:flagId", async (c) => {
  const appId = c.get("X-App-Id");
  const { flagId } = c.req.param();
  const params = PutFlagBody.safeParse(await c.req.json());
  if (!params.success) {
    return c.json({ error: "invalid params" }, 400);
  }
  const existingFlag = store.getFlag({ appId, flagId });
  if (!existingFlag) {
    return c.json({ error: "not found" }, 404);
  }
  //eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { overrides, updatedAt, ...rest } = existingFlag;
  const { name, description, type, value } = params.data;
  const updatedFlag = Object.assign({}, rest, {
    name,
    description,
    type,
    value,
  });
  store.updateFlag(updatedFlag);
  const flag = store.getFlag({ appId, flagId });
  return c.json(flag);
});

router.delete("/:flagId", async (c) => {
  const appId = c.get("X-App-Id");
  const { flagId } = c.req.param();
  const existingFlag = store.getFlag({ appId, flagId });
  if (!existingFlag) {
    return c.json({ error: "not found" }, 404);
  }
  store.deleteFlag({ appId, flagId });
  return c.json(existingFlag);
});

const EvaluateBody = EvaluateRequest;

router.post("/evaluate", async (c) => {
  const appId = c.get("X-App-Id");
  const params = EvaluateBody.safeParse(await c.req.json());
  if (!params.success) {
    return c.json({ error: "invalid params" }, 400);
  }
  const { context } = params.data;
  const flags = store.listFlags({ appId });
  const res = flags.map((flag) => {
    for (const override of flag.overrides) {
      const predicate = filterPredicate(override.audience.filter);
      if (predicate(context)) {
        return {
          ...flag,
          type: override.type,
          value: override.value,
        };
      }
    }
    return flag;
  });
  return c.json(res);
});

export default router;
