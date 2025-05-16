/**
 * controllers/streams.controller.ts
 * Handles stream registration and listing for the API.
 */

import { Request, Response, NextFunction } from "express";
import * as streamsSvc from "../services/streams.service";

/**
 * POST /streams/register
 * Creates (or verifies) a KVS stream for the authenticated user,
 * marks them online, and returns the stream ARN.
 */
export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const employeeId = (req.user as any).sub as string;
    const streamArn = await streamsSvc.registerStream(employeeId);
    res.json({ streamArn });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /streams/online
 * Lists all currently online employees along with their HLS URLs.
 */
export async function listOnline(req: Request, res: Response, next: NextFunction) {
  try {
    const online = await streamsSvc.listOnlineStreams();
    res.json(online);
  } catch (err) {
    next(err);
  }
}

/**
 * POST /streams/unregister
 * Unregisters the KVS stream for the authenticated user,
 * marks them offline, and deletes the stream from AWS.
 */

export async function unregister(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const employeeId = (req.user as any).sub as string;
    await streamsSvc.unregisterStream(employeeId);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
}