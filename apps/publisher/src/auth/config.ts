/**
 * Cognito & API Configuration
 * Values are injected from environment variables at build time.
 */
export const CognitoConfig = {
  // Cognito Hosted UI settings
  hostedUIDomain:    process.env.COGNITO_DOMAIN!,             // e.g. mypool.auth.us-east-1.amazoncognito.com
  userPoolClientId:  process.env.COGNITO_CLIENT_ID!,          // App client ID for Cognito
  identityPoolId:    process.env.COGNITO_IDENTITY_POOL_ID!,    // Identity Pool ID for AWS credentials
  redirectUri:       "http://localhost:5000/callback",          // Redirect URI for OAuth callback (dev vs prod)
  region:            process.env.AWS_REGION!,                 // AWS region, e.g. us-east-1

  // API endpoints
  apiWsUrl:         process.env.API_WS_URL!,                  // WebSocket API URL for real-time events
  punchApiUrl:      process.env.PUNCH_API_URL!                // HTTP API URL for /punch (REST → SQS)
};
