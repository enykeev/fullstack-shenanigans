import { Hono } from "hono";

import { BearerMiddleware } from "../auth/bearer";
import { Variables } from "../types";

import audiences from "./audiences";
import flags from "./flags";
import match from "./match";
import overrides from "./overrides";

const router = new Hono<{ Variables: Variables }>();

router.use("*", BearerMiddleware());

router.route("/flags", flags);
router.route("/audiences", audiences);
router.route("/overrides", overrides);
router.route("/match", match);

export default router;
