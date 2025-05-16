/**
 * src/config/index.ts
 *
 * Centralized configuration for the web app, reading from Vite environment variables.
 * Follows the VITE_ naming convention for client‐side safety.
 */

export interface AppConfig {
  apiBaseUrl: string;
  cognitoDomain: string;
  cognitoClientId: string;
}

export const config: AppConfig = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || "http://localhost:4000",
  cognitoDomain: import.meta.env.VITE_COGNITO_DOMAIN || "",
  cognitoClientId: import.meta.env.VITE_COGNITO_CLIENT_ID || ""
};
