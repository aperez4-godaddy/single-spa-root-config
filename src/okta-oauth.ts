import { OktaAuth } from "@okta/okta-auth-js";

export const oktaAuth = new OktaAuth({
  issuer: process.env.ISSUER,
  clientId: process.env.CLIENT_ID,
  redirectUri: process.env.REDIRECT_URI,
  scopes: ["openid", "profile", "email"],
  pkce: true,
});
