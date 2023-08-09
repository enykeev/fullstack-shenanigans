import { Hono } from "hono";
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

export default router;
