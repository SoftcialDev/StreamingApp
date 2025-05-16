/**
 * utils/response.ts
 * Standard JSON response helpers.
 */

import { Response } from "express";

export function success<T>(res: Response, data: T, status = 200) {
  return res.status(status).json({ success: true, data });
}

export function failure(res: Response, message: string, status = 500) {
  return res.status(status).json({ success: false, error: message });
}
