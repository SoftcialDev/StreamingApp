// src/services/kvs/connection.ts

import { getSignalingData, Role } from "./getSignalingData";

export interface KvsConnection {
  pc: RTCPeerConnection;
  ws: WebSocket;
}

/**
 * Crea PeerConnection + WS proxy registrado contra AWS KVS.
 */
export async function createKvsConnection(
  channel: string,
  role: Role,
  clientId: string,
  localTracks: MediaStreamTrack[] = [],
  onRemoteStream: (stream: MediaStream) => void = () => {}
): Promise<KvsConnection> {
  // 1) Obtener datos de señalización (WSS + ICE)
  const { wssSignedUrl, iceServers } = await getSignalingData(channel, role, clientId);

  // 2) Configurar RTCPeerConnection
  const pc = new RTCPeerConnection({ iceServers });
  if (role === "MASTER") {
    localTracks.forEach((track) => pc.addTrack(track, new MediaStream([track])));
  } else {
    pc.addTransceiver("video", { direction: "recvonly" });
  }
  pc.ontrack = ({ streams: [remoteStream] }) => onRemoteStream(remoteStream);

  // 3) Abrir WebSocket a AWS con subprotocolo KVS
  const ws = new WebSocket(wssSignedUrl, "kinesis-video-signaling-javascript");

  // 4) Buffer ICE candidates hasta que WS abra
  const iceQueue: RTCIceCandidateInit[] = [];
  pc.onicecandidate = ({ candidate }) => {
    if (!candidate) return;
    const payload = JSON.stringify({ action: "ICE_CANDIDATE", candidate });
    if (ws.readyState === WebSocket.OPEN) ws.send(payload);
    else iceQueue.push(candidate.toJSON());
  };

  // 5) Cuando WS abra → vaciar buffer ICE + enviar SDP
  ws.onopen = async () => {
    iceQueue.forEach((c) =>
      ws.send(JSON.stringify({ action: "ICE_CANDIDATE", candidate: c }))
    );
    const desc =
      role === "MASTER" ? await pc.createAnswer() : await pc.createOffer();
    await pc.setLocalDescription(desc);
    ws.send(
      JSON.stringify({
        action: role === "MASTER" ? "SDP_ANSWER" : "SDP_OFFER",
        [role === "MASTER" ? "answer" : "offer"]: desc,
        clientId,
      })
    );
  };

  // 6) Procesar mensajes entrantes
  ws.onmessage = async (ev) => {
    const msg = JSON.parse(ev.data as string);
    if (msg.action === "SDP_OFFER" && role === "MASTER") {
      await pc.setRemoteDescription(msg.offer);
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      ws.send(JSON.stringify({ action: "SDP_ANSWER", answer, clientId }));
    } else if (msg.action === "SDP_ANSWER" && role === "VIEWER") {
      await pc.setRemoteDescription(msg.answer);
    } else if (msg.action === "ICE_CANDIDATE") {
      await pc.addIceCandidate(msg.candidate);
    }
  };

  ws.onerror = console.error;
  ws.onclose = () => pc.close();

  return { pc, ws };
}
