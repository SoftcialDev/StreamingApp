/**
 * Expose a safe IPC surface to the renderer.
 */
import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("electronAPI", {
  // Send the Cognito access token from renderer to main
  sendCognitoToken: (token: string) =>
    ipcRenderer.invoke("save-cognito-token", token),
});
