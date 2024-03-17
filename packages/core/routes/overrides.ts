import {
  AllMetaTypes,
  ExpandedOverride,
  validateArray,
  validateValue,
} from "@feature-flag-service/common";
import { EvaluateRequest } from "@feature-flag-service/common/models/match";
import { BaseOverride } from "@feature-flag-service/common/models/override";
import { filterPredicate } from "1ql";
import { Hono } from "hono";

import * as store from "../store";
import { type Variables } from "../types";

const router = new Hono<{ Variables: Variables }>();

router.get("/", (c) => {
  const appId = c.get("X-App-Id");
  const overrides = store.listOverrides({ appId });
  return c.json(validateArray(overrides)(ExpandedOverride));
});

router.get("/:overrideId", (c) => {
  const appId = c.get("X-App-Id");
  const { overrideId } = c.req.param();
  const override = store.getOverride({ appId, overrideId });
  if (!override) {
    return c.json({ error: "not found" }, 404);
  }
  return c.json(validateValue(override)(ExpandedOverride));
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
  const existingOverride = store.getOverride({ appId, overrideId });
  if (existingOverride) {
    return c.json({ error: "already exists" }, 409);
  }
  store.createOverride({ ...params.data, appId, overrideId });
  const override = store.getOverride({ appId, overrideId });
  return c.json(validateValue(override)(ExpandedOverride));
});

export const PutOverrideBody = BaseOverride.pick({}).and(AllMetaTypes);

router.put("/:overrideId", async (c) => {
  const appId = c.get("X-App-Id");
  const { overrideId } = c.req.param();
  const params = PutOverrideBody.safeParse(await c.req.json());
  if (!params.success) {
    return c.json({ error: "invalid params" }, 400);
  }
  const existingOverride = store.getOverride({ appId, overrideId });
  if (!existingOverride) {
    return c.json({ error: "not found" }, 404);
  }
  store.updateOverride({ ...existingOverride, ...params.data });
  const override = store.getOverride({ appId, overrideId });
  return c.json(validateValue(override)(ExpandedOverride));
});

router.delete("/:overrideId", async (c) => {
  const appId = c.get("X-App-Id");
  const { overrideId } = c.req.param();
  const existingOverride = store.getOverride({ appId, overrideId });
  if (!existingOverride) {
    return c.json({ error: "not found" }, 404);
  }
  store.deleteOverride({ appId, overrideId });
  return c.json(validateValue(existingOverride)(ExpandedOverride));
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
  const matchingOverrides = overrides.filter(({ audience }) => {
    return filterPredicate(audience.filter)(context);
  });
  return c.json(validateArray(matchingOverrides)(ExpandedOverride));
});

export default router;
