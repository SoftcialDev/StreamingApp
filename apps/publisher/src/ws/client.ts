// apps/publisher/src/ws/client.ts
/**
 * WebSocket client to subscribe for punch-in/out events.
 * Uses centralized logger for all output.
 */

import WebSocket from "ws";
import Store from "electron-store";
import { log, error } from "../util/logger";  

interface Callbacks {
  onIn(): void;
  onOut(): void;
}

export function connectWS(email: string, callbacks: Callbacks): WebSocket {
  const apiUrl = process.env.API_WS_URL!;
  const ws = new WebSocket(`${apiUrl}?email=${encodeURIComponent(email)}`);

  ws.on("open", () => log("✅ WebSocket connected"));

  ws.on("message", (msg) => {
    try {
      const { action } = JSON.parse(msg.toString());
      log(`Received WS message: ${msg}`);
      if (action === "in") callbacks.onIn();
      else if (action === "out") callbacks.onOut();
      else log(`Unknown action received: ${action}`);
    } catch (e) {
      error("Failed to parse WS message", e as Error);
    }
  });

  ws.on("close", (code, reason) => {
    log(`⚠️ WS closed (code=${code}, reason=${reason}), retrying in 5s`);
    setTimeout(() => connectWS(email, callbacks), 5000);
  });

  ws.on("error", (err) => {
    error("WebSocket encountered an error", err as Error);
  });

  return ws;
}
