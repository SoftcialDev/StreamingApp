declare module 'pkce-challenge' {
  /** The pair returned by calling the default export */
  export interface PKCEPair {
    code_verifier: string;
    code_challenge: string;
  }

  /**
   * Generate a PKCE code_verifier and code_challenge.
   * Returns a Promise because it uses WebCrypto under the hood.
   * @param length - Optional length for the code_verifier
   */
  export default function pkceChallenge(
    length?: number
  ): Promise<PKCEPair>;

  /** Verify that a given verifier matches its challenge */
  export function verifyChallenge(
    verifier: string,
    challenge: string
  ): Promise<boolean>;

  /** Generate a code_challenge from an existing verifier */
  export function generateChallenge(
    verifier: string
  ): Promise<string>;
}
