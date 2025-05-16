/**
 * utils/validate.ts
 * Request payload validation using Zod.
 */

import { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";
import { failure } from "./response";

export function validateBody(schema: ZodSchema<any>) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return failure(res, `Validation error: ${result.error.message}`, 400);
    }
    req.body = result.data;
    next();
  };
}
