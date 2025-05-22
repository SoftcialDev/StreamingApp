import { CognitoAuth } from "amazon-cognito-auth-js";
import { config } from "../config";

// Build the Hosted UI URLs from your Vite‐provided config
const auth = new CognitoAuth({
  ClientId: config.cognitoClientId,
  AppWebDomain: config.cognitoDomain,
  TokenScopesArray: ["openid", "email", "profile"],
  RedirectUriSignIn: `${config.apiBaseUrl}/callback`,
  RedirectUriSignOut: `${config.apiBaseUrl}/logout`,
  IdentityProvider: "Microsoft",
  UserPoolId: import.meta.env.VITE_COGNITO_USER_POOL_ID!,      
  AdvancedSecurityDataCollectionFlag: false,
});

export function launchHostedUI() {
  auth.getSession();
}

export function parseCognitoCallback(hash: string): Promise<string> {
  return new Promise((resolve, reject) => {
    auth.parseCognitoWebResponse(hash);
    auth.userhandler = {
      onSuccess: session => resolve(session.getAccessToken().getJwtToken()),
      onFailure: err => reject(err),
    };
  });
}
