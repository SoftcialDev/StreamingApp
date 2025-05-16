// src/pages/Callback/Callback.tsx

import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import qs from "qs";

import { useAuthStore, AuthState } from "@/store/auth";

/**
 * Callback page for AWS Cognito Hosted UI.
 *
 * Parses the URL hash for the `access_token`, stores it in Zustand,
 * and redirects to the Dashboard. Falls back to Login on error.
 */
const Callback: React.FC = () => {
  const navigate = useNavigate();

  // Select the setToken action from the auth store with proper typing
  const setToken = useAuthStore((state: AuthState) => state.setToken);

  useEffect(() => {
    // Remove leading '#' from URL hash
    const hash = window.location.hash.replace(/^#/, "");
    // Parse parameters like "access_token=...&id_token=..."
    const params = qs.parse(hash);
    const token = params.access_token as string | undefined;

    if (token) {
      // Store the JWT in global state
      setToken(token);
      // Navigate to the protected dashboard
      navigate("/dashboard");
    } else {
      // If no token, redirect back to login
      navigate("/login");
    }
  }, [navigate, setToken]);

  return (
    <div className="flex items-center justify-center h-full">
      <p className="text-lg">Processing login…</p>
    </div>
  );
};

export default Callback;
