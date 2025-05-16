// src/store/useAppStore.ts
import { create } from 'zustand';

type ConnectionStatus = 'connected' | 'disconnected';

interface AppState {
  activeCameras: string[];
  setActiveCameras: (cameras: string[]) => void;

  connectionStatus: Record<string, ConnectionStatus>;
  updateConnectionStatus: (clientId: string, status: ConnectionStatus) => void;
}

export const useAppStore = create<AppState>((set: (partial: Partial<AppState> | ((state: AppState) => Partial<AppState>)) => void) => ({
  activeCameras: [],
  setActiveCameras: (cameras: string[]) => set({ activeCameras: cameras }),

  connectionStatus: {},
  updateConnectionStatus: (clientId: string, status: ConnectionStatus) =>
    set((state) => ({
      connectionStatus: {
        ...state.connectionStatus,
        [clientId]: status,
      },
    })),
}));
