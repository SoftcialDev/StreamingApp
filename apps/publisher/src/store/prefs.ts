/**
 * Electron-store wrapper for persistent prefs.
 * Stores the Cognito token and derived email.
 */
import Store from "electron-store";

interface PrefsSchema {
  token?: string;
  email?: string;
}

export const prefs = new Store<PrefsSchema>({
  name: "publisher-prefs",
  defaults: {
    token: undefined,
    email: undefined
  }
});

/** Save the Cognito JWT */
export function saveToken(token: string) {
  prefs.set("token", token);
}

/** Retrieve the saved Cognito JWT */
export function getToken(): string | undefined {
  return prefs.get("token");
}

/** Save the user’s email (from the ID token) */
export function saveEmail(email: string) {
  prefs.set("email", email);
}

/** Retrieve the saved email */
export function getEmail(): string | undefined {
  return prefs.get("email");
}
