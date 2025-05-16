/**
 * controllers/health.controller.ts
 * Simple health-check endpoint.
 */

import { Request, Response } from "express";

/**
 * GET /health
 * Returns 200 OK if the service is up.
 */
export function health(req: Request, res: Response) {
  res.json({ status: "ok", time: new Date().toISOString() });
}
