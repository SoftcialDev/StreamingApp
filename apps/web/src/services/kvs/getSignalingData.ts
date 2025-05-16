// src/services/kvs/getSignalingData.ts

const BACKEND = import.meta.env.VITE_BACKEND_URL!;

export type Role = "MASTER" | "VIEWER";

export interface SignalingInfo {
  wssSignedUrl: string;
  iceServers: RTCIceServer[];
}

/**
 * Llama a GET /signaling?channel=…&role=…&clientId=…
 */
export async function getSignalingData(
  channel: string,
  role: Role,
  clientId: string
): Promise<SignalingInfo> {
  const params = new URLSearchParams({ channel, role, clientId });
  const res = await fetch(`${BACKEND}/signaling?${params.toString()}`);
  if (!res.ok) {
    throw new Error(`Signaling error ${res.status}: ${res.statusText}`);
  }
  return res.json();
}
