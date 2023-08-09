import { Hono } from "hono";
import { z } from "zod";
import * as store from "../store";

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

export const PostFlagBody = z.object({
  flagId: z.string(),
  name: z.string(),
  description: z.union([z.string(), z.null()]).default(null),
  value: z.unknown(),
});

router.post("/", async (c) => {
  const appId = c.get("X-App-Id");
  const params = PostFlagBody.safeParse(await c.req.json());
  if (!params.success) {
    return c.json({ error: "invalid params" }, 400);
  }
  const { flagId, name, description, value } = params.data;
  const existingFlag = store.getFlag({ appId, flagId });
  if (existingFlag) {
    return c.json({ error: "already exists" }, 409);
  }
  const flag = store.createFlag({ appId, flagId, name, description, value });
  return c.json(flag);
});

export const PutFlagBody = z.object({
  name: z.string().optional(),
  description: z.union([z.string(), z.null()]).optional(),
  value: z.unknown().optional(),
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
  const flag = store.updateFlag({ ...existingFlag, ...params.data });
  return c.json(flag);
});

export default router;
