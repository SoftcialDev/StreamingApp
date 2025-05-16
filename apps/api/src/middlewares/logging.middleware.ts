/**
 * middlewares/logging.middleware.ts
 * Example custom request logger (optional if you use morgan).
 */

import { Request, Response, NextFunction } from "express";

export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();
  res.on("finish", () => {
    const ms = Date.now() - start;
    console.log(`${req.method} ${req.originalUrl} → ${res.statusCode} [${ms}ms]`);
  });
  next();
}
