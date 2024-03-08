import { type Context, type Next } from "hono";

import * as store from "../store";
import { type Variables } from "../types";

export const BearerMiddleware = () => {
  return async (c: Context<{ Variables: Variables }>, next: Next) => {
    if (c.get("X-App-Id")) {
      return await next();
    }

    const header = c.req.header("Authorization");
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
  };
};
