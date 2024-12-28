import { create, StateCreator } from "zustand";
import type { AuthState } from "@/types/auth";

type AuthStore = StateCreator<AuthState>;

const createAuthStore: AuthStore = (set) => ({
  user: null,
  loading: false,
  error: null,
  setUser: (user) => set({ user }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  reset: () => set({ user: null, loading: false, error: null }),
});

export const useAuthStore = create(createAuthStore);
