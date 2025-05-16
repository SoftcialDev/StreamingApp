/**
 * routes/health.routes.ts
 * Defines health-check endpoint.
 */

import { Router } from "express";
import { health } from "../controllers/health.controller";

const router = Router();

/**
 * @route GET /health
 * @desc  Service health check
 */
router.get("/", health);

export default router;
