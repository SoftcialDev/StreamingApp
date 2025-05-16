/**
 * Electron Main Process:
 * - Creates windows for login redirect & callback
 * - Receives the access token via IPC
 * - Exchanges token for AWS creds & extracts email
 * - Boots WebSocket + GStreamer
 */

import { app, BrowserWindow, ipcMain } from "electron";
import path from "path";
import Store from "electron-store";
import { CognitoConfig } from "./auth/config";
import { getAwsCredentials } from "@streaming-app/common/src/auth/cognitoClient";
import { connectWS } from "./ws/client";
import { startPipeline, stopPipeline } from "./gst/pipeline";

interface StoreSchema {
  token?: string;
  email?: string;
}

const store = new Store<StoreSchema>();

let loginWindow: BrowserWindow | null;
let callbackWindow: BrowserWindow | null;

function createLoginWindow() {
  loginWindow = new BrowserWindow({
    width: 400,
    height: 300,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });
  loginWindow.loadFile(path.join(__dirname, "../public/index.html"));
}

function createCallbackWindow() {
  callbackWindow = new BrowserWindow({
    show: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });
  callbackWindow.loadFile(path.join(__dirname, "../public/callback.html"));
}

app.whenReady().then(() => {
  createLoginWindow();
});

// Handle token sent from callback renderer
ipcMain.handle("save-cognito-token", async (_evt, token: string) => {
  store.set("token", token);
  // Exchange Cognito token for AWS creds
  const creds = await getAwsCredentials(token);
  // Extract email from the Cognito ID token (assume it's in JWT payload)
  const payload = JSON.parse(Buffer.from(token.split(".")[1], "base64").toString());
  const email: string = payload.email;
  store.set("email", email);

  // Now that we have email + creds, start WebSocket listener + GStreamer on “in”
  const ws = connectWS(email, {
    onIn: () => startPipeline(email, creds),
    onOut: () => stopPipeline(),
  });

  // Close the login windows
  loginWindow?.close();
  callbackWindow?.close();

  return true;
});

// Quit when all windows closed (except on macOS)
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
