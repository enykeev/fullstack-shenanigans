import { AllMetaTypes } from "@feature-flag-service/common";
import { EvaluateRequest } from "@feature-flag-service/common/models/match";
import { BaseOverride } from "@feature-flag-service/common/models/override";
import { filterPredicate } from "1ql";
import { Hono } from "hono";

import * as store from "../store";
import { type Variables } from "../types";

const router = new Hono<{ Variables: Variables }>();

router.get("/", (c) => {
  const appId = c.get("X-App-Id");
  const flags = store.listOverrides({ appId });
  return c.json(flags);
});

router.get("/:overrideId", (c) => {
  const appId = c.get("X-App-Id");
  const { overrideId } = c.req.param();
  const flag = store.getOverride({ appId, overrideId });
  if (!flag) {
    return c.json({ error: "not found" }, 404);
  }
  return c.json(flag);
});

export const PostOverrideBody = BaseOverride.pick({
  overrideId: true,
  flagId: true,
  audienceId: true,
}).and(AllMetaTypes);

router.post("/", async (c) => {
  const appId = c.get("X-App-Id");
  const params = PostOverrideBody.safeParse(await c.req.json());
  if (!params.success) {
    return c.json({ error: "invalid params" }, 400);
  }
  const { overrideId } = params.data;
  const existingFlag = store.getOverride({ appId, overrideId });
  if (existingFlag) {
    return c.json({ error: "already exists" }, 409);
  }
  store.createOverride({ ...params.data, appId, overrideId });
  const flag = store.getOverride({ appId, overrideId });
  return c.json(flag);
});

export const PutOverrideBody = BaseOverride.pick({}).and(AllMetaTypes);

router.put("/:overrideId", async (c) => {
  const appId = c.get("X-App-Id");
  const { overrideId } = c.req.param();
  const params = PutOverrideBody.safeParse(await c.req.json());
  if (!params.success) {
    return c.json({ error: "invalid params" }, 400);
  }
  const existingFlag = store.getOverride({ appId, overrideId });
  if (!existingFlag) {
    return c.json({ error: "not found" }, 404);
  }
  store.updateOverride({ ...existingFlag, ...params.data });
  const flag = store.getOverride({ appId, overrideId });
  return c.json(flag);
});

router.delete("/:overrideId", async (c) => {
  const appId = c.get("X-App-Id");
  const { overrideId } = c.req.param();
  const existingFlag = store.getOverride({ appId, overrideId });
  if (!existingFlag) {
    return c.json({ error: "not found" }, 404);
  }
  store.deleteOverride({ appId, overrideId });
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
  const overrides = store.listOverrides({ appId });
  const res = overrides.filter(({ audience }) => {
    return filterPredicate(audience.filter)(context);
  });
  return c.json(res);
});

export default router;
