import { OAuth } from "./auth/oauth";
import { SessionStore } from "./session/base";

export type SessionData = {
  appId?: string;
  verifier?: string;
  state?: string;
  authToken?: string;
  user?: {
    id: string;
    email: string;
  };
};

export type Variables = {
  sessionStore: SessionStore<SessionData>;
  sessionCookieName: string;
  oauthClient: OAuth;
  "X-App-Id": string;
  "X-Session-Id": string;
};
