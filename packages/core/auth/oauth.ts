import crypto from "node:crypto";
import * as oauth2 from "oauth4webapi";

type CodeChallengeContext = {
  codeChallenge: string;
  codeChallengeMethod: string;
};

export class OAuth {
  issuer: URL;
  client: oauth2.Client;
  redirectUri: URL;
  authServer?: oauth2.AuthorizationServer;

  constructor(issuer: URL, client: oauth2.Client, redirectUri: URL) {
    this.issuer = issuer;
    this.client = client;
    this.redirectUri = redirectUri;
  }

  async init() {
    const oauthDiscovery = await oauth2.discoveryRequest(this.issuer, {
      algorithm: "oauth2",
    });
    const authServer = await oauth2.processDiscoveryResponse(
      this.issuer,
      oauthDiscovery,
    );
    if (
      authServer.code_challenge_methods_supported?.includes("S256") !== true
    ) {
      throw new Error("No S256 PKCE support");
    }
    this.authServer = authServer;
    return true;
  }

  generateVerifier() {
    return crypto.randomBytes(32).toString("hex");
  }

  generateState() {
    return crypto.randomBytes(32).toString("hex");
  }

  async generateChallenge(verifier: string): Promise<CodeChallengeContext> {
    return {
      codeChallenge: await oauth2.calculatePKCECodeChallenge(verifier),
      codeChallengeMethod: "S256",
    };
  }

  generateAuthUrl(
    { codeChallenge, codeChallengeMethod }: CodeChallengeContext,
    state: string,
  ) {
    if (!this.authServer || !this.authServer.authorization_endpoint) {
      throw new Error("No auth server");
    }

    if (!codeChallenge || !codeChallengeMethod) {
      throw new Error("No code challenge");
    }

    const authorizationUrl = new URL(this.authServer.authorization_endpoint);
    authorizationUrl.searchParams.set("client_id", this.client.client_id);
    authorizationUrl.searchParams.set("code_challenge", codeChallenge);
    authorizationUrl.searchParams.set(
      "code_challenge_method",
      codeChallengeMethod,
    );
    authorizationUrl.searchParams.set(
      "redirect_uri",
      this.redirectUri.toString(),
    );
    authorizationUrl.searchParams.set("state", state);
    authorizationUrl.searchParams.set("response_type", "code");
    authorizationUrl.searchParams.set("scope", "openid email");
    return authorizationUrl;
  }

  async validateAuthResponse(
    currentUrl: URL,
    codeVerifier: string,
    state: string,
  ) {
    if (!this.authServer) {
      throw new Error("No auth server");
    }

    const params = oauth2.validateAuthResponse(
      this.authServer,
      this.client,
      currentUrl,
      state,
    );
    if (oauth2.isOAuth2Error(params)) {
      throw new Error(`Got OAuth2 error: ${params.error}`);
    }

    const grantResponse = await oauth2.authorizationCodeGrantRequest(
      this.authServer,
      this.client,
      params,
      this.redirectUri.toString(),
      codeVerifier,
    );

    // TODO: figure out challenges
    const challenges = oauth2.parseWwwAuthenticateChallenges(grantResponse);
    if (challenges) {
      for (const challenge of challenges) {
        console.log("challenge", challenge);
      }
      throw new Error(); // Handle www-authenticate challenges as needed
    }

    const openIdResponse = await oauth2.processAuthorizationCodeOpenIDResponse(
      this.authServer,
      this.client,
      grantResponse,
    );
    if (oauth2.isOAuth2Error(openIdResponse)) {
      throw new Error(`Got OAuth2 error: ${openIdResponse.error}`);
    }

    return openIdResponse;
  }

  async revokeAuthResponse(token: string) {
    if (!this.authServer) {
      throw new Error("No auth server");
    }

    const revokeResponse = await oauth2.revocationRequest(
      this.authServer,
      this.client,
      token,
    );
    const result = await oauth2.processRevocationResponse(revokeResponse);
    if (oauth2.isOAuth2Error(result)) {
      throw new Error(`Got OAuth2 error: ${result.error}`);
    }
  }

  async getClaims(openIdResponse: oauth2.OpenIDTokenEndpointResponse) {
    return oauth2.getValidatedIdTokenClaims(openIdResponse);
  }
}
