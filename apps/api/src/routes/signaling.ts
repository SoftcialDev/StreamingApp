import { Router, Request, Response, NextFunction } from "express";
import { getSignalingInfo } from "../utils/awsSigner";

type Role = "VIEWER" | "MASTER";

const router = Router();

// GET /signaling?channel=…&role=…&clientId=…
router.get(
  "/",
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const channel  = req.query.channel as string;
    const role     = (req.query.role as Role) || "VIEWER";
    const clientId = req.query.clientId as string;

    if (!channel || !clientId) {
      res.status(400).json({ error: "Missing channel or clientId" });
      return;
    }

    try {
      const info = await getSignalingInfo(channel, role, clientId);
      res.json(info);
    } catch (err) {
      next(err);
    }
  }
);

export default router;
