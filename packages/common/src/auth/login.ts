// packages/common/src/auth/login.ts

import {
  CognitoIdentityProviderClient,
  InitiateAuthCommand,
  AuthFlowType,
  InitiateAuthCommandInput
} from "@aws-sdk/client-cognito-identity-provider";
import dotenv from "dotenv";

dotenv.config();

/**
 * Singleton Cognito User Pool client, used for all login flows.
 */
const userPoolClient = new CognitoIdentityProviderClient({
  region: process.env.AWS_REGION,
});

/**
 * Perform username/password authentication against your Cognito User Pool.
 *
 * This function calls Cognito’s InitiateAuth API with the USER_PASSWORD_AUTH
 * flow and returns the Access Token (JWT) on success.
 *
 * @param username - The user’s Cognito username (often their email).
 * @param password - The user’s password.
 * @returns A Promise resolving to the Cognito AccessToken (JWT).
 * @throws If authentication fails or no token is returned.
 */
export async function login(
  username: string,
  password: string
): Promise<string> {
  // Build the auth parameters
  const params: InitiateAuthCommandInput = {
    AuthFlow: AuthFlowType.USER_PASSWORD_AUTH,
    ClientId: process.env.COGNITO_CLIENT_ID!,
    AuthParameters: {
      USERNAME: username,
      PASSWORD: password,
    },
  };

  // Send the request to Cognito
  const command = new InitiateAuthCommand(params);
  const response = await userPoolClient.send(command);

  // Extract and return the JWT access token
  const token = response.AuthenticationResult?.AccessToken;
  if (!token) {
    throw new Error("Cognito login failed: no AccessToken returned");
  }
  return token;
}
