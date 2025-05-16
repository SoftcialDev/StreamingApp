// src/store/auth.ts

import { create } from "zustand";

export interface AuthState {
  /** The Cognito JWT access token */
  token: string;
  /** Store a new JWT into state */
  setToken: (token: string) => void;
  /** Clear the stored JWT */
  clearToken: () => void;
}

/**
 * Zustand store for authentication state.
 * Holds the JWT token and provides setters/clearer.
 */
export const useAuthStore = create<AuthState>((set) => ({
  token: "",

  setToken: (token: string) => {
    set({ token });
  },

  clearToken: () => {
    set({ token: "" });
  }
}));
