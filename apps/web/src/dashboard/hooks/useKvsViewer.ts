// src/hooks/useKvsViewer.ts
import { useEffect, useRef } from "react";
import { startViewer } from "../../services/kvs/index";

export function useKvsViewer(channel: string) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const handleRef = useRef<{ pc: RTCPeerConnection; ws: WebSocket } | null>(null);

  useEffect(() => {
    let mounted = true;
    const viewerId = `viewer-${Date.now()}`;
    console.log(`[useKvsViewer] mounting viewer for channel=${channel} id=${viewerId}`);

    (async () => {
      if (!videoRef.current) {
        console.warn("[useKvsViewer] videoRef not set");
        return;
      }
      try {
        const handle = await startViewer(channel, videoRef.current, viewerId);
        console.log("[useKvsViewer] startViewer resolved:", handle);
        if (mounted) {
          handleRef.current = handle;
          console.log("[useKvsViewer] viewer is now live");
        } else {
          console.log("[useKvsViewer] unmounted before connect, cleaning up");
          handle.ws.close();
          handle.pc.close();
        }
      } catch (err) {
        console.error("[useKvsViewer] startViewer error:", err);
      }
    })();

    return () => {
      mounted = false;
      console.log("[useKvsViewer] cleanup");
      const h = handleRef.current;
      if (h) {
        h.ws.close();
        h.pc.close();
        console.log("[useKvsViewer] closed WS & PC");
      }
    };
  }, [channel]);

  return { videoRef };
}
