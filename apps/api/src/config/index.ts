/**
 * config/index.ts
 * Load and validate environment variables.
 */

import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  AWS_REGION: z.string(),
  COGNITO_USER_POOL_ID: z.string(),
  COGNITO_CLIENT_ID: z.string(),
  COGNITO_IDENTITY_POOL_ID: z.string(),
  MS365_CLIENT_ID: z.string(),
  MS365_CLIENT_SECRET: z.string(),
  MS365_TENANT_ID: z.string(),
  REDIS_HOST: z.string(),
  REDIS_PORT: z.string().transform(Number),
  REDIS_PASSWORD: z.string().optional(),
  REDIS_URL: z.string().optional(),
  PORT: z.string().transform(Number).default("4000")
});

const env = envSchema.parse(process.env);

export default {
  awsRegion: env.AWS_REGION,
  cognito: {
    userPoolId: env.COGNITO_USER_POOL_ID,
    clientId: env.COGNITO_CLIENT_ID,
    identityPoolId: env.COGNITO_IDENTITY_POOL_ID
  },
  ms365: {
    clientId: env.MS365_CLIENT_ID,
    clientSecret: env.MS365_CLIENT_SECRET,
    tenantId: env.MS365_TENANT_ID
  },
  redis: {
    host: env.REDIS_HOST,
    port: env.REDIS_PORT,
    password: env.REDIS_PASSWORD,
    url: env.REDIS_URL
  },
  port: env.PORT
};
