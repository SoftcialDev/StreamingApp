// src/hooks/useKvsPublisher.ts
import { useEffect, useRef, useCallback } from "react";
import { startPublisher } from "../../services/kvs/index";

export function useKvsPublisher(channel: string, clientId: string) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const handleRef = useRef<{
    pc: RTCPeerConnection;
    ws: WebSocket;
    stream: MediaStream;
  } | null>(null);

  useEffect(() => {
    let mounted = true;
    console.log(`[useKvsPublisher] mounting publisher for channel=${channel} clientId=${clientId}`);

    (async () => {
      if (!videoRef.current) {
        console.warn("[useKvsPublisher] videoRef not set");
        return;
      }
      try {
        const handle = await startPublisher(channel, videoRef.current, clientId);
        console.log("[useKvsPublisher] startPublisher resolved:", handle);
        if (mounted) {
          handleRef.current = handle;
          console.log("[useKvsPublisher] publisher is now live");
        } else {
          console.log("[useKvsPublisher] unmounted before connect, cleaning up");
          handle.ws.close();
          handle.pc.getSenders().forEach(s => s.track?.stop());
          handle.pc.close();
        }
      } catch (err) {
        console.error("[useKvsPublisher] startPublisher error:", err);
      }
    })();

    return () => {
      mounted = false;
      console.log("[useKvsPublisher] cleanup");
      const h = handleRef.current;
      if (h) {
        h.ws.close();
        h.pc.getSenders().forEach(s => s.track?.stop());
        h.pc.close();
        console.log("[useKvsPublisher] closed WS, stopped tracks and PC");
      }
    };
  }, [channel, clientId]);

  const stop = useCallback(() => {
    console.log("[useKvsPublisher] manual stop");
    const h = handleRef.current;
    if (h) {
      h.ws.close();
      h.pc.getSenders().forEach(s => s.track?.stop());
      h.pc.close();
      handleRef.current = null;
      console.log("[useKvsPublisher] stopped streaming");
    }
  }, []);

  return { videoRef, stop };
}
