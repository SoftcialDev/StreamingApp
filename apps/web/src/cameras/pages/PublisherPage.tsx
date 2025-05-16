// src/cameras/pages/PublisherPage.tsx
import React from "react";
import { useKvsPublisher } from "../hooks/useKvsPublisher";

// Ya no recibe props
export function PublisherPage() {
  // Generamos o recuperamos un clientId estable en localStorage
  const clientId = React.useRef(
    localStorage.getItem("publisherId")
      ?? (() => {
        const id = crypto.randomUUID();
        localStorage.setItem("publisherId", id);
        return id;
      })()
  ).current;

  // Usamos el hook que monta el preview y devuelve un "stop"
  const { videoRef, stop } = useKvsPublisher("my-channel", clientId);

  return (
    <div className="p-4">
      <h1 className="text-xl mb-4">Camera Publisher</h1>
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        className="w-64 h-auto border rounded shadow"
      />
      <button
        onClick={stop}
        className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
      >
        Stop Streaming
      </button>
    </div>
  );
}
