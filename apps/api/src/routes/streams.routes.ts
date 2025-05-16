/**
 * routes/streams.routes.ts
 * Defines stream management endpoints.
 */

import { Router } from "express";
import * as ctrl from "../controllers/streams.controller";
import { verifyJwt } from "../middlewares/jwt.middleware";

const router = Router();

/**
 * @route POST /streams/register
 * @desc  Create or verify KVS stream, mark user online
 */
router.post("/register", verifyJwt, ctrl.register);

/**
 * @route GET /streams/online
 * @desc  List all online streams with HLS URLs
 */
router.get("/online", verifyJwt, ctrl.listOnline);

/**
 * @route GET /streams/online
 * @desc  List all online streams with HLS URLs
 */
router.post("/unregister", verifyJwt, ctrl.unregister);

export default router;
