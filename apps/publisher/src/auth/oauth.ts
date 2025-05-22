/**
 * Exchanges an OAuth2 authorization code + PKCE verifier for tokens.
 */

import axios from "axios";
import { CognitoConfig } from "./config";

export interface TokenResponse {
  id_token:     string;
  access_token: string;
  refresh_token?: string;
  expires_in:   number;
  token_type:   string;
}

/**
 * Exchange the authorization code for tokens.
 * @param code     - Authorization code from Hosted UI
 * @param verifier - PKCE code verifier
 */
export async function exchangeAuthCodeForTokens(
  code: string,
  verifier: string
): Promise<TokenResponse> {
  const url = `https://${CognitoConfig.hostedUIDomain}/oauth2/token`;
  const body = new URLSearchParams({
    grant_type:    "authorization_code",
    client_id:     CognitoConfig.userPoolClientId,
    redirect_uri:  CognitoConfig.redirectUri,
    code,
    code_verifier: verifier
  });

  try {
    console.log("→ Token request URL:", url);
    console.log("→ Token request body:", body.toString());
    const response = await axios.post<TokenResponse>(
      url,
      body.toString(),
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );
    console.log("✅ Token response:", response.data);
    return response.data;
  } catch (err: any) {
    // axios lanza aquí en caso de status !== 2xx
    console.error("❌ Token exchange error:", err.message);
    if (err.response) {
      console.error("Status:", err.response.status);
      console.error("Response data:", err.response.data);
    }
    throw err;  // re-lanza para que el caller también lo capture
  }
}
