// src/components/CameraTile.tsx
import React from "react";
import { useKvsViewer } from "../hooks/useKvsViewer";
interface CameraTileProps {
  channel: string;
}

export const CameraTile: React.FC<CameraTileProps> = ({ channel }) => {
  const { videoRef } = useKvsViewer(channel);

  return (
    <div className="bg-gray-900 rounded shadow overflow-hidden">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full aspect-video bg-black"
      />
    </div>
  );
};
