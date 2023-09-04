import { Context, Next } from "hono";
import { deleteCookie, getSignedCookie, setSignedCookie } from "hono/cookie";
import { CookieOptions } from "hono/utils/cookie";

import { MemorySessionStore } from "./memory";

const SESSION_COOKIE_NAME = "s";

type SessionData = {
  appId?: string;
};

export const sessionStore = new MemorySessionStore<SessionData>();

export function cookiesSessionMiddleware({
  secret,
  name = SESSION_COOKIE_NAME,
  options,
}: {
  secret: string;
  name?: string;
  options?: CookieOptions;
}) {
  return async (c: Context<{ Variables: Variables }>, next: Next) => {
    let sid = await getSignedCookie(c, secret, name);
    if (!sid) {
      // NOTE: We're assigning a session to every user even though they may not
      // log in. We are doing it to keep all cookie options in the middleware.
      sid = crypto.randomUUID().replace(/-/g, "");
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

    return await next();
  };
}

export async function login(c: Context<{ Variables: Variables }>) {
  const sid = c.get("X-Session-Id");
  const session = {
    appId: "some-app-id",
  };
  sessionStore.set(sid, session);
  return c.redirect("/");
}

export async function logout(c: Context<{ Variables: Variables }>) {
  const sid = c.get("X-Session-Id");
  sessionStore.delete(sid);
  deleteCookie(c, SESSION_COOKIE_NAME);
  return c.redirect("/");
}

export async function getSession(c: Context<{ Variables: Variables }>) {
  const sid = c.get("X-Session-Id");
  const session = sessionStore.get(sid);
  return c.json(session);
}
