// apps/web/src/services/streamService.ts
import axios from "axios";

const API = import.meta.env.VITE_API_BASE_URL;

/** Shapes of the JSON responses */
interface RegisterResponse { streamArn: string; }
interface OnlineStream { email: string; hlsUrl: string; }

/**
 * Register the current user’s stream (creates or verifies the KVS stream).
 */
export async function registerStream(token: string): Promise<string> {
  const res = await axios.post<RegisterResponse>(
    `${API}/streams/register`,
    {},
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return res.data.streamArn;
}

/**
 * Fetch all online streams (email + HLS URL).
 */
export async function listOnlineStreams(
  token: string
): Promise<OnlineStream[]> {
  const res = await axios.get<OnlineStream[]>(
    `${API}/streams/online`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return res.data;
}

/**
 * Unregister (stop) a user’s stream.
 */
export async function unregisterStream(
  token: string,
  email: string
): Promise<void> {
  await axios.post(
    `${API}/streams/unregister`,
    { email },
    { headers: { Authorization: `Bearer ${token}` } }
  );
}
