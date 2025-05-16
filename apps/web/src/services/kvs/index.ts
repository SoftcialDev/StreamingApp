// src/services/kvs/index.ts

import { createKvsConnection } from "./connection";

const BACKEND = import.meta.env.VITE_BACKEND_URL!;

export interface PublisherHandle {
  pc: RTCPeerConnection;
  ws: WebSocket;
  stream: MediaStream;
}
export interface ViewerHandle {
  pc: RTCPeerConnection;
  ws: WebSocket;
}

/**
 * Inicia la publicación (MASTER):
 * 1) Registra en /streams/register → obtiene connectionId.
 * 2) Pide getUserMedia + lo asigna al <video>.
 * 3) Crea la conexión KVS.
 */
export async function startPublisher(
  channel: string,
  videoEl: HTMLVideoElement,
  clientId: string
): Promise<PublisherHandle> {
  const res = await fetch(`${BACKEND}/streams/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ clientId }),
  });
  const { connectionId } = await res.json();

  const stream = await navigator.mediaDevices.getUserMedia({ video: true });
  videoEl.srcObject = stream;

  const { pc, ws } = await createKvsConnection(
    connectionId,
    "MASTER",
    clientId,
    stream.getVideoTracks()
  );

  return { pc, ws, stream };
}

/**
 * Inicia el visor (VIEWER):
 * 1) Toma channel (=connectionId) que ya existe.
 * 2) Crea la conexión KVS y asigna el stream remoto al <video>.
 */
export async function startViewer(
  channel: string,
  videoEl: HTMLVideoElement,
  viewerId: string
): Promise<ViewerHandle> {
  const { pc, ws } = await createKvsConnection(
    channel,
    "VIEWER",
    viewerId,
    [],
    (remote) => {
      videoEl.srcObject = remote;
    }
  );
  return { pc, ws };
}
