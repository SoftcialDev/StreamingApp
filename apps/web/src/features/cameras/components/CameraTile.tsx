/**
 * src/features/cameras/components/CameraTile.tsx
 *
 * Displays a single camera’s HLS stream in a video element,
 * with a “Chat in Teams” button for that employee.
 */

import React from "react";

interface CameraTileProps {
  employeeId: string;
  hlsUrl: string;
}

const CameraTile: React.FC<CameraTileProps> = ({ employeeId, hlsUrl }) => {
  const teamsLink = `https://teams.microsoft.com/l/chat/0/0?users=${encodeURIComponent(employeeId)}`;

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <video
        className="w-full h-48 object-cover"
        controls
        src={hlsUrl}
      />
      <div className="p-4">
        <h2 className="font-semibold mb-2">{employeeId}</h2>
        <a
          href={teamsLink}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
        >
          Chat in Teams
        </a>
      </div>
    </div>
  );
};

export default CameraTile;
