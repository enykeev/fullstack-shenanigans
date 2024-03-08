import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";

import api from "./routes/api";
import { callback, login, logout, me, OAuthMiddleware } from "./auth";
import type { Env } from "./env";
import { logger } from "./logger";
import { serveStatic } from "./serveStatic";
import { cookiesSessionMiddleware } from "./session";
import { type Variables } from "./types";

export function getApp(environment: Env) {
  const app = new Hono<{ Variables: Variables }>();

  app.onError((e, c) => {
    logger.error({ logEvent: "httpError", error: e }, e.message);
    if (e instanceof HTTPException) {
      return c.json({ error: e.message }, e.status);
    }
    return c.json({ error: e.message }, 500);
  });

  app.use("*", async (c, next) => {
    await next();

    const { req, res } = c;
    const { url, method } = req;
    const { status, headers } = res || {};

    logger.info(
      { logEvent: "httpResponse", url, method, status, headers },
      `${method} ${url} -> ${status}`,
    );
  });

  app.use(
    "*",
    cookiesSessionMiddleware({
      name: environment.SESSION_COOKIE_NAME,
      secret: environment.SESSION_SECRET,
    }),
  );

  const authMiddleware = OAuthMiddleware(
    new URL(environment.ISSUER),
    {
      client_id: environment.CLIENT_ID,
      client_secret: environment.CLIENT_SECRET,
      token_endpoint_auth_method: "client_secret_basic",
    },
    new URL(`${environment.PUBLIC_URL}/authorization-code/callback`),
  );

  app.get("/login", authMiddleware, async (c) => await login(c));
  app.get("/logout", authMiddleware, async (c) => await logout(c));
  app.get(
    "/authorization-code/callback",
    authMiddleware,
    async (c) => await callback(c),
  );
  app.get("/me", async (c) => await me(c));

  app.route("/api", api);

  app.get("/404", () => {
    throw new HTTPException(404);
  });

  app.get("/version", (c) => {
    return c.text("1.0.0");
  });

  app.use(
    "*",
    serveStatic({ root: "./dist" }),
    serveStatic({ root: "./public" }),
    serveStatic({ path: "./public/index.html" }),
  );

  return app;
}
