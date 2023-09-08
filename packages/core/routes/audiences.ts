import { Audience } from "@feature-flag-service/common";
import { EvaluateRequest } from "@feature-flag-service/common/models/match";
import { filterPredicate } from "1ql";
import { Hono } from "hono";

import * as store from "../store";
import { Variables } from "../types";

const router = new Hono<{ Variables: Variables }>();

router.get("/", (c) => {
  const appId = c.get("X-App-Id");
  const audiences = store.listAudiences({ appId });
  return c.json(audiences);
});

router.get("/:audienceId", (c) => {
  const appId = c.get("X-App-Id");
  const { audienceId } = c.req.param();
  const audience = store.getAudience({ appId, audienceId });
  if (!audience) {
    return c.json({ error: "not found" }, 404);
  }
  return c.json(audience);
});

export const PostAudienceBody = Audience.pick({
  audienceId: true,
  name: true,
  description: true,
  filter: true,
});

router.post("/", async (c) => {
  const appId = c.get("X-App-Id");
  const params = PostAudienceBody.safeParse(await c.req.json());
  if (!params.success) {
    return c.json({ error: "invalid params" }, 400);
  }
  const { audienceId } = params.data;
  const existingAudience = store.getAudience({ appId, audienceId });
  if (existingAudience) {
    return c.json({ error: "already exists" }, 409);
  }
  store.createAudience({ ...params.data, appId, audienceId });
  const audience = store.getAudience({ appId, audienceId });
  return c.json(audience);
});

const PutAudienceBody = Audience.pick({
  name: true,
  description: true,
  filter: true,
});

router.put("/:audienceId", async (c) => {
  const appId = c.get("X-App-Id");
  const { audienceId } = c.req.param();
  const params = PutAudienceBody.safeParse(await c.req.json());
  if (!params.success) {
    return c.json({ error: "invalid params" }, 400);
  }
  const existingAudience = store.getAudience({ appId, audienceId });
  if (!existingAudience) {
    return c.json({ error: "not found" }, 404);
  }
  store.updateAudience({ ...existingAudience, ...params.data });
  const audience = store.getAudience({ appId, audienceId });
  return c.json(audience);
});

router.delete("/:audienceId", async (c) => {
  const appId = c.get("X-App-Id");
  const { audienceId } = c.req.param();
  const existingAudience = store.getAudience({ appId, audienceId });
  if (!existingAudience) {
    return c.json({ error: "not found" }, 404);
  }
  store.deleteAudience({ appId, audienceId });
  return c.json(existingAudience);
});

const EvaluateBody = EvaluateRequest;

router.post("/evaluate", async (c) => {
  const appId = c.get("X-App-Id");
  const params = EvaluateBody.safeParse(await c.req.json());
  if (!params.success) {
    return c.json({ error: "invalid params" }, 400);
  }
  const { context } = params.data;
  const audiences = store.listAudiences({ appId });
  const res = audiences.filter(({ filter }) => {
    return filterPredicate(filter)(context);
  });
  return c.json(res);
});

export default router;
