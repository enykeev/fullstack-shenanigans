import { Hono } from "hono";
import flags from "./flags";

const router = new Hono<{ Variables: Variables }>();

router.use(async (c, next) => {
  const header = c.req.headers.get("Authorization");
  if (!header) {
    return c.json({ error: "unauthorized" }, 401);
  }

  const [type, token] = header.split(" ");
  if (type !== "Bearer") {
    return c.json({ error: "unauthorized" }, 401);
  }

  if (token !== "secret") {
    return c.json({ error: "unauthorized" }, 401);
  }

  c.set("X-App-Id", "some-app-id");

  await next();
});

router.route("/flags", flags);

export default router;
