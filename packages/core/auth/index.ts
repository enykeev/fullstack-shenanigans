import { type Context } from "hono";
import { deleteCookie } from "hono/cookie";
import * as oauth2 from "oauth4webapi";

import { type Variables } from "../types";

import { OAuth } from "./oauth";

export function OAuthMiddleware(
  issuer: URL,
  client: oauth2.Client,
  redirectUri: URL,
) {
  const oauthClient = new OAuth(issuer, client, redirectUri);
  const oauthClientReady = oauthClient.init();
  return async (
    c: Context<{ Variables: Variables }>,
    next: () => Promise<void>,
  ) => {
    c.set("oauthClient", oauthClient);
    if (Bun.peek(oauthClientReady) instanceof Promise) {
      await oauthClientReady;
    }
    return await next();
  };
}

export async function login(c: Context<{ Variables: Variables }>) {
  const verifier = c.get("oauthClient").generateVerifier();
  const state = c.get("oauthClient").generateState();
  const challenge = await c.get("oauthClient").generateChallenge(verifier);
  const authUrl = c.get("oauthClient").generateAuthUrl(challenge, state);
  const sid = c.get("X-Session-Id");
  const session = {
    // appId: "some-app-id",
    verifier,
    state,
  };
  c.get("sessionStore").set(sid, session);
  return c.redirect(authUrl.toString());
}

export async function callback(c: Context<{ Variables: Variables }>) {
  const sid = c.get("X-Session-Id");
  const session = c.get("sessionStore").get(sid);
  if (!session) {
    return c.redirect("/");
  }
  const { verifier, state } = session.data;
  if (!verifier || !state) {
    return c.redirect("/");
  }
  const currentUrl = new URL(c.req.url);
  const response = await c
    .get("oauthClient")
    .validateAuthResponse(currentUrl, verifier, state);
  const claims = oauth2.getValidatedIdTokenClaims(response);

  c.get("sessionStore").set(sid, {
    ...session.data,
    appId: "some-app-id",
    user: {
      id: claims.sub,
      email: claims["email"] as string,
    },
    authToken: response.access_token,
  });
  return c.redirect("/");
}

export async function logout(c: Context<{ Variables: Variables }>) {
  const sid = c.get("X-Session-Id");
  const session = c.get("sessionStore").get(sid);
  if (session?.data.authToken) {
    await c.get("oauthClient").revokeAuthResponse(session?.data.authToken);
  }
  c.get("sessionStore").delete(sid);
  deleteCookie(c, c.get("sessionCookieName"));
  return c.redirect("/");
}

export async function me(c: Context<{ Variables: Variables }>) {
  const sid = c.get("X-Session-Id");
  const session = c.get("sessionStore").get(sid);
  const user = session?.data.user;
  const appId = session?.data.appId;
  return c.json({
    user,
    appId,
  });
}
