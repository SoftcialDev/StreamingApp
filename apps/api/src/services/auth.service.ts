/**
 * services/auth.service.ts
 * Business logic for authentication.
 */

import { login } from "@streaming-app/common/src/auth/login";
import { getAwsCredentials } from "@streaming-app/common/src/auth/cognitoClient";

export async function authenticateUser(username: string, password: string) {
  // 1) Authenticate against Cognito User Pool
  const accessToken = await login(username, password);

  // 2) Exchange for AWS credentials via Identity Pool
  const awsCreds = await getAwsCredentials(accessToken);

  return { accessToken, awsCreds };
}
