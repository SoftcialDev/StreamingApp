/**
 * Exchange a Cognito User Pool ID token for temporary AWS credentials
 * via a Cognito Identity Pool.
 *
 * @param idToken - JWT from Cognito User Pool authentication
 * @returns AWS credentials scoped by the Identity Pool’s Authenticated Role
 */
export declare function getAwsCredentials(idToken: string): Promise<{
    accessKeyId: string;
    secretAccessKey: string;
    sessionToken: string;
    expiration: Date;
}>;
