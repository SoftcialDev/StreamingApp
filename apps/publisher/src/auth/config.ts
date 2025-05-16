/**
 * Cognito Hosted UI & Identity Pool configuration.
 * Build-time replacement for placeholders needed by the app.
 */
export const CognitoConfig = {
  hostedUIDomain: "__COGNITO_DOMAIN__",         // e.g. mypool.auth.us-east-1.amazoncognito.com
  userPoolClientId: "__COGNITO_CLIENT_ID__",    // App client ID
  redirectUri: "__REDIRECT_URI__",              // file://.../public/callback.html
  identityPoolId: "__COGNITO_IDENTITY_POOL_ID__", // e.g. us-east-1:xxxx-xxxx
  region: "us-east-1"
};
