/**
 * routes/auth.routes.ts
 * Defines authentication endpoints.
 */

import { Router } from "express";
import { loginController } from "../controllers/auth.controller";

const router = Router();

/**
 * @route POST /auth/login
 * @desc  Authenticate user via Cognito User Pool
 * @body  { username: string, password: string }
 * @returns { accessToken: string, awsCreds?: object }
 */
router.post("/login", loginController);

export default router;
