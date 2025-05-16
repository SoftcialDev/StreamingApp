/**
 * vite.config.ts
 *
 * Vite configuration for React + TypeScript.
 * Loads environment variables prefixed with VITE_ for config.
 */

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@/": path.resolve(__dirname, "src") + "/"
    }
  },
  server: {
    port: 3000,
    proxy: {
      // Proxy API calls to your backend during development
      "/streams": "http://localhost:4000",
      "/auth":    "http://localhost:4000"
    }
  }
});
