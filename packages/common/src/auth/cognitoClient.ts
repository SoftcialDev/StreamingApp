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
  // 1. Build the full provider key: issuer + ':' + App Client ID
  const region     = process.env.AWS_REGION!;
  const userPoolId = process.env.COGNITO_USER_POOL_ID!;
  const clientId   = process.env.COGNITO_CLIENT_ID!;
  const provider   = `cognito-idp.${region}.amazonaws.com/${userPoolId}:${clientId}`;

  // 2. Build the Logins map with the correct key
  const logins = { [provider]: idToken };

  // 3. Retrieve the Cognito IdentityId
  const getIdRes = await identityClient.send(
    new GetIdCommand({
      IdentityPoolId: process.env.COGNITO_IDENTITY_POOL_ID!,
      Logins: logins
    })
  );
  const identityId = getIdRes.IdentityId!;

  // 4. Exchange for AWS temporary credentials
  const credsRes = await identityClient.send(
    new GetCredentialsForIdentityCommand({
      IdentityId: identityId,
      Logins: logins
    })
  );

  return {
    accessKeyId:     credsRes.Credentials!.AccessKeyId!,
    secretAccessKey: credsRes.Credentials!.SecretKey!,
    sessionToken:    credsRes.Credentials!.SessionToken!,
    expiration:      credsRes.Credentials!.Expiration!
  };
}
