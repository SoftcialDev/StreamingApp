/**
 * After Cognito Hosted UI redirect, parse the URL hash for the access_token
 * and send it to the main process via IPC.
 */

import React, { useEffect } from "react";
import { createRoot } from "react-dom/client";
import qs from "qs";

declare global {
  interface Window {
    electronAPI: { sendCognitoToken(token: string): Promise<void> };
  }
}

const Callback: React.FC = () => {
  useEffect(() => {
    const hash = window.location.hash.replace(/^#/, "");
    const params = qs.parse(hash);
    const token = params.access_token as string | undefined;
    if (token) {
      window.electronAPI.sendCognitoToken(token).then(() => {
        window.close();
      });
    } else {
      // If no token, redirect back to login
      window.location.replace("index.html");
    }
  }, []);

  return <div style={{ padding: 20 }}>Processing login…</div>;
};

const container = document.getElementById("root")!;
createRoot(container).render(<Callback />);
