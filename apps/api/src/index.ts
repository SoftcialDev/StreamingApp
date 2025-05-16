import express from "express";
import cors from "cors";
import { createServer } from "http";
import type { IncomingMessage } from "http";
import { WebSocketServer, WebSocket } from "ws";
import dotenv from "dotenv";

import streamsRouter from "./routes/streams";
import signalingRouter from "./routes/signaling";
import setupPublisherWs from "./ws/publisher";
import setupViewerWs from "./ws/viewer";

dotenv.config();

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ noServer: true });

// Middlewares
app.use(
  cors({
    origin: ["http://localhost:5173"],
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type"],
  })
);
app.use(express.json());

// Routers
app.use("/streams", streamsRouter);
app.use("/signaling", signalingRouter);

// WebSocket upgrade handling
server.on("upgrade", (req: IncomingMessage, socket, head) => {
  const url = req.url ?? "";

  if (url.startsWith("/ws/publisher")) {
    wss.handleUpgrade(req, socket, head, (ws: WebSocket) =>
      setupPublisherWs(ws, req)
    );

  } else if (url.startsWith("/ws/viewer")) {
    wss.handleUpgrade(req, socket, head, (ws: WebSocket) =>
      setupViewerWs(ws, req)
    );

  } else {
    socket.destroy();
  }
});

// Global error handler
app.use(
  (
    err: any,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    console.error("Unhandled error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
);

const PORT = process.env.PORT ?? "3001";
server.listen(Number(PORT), () =>
  console.log(`✅ Backend + WS listening on http://localhost:${PORT}`)
);
