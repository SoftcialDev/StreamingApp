// src/auth/verifyJwt.ts

/**
 * verifyJwt.ts
 *
 * Express middleware to verify JSON Web Tokens (JWT) issued by AWS Cognito User Pools.
 * On success, attaches the decoded token payload to `req.user`; on failure, responds 401.
 *
 * Usage:
 *   import { verifyJwt } from './verifyJwt';
 *   app.use('/protected', verifyJwt, protectedRouter);
 *
 * Supports conditional exclusion via express-unless:
 *   verifyJwt.unless({ path: ['/login', '/health'] });
 */

import { expressjwt, GetVerificationKey } from 'express-jwt';
import jwksRsa from 'jwks-rsa';
import dotenv from 'dotenv';

dotenv.config();

/**
 * The URL where Cognito publishes its JSON Web Key Set.
 * Example: https://cognito-idp.us-east-1.amazonaws.com/<USER_POOL_ID>/ .well-known/jwks.json
 */
const jwksUri = `https://cognito-idp.${process.env.AWS_REGION}.amazonaws.com/${process.env.COGNITO_USER_POOL_ID}/.well-known/jwks.json`;

export const verifyJwt = expressjwt({
  // Dynamically provide a signing key based on the kid in the header and
  // the signing keys provided by the JWKS endpoint.
  secret: jwksRsa.expressJwtSecret({
    cache: true,                    // cache up to JWKS requests
    rateLimit: true,                // rate-limit the JWKS endpoint calls
    jwksRequestsPerMinute: 10,
    jwksUri,
  }) as GetVerificationKey,

  // Validate the audience and issuer claims:
  audience: process.env.COGNITO_CLIENT_ID!,
  issuer: `https://cognito-idp.${process.env.AWS_REGION}.amazonaws.com/${process.env.COGNITO_USER_POOL_ID}`,

  // Accept only RS256-signed tokens:
  algorithms: ['RS256'],
});

// Attach `unless` so routes like '/login' can opt-out:
import unless from 'express-unless';
(verifyJwt as any).unless = unless;

