/**
 * app.ts
 * Initializes Express app, global middleware, and routes.
 */

import express from "express";
import morgan from "morgan";
import helmet from "helmet";
import cors from "cors";

import authRoutes from "./routes/auth.routes";
import streamsRoutes from "./routes/streams.routes";
import healthRoutes from "./routes/health.routes";
import { errorHandler } from "./middlewares/error.middleware";

const app = express();

// Global middleware
app.use(helmet());           // basic security headers
app.use(cors());             // enable CORS
app.use(express.json());     // parse JSON bodies
app.use(morgan("combined")); // request logging

// Routes
app.use("/auth", authRoutes);
app.use("/streams", streamsRoutes);
app.use("/health", healthRoutes);

// Error handler (must be last)
app.use(errorHandler);

export default app;
