// src/auth/identity.ts
import dotenv from 'dotenv';
dotenv.config();      

import { getAwsCredentials } from "@streaming-app/common/auth/cognitoClient";
import Store from "electron-store";
import { error } from "../util/logger";

const store = new Store<{ token?: string }>();

export async function fetchAwsCredentials() {
  const token = store.get("token");
  console.log("Token from store:", token);
  if (!token) {
    error("No Cognito token found when fetching AWS creds");
    throw new Error("No Cognito token found; please log in");
  }
  return getAwsCredentials(token);
}
