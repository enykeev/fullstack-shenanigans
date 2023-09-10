import { Hono } from "hono";

import { BearerMiddleware } from "../auth/bearer";
import { Variables } from "../types";

import audiences from "./audiences";
import flags from "./flags";
import match from "./match";
import overrides from "./overrides";

const router = new Hono<{ Variables: Variables }>();

router.use("*", async (c, next) => {
  c.res.headers.set("Access-Control-Allow-Origin", "*");
  c.res.headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  c.res.headers.set(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization",
  );
  c.res.headers.set("Access-Control-Max-Age", "86400");
  if (c.req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: c.res.headers,
    });
  }
  return await next();
});
router.use("*", BearerMiddleware());

router.route("/flags", flags);
router.route("/audiences", audiences);
router.route("/overrides", overrides);
router.route("/match", match);

export default router;
