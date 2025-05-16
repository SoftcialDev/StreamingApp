/**
 * controllers/auth.controller.ts
 * Handles authentication routes.
 */

import { Request, Response, NextFunction } from "express";
import { login } from "@streaming-app/common/src/auth/login";
import { getAwsCredentials } from "@streaming-app/common/src/auth/cognitoClient";

export async function loginController(req: Request, res: Response, next: NextFunction) {
  const { username, password } = req.body;
  try {
    const accessToken = await login(username, password);
    const awsCreds = await getAwsCredentials(accessToken);
    res.json({ accessToken, awsCreds });
  } catch (err) {
    next(err);
  }
}
