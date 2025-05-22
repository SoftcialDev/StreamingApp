/**
 * Generates a PKCE code verifier and its corresponding S256 code challenge.
 */

import pkceChallenge from 'pkce-challenge';

export interface PKCECodes {
  /** High-entropy random string used as the code verifier */
  verifier: string;
  /** Base64-URL-encoded SHA256 hash of the verifier, sent as code_challenge */
  challenge: string;
}

/**
 * Creates a new pair of code_verifier and code_challenge.
 */
export async function generatePKCECodes(): Promise<PKCECodes> {
  const { code_verifier, code_challenge } = await pkceChallenge();
  console.log('[preload] code_verifier:', code_verifier);
  return { verifier: code_verifier, challenge: code_challenge };
}
