import {
  CognitoIdentityClient,
  GetIdCommand,
  GetCredentialsForIdentityCommand
} from "@aws-sdk/client-cognito-identity";
import dotenv from "dotenv";
dotenv.config();

const identityClient = new CognitoIdentityClient({
  region: process.env.AWS_REGION
});

/**
 * Exchange a Cognito User Pool ID token for temporary AWS credentials
 * via a Cognito Identity Pool.
 *
 * @param idToken - JWT from Cognito User Pool authentication
 * @returns AWS credentials scoped by the Identity Pool’s Authenticated Role
 */
export async function getAwsCredentials(idToken: string) {
  // 1. Build the Logins map once (input to both commands)
  const logins = {
    // Map the User Pool issuer to the token
    [`cognito-idp.${process.env.AWS_REGION}.amazonaws.com/${process.env.COGNITO_USER_POOL_ID}`]:
      idToken
  };

  // 2. Call GetIdCommand with Logins to retrieve the IdentityId
  const getIdRes = await identityClient.send(
    new GetIdCommand({
      IdentityPoolId: process.env.COGNITO_IDENTITY_POOL_ID!,
      Logins: logins
    })
  );
  const identityId = getIdRes.IdentityId!;  // unique identifier, e.g. "us-east-1:xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" :contentReference[oaicite:0]{index=0}

  // 3. Call GetCredentialsForIdentityCommand with the same Logins
  const credsRes = await identityClient.send(
    new GetCredentialsForIdentityCommand({
      IdentityId: identityId,
      Logins: logins
    })
  );
  // credsRes.Credentials contains { AccessKeyId, SecretKey, SessionToken, Expiration } :contentReference[oaicite:1]{index=1}

  return {
    accessKeyId: credsRes.Credentials!.AccessKeyId!,
    secretAccessKey: credsRes.Credentials!.SecretKey!,
    sessionToken: credsRes.Credentials!.SessionToken!,
    expiration: credsRes.Credentials!.Expiration!
  };
}
