/**
 * Centralized configuration for the web app, reading
 * from Vite environment variables (client-safe VITE_*).
 */
export interface AppConfig {
  apiBaseUrl: string;
  cognitoDomain: string;
  cognitoClientId: string;
  cognitoUserPoolId: string;
}

// Export a single `config` object
export const config: AppConfig = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || "http://localhost:4000",
  cognitoDomain: import.meta.env.VITE_COGNITO_DOMAIN || "",
  cognitoClientId: import.meta.env.VITE_COGNITO_CLIENT_ID || "",
  cognitoUserPoolId: import.meta.env.VITE_COGNITO_USER_POOL_ID || ""
};
