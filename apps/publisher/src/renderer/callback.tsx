// src/renderer/callback.tsx
import React, { useEffect } from 'react';
import { createRoot } from 'react-dom/client';

declare global {
  interface Window {
    electronAPI: {
      exchangeAuthCode: (code: string, verifier: string) => Promise<void>;
    };
  }
}

const Callback: React.FC = () => {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const error = params.get('error');
    const verifier = localStorage.getItem('pkce_verifier');

    // If there's an OAuth error or missing data, go back to the login page
    if (error || !code || !verifier) {
      window.location.href = '/';
      return;
    }

    // Exchange the auth code for tokens, then close the window
    window.electronAPI
      .exchangeAuthCode(code, verifier)
      .then(() => {
        window.close();
      })
      .catch(() => {
        // On failure, redirect back to login
        window.location.href = '/';
      });
  }, []);

  return (
    <div style={{ padding: 20, fontFamily: 'sans-serif' }}>
      Processing authentication…
    </div>
  );
};

const container = document.getElementById('root')!;
createRoot(container).render(<Callback />);
