import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  actions: {
    setTokens: (tokens: { accessToken: string; refreshToken: string }) => void;
    clearTokens: () => void;
  };
}

export const useAuthStore = create<AuthState>()(
  immer((set) => ({
    accessToken: null,
    refreshToken: null,
    actions: {
      setTokens: (tokens) =>
        set((state) => {
          state.accessToken = tokens.accessToken;
          state.refreshToken = tokens.refreshToken;
        }),
      clearTokens: () =>
        set((state) => {
          state.accessToken = null;
          state.refreshToken = null;
        }),
    },
  }))
);
