/**
 * WebSocket client to subscribe for punch-in/out events.
 */
import WebSocket from "ws";
import Store from "electron-store";

interface Callbacks {
  onIn(): void;
  onOut(): void;
}

export function connectWS(email: string, callbacks: Callbacks): WebSocket {
  const apiUrl = process.env.API_WS_URL!;
  const ws = new WebSocket(`${apiUrl}?email=${encodeURIComponent(email)}`);

  ws.on("open", () => console.log("✅ WebSocket connected"));
  ws.on("message", (msg) => {
    try {
      const { action } = JSON.parse(msg.toString());
      if (action === "in") callbacks.onIn();
      else if (action === "out") callbacks.onOut();
    } catch (e) {
      console.error("Failed to parse WS message", e);
    }
  });
  ws.on("close", () => {
    console.warn("⚠️ WS closed, retrying in 5s");
    setTimeout(() => connectWS(email, callbacks), 5000);
  });

  return ws;
}
