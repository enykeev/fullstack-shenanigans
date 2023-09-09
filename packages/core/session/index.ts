import { Context, Next } from "hono";
import { getSignedCookie, setSignedCookie } from "hono/cookie";
import { CookieOptions } from "hono/utils/cookie";
import crypto from "node:crypto";

import env from "../env";
import { SessionData, Variables } from "../types";

import { MemorySessionStore } from "./memory";

const DEFAULT_COOKIE_NAME = "s";

export function cookiesSessionMiddleware({
  secret,
  name = DEFAULT_COOKIE_NAME,
  options,
}: {
  secret: string;
  name?: string;
  options?: CookieOptions;
}) {
  const sessionStore = new MemorySessionStore<SessionData>({
    expires: env.SESSION_EXPIRATION,
  });

  return async (c: Context<{ Variables: Variables }>, next: Next) => {
    let sid = await getSignedCookie(c, secret, name);
    if (!sid) {
      // NOTE: We're assigning a session to every user even though they may not
      // log in. We are doing it to keep all cookie options in the middleware.
      sid = crypto.randomBytes(16).toString("hex");
      await setSignedCookie(c, name, sid, secret, {
        secure: true,
        ...options,
      });
    }

    c.set("X-Session-Id", sid);

    const session = sessionStore.get(sid);
    if (session?.data.appId) {
      c.set("X-App-Id", session.data.appId);
    }

    c.set("sessionCookieName", name);
    c.set("sessionStore", sessionStore);

    return await next();
  };
}
