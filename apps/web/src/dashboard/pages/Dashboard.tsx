// src/pages/Dashboard.tsx
import React, { useEffect, useState } from "react";
import { CameraTile } from "../components/CameraTile";

export const DashboardPage: React.FC = () => {
  const [channels, setChannels] = useState<string[]>([]);
  const BACKEND = import.meta.env.VITE_BACKEND_URL!;

  useEffect(() => {
    const fetchStreams = async () => {
      try {
        const list = await fetch(`${BACKEND}/streams`).then((r) => r.json());
        setChannels(list);
      } catch (e) {
        console.error("Failed to fetch streams:", e);
      }
    };
    fetchStreams();
    const iv = setInterval(fetchStreams, 10_000);
    return () => clearInterval(iv);
  }, []);

  if (channels.length === 0) {
    return <p className="p-4 text-gray-500">No active streams</p>;
  }

  return (
    <div className="p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {channels.map((ch) => (
        <CameraTile key={ch} channel={ch} />
      ))}
    </div>
  );
};
