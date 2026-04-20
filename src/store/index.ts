import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '@/types';
import { disconnectSocket } from '@/lib/socket';

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  // Actions
  setAuth: (token: string, user: User) => void;
  setUser: (user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isAuthenticated: false,

      setAuth: (token, user) => {
        if (typeof window !== 'undefined') {
          localStorage.setItem('sm_token', token);
        }
        set({ token, user, isAuthenticated: true });
      },

      setUser: (user) => set({ user }),

      logout: () => {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('sm_token');
        }
        disconnectSocket();
        set({ token: null, user: null, isAuthenticated: false });
      },
    }),
    {
      name: 'skillmatch-auth',
      partialize: (state) => ({ token: state.token, user: state.user }),
      onRehydrateStorage: () => (state) => {
        if (state?.token) {
          state.isAuthenticated = true;
        }
      },
    }
  )
);

// ─── Discovery stack store ────────────────────────────────────────────────────

import { DiscoveryCandidate, LookingForType } from '@/types';

interface DiscoveryState {
  stack: DiscoveryCandidate[];
  currentIndex: number;
  filter: LookingForType | undefined;
  isLoading: boolean;
  // Actions
  setStack: (stack: DiscoveryCandidate[]) => void;
  appendStack: (candidates: DiscoveryCandidate[]) => void;
  advanceStack: () => void;
  setFilter: (filter: LookingForType | undefined) => void;
  setLoading: (v: boolean) => void;
  reset: () => void;
}

export const useDiscoveryStore = create<DiscoveryState>()((set) => ({
  stack: [],
  currentIndex: 0,
  filter: undefined,
  isLoading: false,

  setStack: (stack) => set({ stack, currentIndex: 0 }),
  appendStack: (candidates) =>
    set((s) => ({ stack: [...s.stack, ...candidates] })),
  advanceStack: () => set((s) => ({ currentIndex: s.currentIndex + 1 })),
  setFilter: (filter) => set({ filter, stack: [], currentIndex: 0 }),
  setLoading: (isLoading) => set({ isLoading }),
  reset: () => set({ stack: [], currentIndex: 0 }),
}));
