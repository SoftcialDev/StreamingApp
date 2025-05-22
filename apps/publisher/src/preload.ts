// src/preload.ts

/**
 * Preload script for Electron application.
 * Safely exposes a minimal API to the renderer via contextBridge.
 * Includes detailed logging for PKCE code generation and environment values.
 */

import { contextBridge, ipcRenderer } from 'electron';
import pkceChallenge from 'pkce-challenge';

contextBridge.exposeInMainWorld('electronAPI', {
  /**
   * Check whether an ID token is already stored in the main process.
   * @returns Promise that resolves to true if a token exists.
   */
  hasToken: (): Promise<boolean> =>
    ipcRenderer.invoke('hasToken'),

  /**
   * Persist the PKCE code_verifier in the main process store.
   * Must be called before redirecting to the authorization endpoint.
   * @param verifier - The PKCE code_verifier string.
   */
  saveVerifier: (verifier: string): Promise<void> =>
    ipcRenderer.invoke('saveVerifier', verifier),

  /**
   * Persist the Cognito ID token in the main process store.
   * @param token - The Cognito ID token.
   */
  sendCognitoToken: (token: string): Promise<void> =>
    ipcRenderer.invoke('saveCognitoToken', token),

  /**
   * Environment configuration variables made available to the renderer.
   */
  env: {
    /** Cognito Hosted UI domain */
    COGNITO_DOMAIN: process.env.COGNITO_DOMAIN!,
    /** Cognito App Client ID */
    COGNITO_CLIENT_ID: process.env.COGNITO_CLIENT_ID!,
    /** Cognito Identity Pool ID for AWS credentials */
    COGNITO_IDENTITY_POOL_ID: process.env.COGNITO_IDENTITY_POOL_ID!,
    /** OAuth2 Redirect URI (must match Cognito settings) */
    REDIRECT_URI: process.env.REDIRECT_URI ?? 'http://localhost:5000/callback',
    /** AWS region */
    AWS_REGION: process.env.AWS_REGION!,
    /** WebSocket API URL */
    API_WS_URL: process.env.API_WS_URL!,
    /** HTTP API URL for punch events */
    PUNCH_API_URL: process.env.PUNCH_API_URL!,
    /** SQS queue URL for punch events */
    PUNCH_QUEUE_URL: process.env.PUNCH_QUEUE_URL!,
    /** Identity Provider for Cognito Hosted UI */
    IDENTITY_PROVIDER: 'MicrosoftOIDC'
  },

  /**
   * Generate a PKCE code_verifier and code_challenge.
   * Uses WebCrypto under the hood; must await the async function.
   * @returns Promise resolving to { verifier, challenge }.
   */
  generatePKCECodes: async (): Promise<{ verifier: string; challenge: string }> => {
    console.log('[preload] Generating PKCE codes');
    const { code_verifier, code_challenge } = await pkceChallenge();
    console.log('[preload] code_verifier:', code_verifier);
    console.log('[preload] code_challenge:', code_challenge);
    return { verifier: code_verifier, challenge: code_challenge };
  },

  /**
   * Exchange the authorization code for tokens via the main process.
   * @param code - The OAuth2 authorization code.
   * @param verifier - The PKCE code_verifier previously saved.
   */
  exchangeAuthCode: (code: string, verifier: string): Promise<void> =>
    ipcRenderer.invoke('exchangeAuthCode', code, verifier)
});
