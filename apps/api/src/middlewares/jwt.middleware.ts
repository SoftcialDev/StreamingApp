// apps/api/src/middlewares/jwt.middleware.ts

import { RequestHandler } from "express";
import { expressjwt, GetVerificationKey } from "express-jwt";
import jwksRsa from "jwks-rsa";
import config from "../config";

const rawVerify = expressjwt({
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 10,
    jwksUri: `https://cognito-idp.${config.awsRegion}.amazonaws.com/${config.cognito.userPoolId}/.well-known/jwks.json`
  }) as GetVerificationKey,
  audience: config.cognito.clientId,
  issuer: `https://cognito-idp.${config.awsRegion}.amazonaws.com/${config.cognito.userPoolId}`,
  algorithms: ["RS256"]
});

/**
 * We cast `rawVerify` to RequestHandler so TypeScript
 * sees it as a valid Express middleware function.
 */
export const verifyJwt: RequestHandler = rawVerify as unknown as RequestHandler;
