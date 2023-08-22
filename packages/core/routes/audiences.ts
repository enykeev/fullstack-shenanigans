import { Hono } from "hono";
import * as store from "../store";

const router = new Hono<{ Variables: Variables }>();

router.get("/", (c) => {
  const appId = c.get("X-App-Id");
  const flags = store.listAudiences({ appId });
  return c.json(flags);
});

router.get("/:audienceId", (c) => {
  const appId = c.get("X-App-Id");
  const { audienceId } = c.req.param();
  const flag = store.getAudience({ appId, audienceId });
  if (!flag) {
    return c.json({ error: "not found" }, 404);
  }
  return c.json(flag);
});

export default router;
