/**
 * Wraps exchange of a Cognito Hosted UI access token for AWS credentials.
 */

import { CognitoConfig } from "./config";
import { getAwsCredentials } from "@streaming-app/common/src/auth/cognitoClient";
import Store from "electron-store";

const store = new Store<{ token?: string }>();

export async function fetchAwsCredentials() {
  const token = store.get("token");
  if (!token) {
    throw new Error("No Cognito token found; please log in");
  }
  // Uses the common package function to call Cognito Identity Pool
  const creds = await getAwsCredentials(token);
  return creds;
}
