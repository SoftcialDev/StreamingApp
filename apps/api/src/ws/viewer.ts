// apps/api/src/ws/viewer.ts
import { WebSocket } from "ws";
import { getSignalingInfo } from "../utils/awsSigner";

export default async function setupViewerWs(wsClient: WebSocket, req: any) {
  const url      = new URL(req.url!, `http://${req.headers.host}`);
  const clientId = url.searchParams.get("clientId");
  if (!clientId) {
    console.error("[WS viewer] Missing clientId");
    return wsClient.close();
  }

  // VIEWER role + clientId
  let wssSignedUrl: string, iceServers: any[];
  try {
    ({ wssSignedUrl, iceServers } = await getSignalingInfo(clientId, "VIEWER", clientId));
  } catch (err) {
    console.error("[WS viewer] signer failed:", err);
    return wsClient.close();
  }

  // 1) Envía ICE servers al browser
  wsClient.send(JSON.stringify({ type: "iceServers", iceServers }));

  // 2) Abre WS hacia AWS con sub-protocolo KVS
  const wsAws = new WebSocket(
    wssSignedUrl,
    "kinesis-video-signaling-javascript"
  );

  // 3) Buffer client→AWS
  const pending: any[] = [];
  wsAws.on("open", () => {
    pending.forEach(m => wsAws.send(m));
    pending.length = 0;
    wsClient.on("message", msg => wsAws.send(msg));
  });
  wsClient.on("message", msg => {
    if (wsAws.readyState === wsAws.OPEN) wsAws.send(msg);
    else pending.push(msg);
  });

  // 4) Proxy AWS→browser
  wsAws.on("message", msg => wsClient.send(msg));

  // 5) Cleanup
  const cleanup = () => { wsClient.close(); wsAws.close(); };
  wsClient.on("close", cleanup);
  wsAws.on("close", cleanup);
  wsAws.on("error", cleanup);
}
