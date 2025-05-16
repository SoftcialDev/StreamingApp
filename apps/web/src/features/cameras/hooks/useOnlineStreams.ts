/**
 * src/features/cameras/hooks/useOnlineStreams.ts
 *
 * Hook to fetch the list of online streams from the API.
 * Uses the auth token from Zustand and returns streams + a refresh function.
 */

import { useState, useEffect, useCallback } from "react";
import { config } from "../../../config";


export interface OnlineStream {
  employeeId: string;
  hlsUrl: string;
}

export function useOnlineStreams(token: string) {
  const [streams, setStreams] = useState<OnlineStream[]>([]);

  const fetchStreams = useCallback(async () => {
    try {
      const res = await fetch(`${config.apiBaseUrl}/streams/online`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setStreams(data);
      } else {
        setStreams([]);
      }
    } catch {
      setStreams([]);
    }
  }, [token]);

  useEffect(() => {
    if (token) fetchStreams();
  }, [token, fetchStreams]);

  return {
    streams,
    refresh: fetchStreams
  };
}
