import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../lib/api';

interface User {
  user_id: string;
  email: string;
  role: string;
  access_token: string;
}

interface AuthState {
  user: User | null;
  setUser: (user: User | null) => void;
  logout: () => Promise<void>;
  isAdmin: () => boolean;
  isApplicant: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      setUser: (user) => set({ user }),
      logout: async () => {
        try { await api.post('/auth/logout'); } catch {}
        set({ user: null });
      },
      isAdmin: () => ['admin', 'staff'].includes(get().user?.role ?? ''),
      isApplicant: () => get().user?.role === 'applicant',
    }),
    { name: 'zanajira-auth' }
  )
);
