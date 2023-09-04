import { Hono } from "hono";

import * as store from "../store";

import audiences from "./audiences";
import flags from "./flags";
import match from "./match";
import overrides from "./overrides";

const router = new Hono<{ Variables: Variables }>();

router.use("*", async (c, next) => {
  if (c.get("X-App-Id")) {
    return await next();
  }

  const header = c.req.headers.get("Authorization");
  if (!header) {
    return c.json({ error: "unauthorized" }, 401);
  }

  const [type, token] = header.split(" ");
  if (type !== "Bearer") {
    return c.json({ error: "unauthorized" }, 401);
  }

  const apiKey = store.findApiKey({ apiKey: token });

  if (!apiKey) {
    return c.json({ error: "unauthorized" }, 401);
  }

  c.set("X-App-Id", apiKey.appId);

  return await next();
});

router.route("/flags", flags);
router.route("/audiences", audiences);
router.route("/overrides", overrides);
router.route("/match", match);

export default router;
