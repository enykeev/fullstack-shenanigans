import { Hono } from "hono";
import * as store from "../store";
import { AllMetaTypes, BaseFlag } from "@feature-flag-service/common";

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

export const PostFlagBody = BaseFlag.pick({
  flagId: true,
  name: true,
  description: true,
}).and(AllMetaTypes);

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
  store.createFlag({ ...params.data, appId, flagId });
  const flag = store.getFlag({ appId, flagId });
  return c.json(flag);
});

export const PutFlagBody = BaseFlag.pick({ name: true, description: true }).and(
  AllMetaTypes,
);

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
  store.updateFlag({ ...existingFlag, ...params.data });
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

export default router;
