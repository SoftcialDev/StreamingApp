import { Router, Request, Response, NextFunction } from "express";
import { redis } from "../utils/redisClient";
import { ensureChannel, deleteChannel } from "../utils/videoChannelManager";

const router = Router();

function normalize(id: string): string {
  return id.replace(/[^a-zA-Z0-9_.-]/g, "_");
}

// POST /streams/register
router.post(
  "/register",
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const clientId = req.body.clientId as string;
    if (!clientId) {
      res.status(400).json({ error: "Missing clientId" });
      return;
    }

    const key = normalize(clientId);
    try {
      let arn = await redis.hget("stream_channels", key);
      if (!arn) {
        arn = await ensureChannel(key);
        await redis.hset("stream_channels", key, arn);
        console.log(`[STREAMS] Created channel for ${key} → ${arn}`);
      } else {
        console.log(`[STREAMS] Reusing channel for ${key} → ${arn}`);
      }
      res.json({ connectionId: key, channelARN: arn });
    } catch (err) {
      next(err);
    }
  }
);

// POST /streams/unregister
router.post(
  "/unregister",
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const clientId = req.body.clientId as string;
    if (!clientId) {
      res.status(400).json({ error: "Missing clientId" });
      return;
    }

    const key = normalize(clientId);
    try {
      const arn = await redis.hget("stream_channels", key);
      if (arn) {
        await deleteChannel(arn);
        await redis.hdel("stream_channels", key);
        console.log(`[STREAMS] Deleted channel for ${key}`);
      }
      res.json({ status: "ok", connectionId: key });
    } catch (err) {
      next(err);
    }
  }
);

// GET /streams
router.get(
  "/",
  async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const ids = await redis.hkeys("stream_channels");
      res.json(ids);
    } catch (err) {
      next(err);
    }
  }
);

export default router;
