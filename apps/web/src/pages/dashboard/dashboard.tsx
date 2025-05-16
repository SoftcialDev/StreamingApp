/**
 * src/pages/Dashboard/Dashboard.tsx
 *
 * Renders the grid of live camera streams with HLS players
 * and “Chat in Teams” buttons for each employee.
 */

import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/auth";
import Button from "@/components/ui/button";
import CameraTile from "@/features/cameras/components/CameraTile";
import { useOnlineStreams } from "@/features/cameras/hooks/useOnlineStreams";


const Dashboard: React.FC = () => {
  const token = useAuthStore((s) => s.token);
  const navigate = useNavigate();
  const { streams, refresh } = useOnlineStreams(token);

  // Redirect to login if no token
  useEffect(() => {
    if (!token) navigate("/login");
  }, [token, navigate]);

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Live Streams</h1>
        <Button onClick={refresh}>Refresh</Button>
      </div>
      {streams.length === 0 ? (
        <p>No one is streaming right now.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {streams.map((s) => (
            <CameraTile
              key={s.employeeId}
              employeeId={s.employeeId}
              hlsUrl={s.hlsUrl}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
