import { create } from 'zustand';
import api from '../lib/api';

interface ProfileSection {
  key: string;
  label: string;
  completed: boolean;
}

interface ProfileState {
  completionPct: number;
  sections: ProfileSection[];
  loading: boolean;
  fetchCompletion: () => Promise<void>;
  markSectionComplete: (key: string) => void;
  markSectionIncomplete: (key: string) => void;
}

export const useProfileStore = create<ProfileState>()((set, get) => ({
  completionPct: 0,
  sections: [],
  loading: false,
  fetchCompletion: async () => {
    set({ loading: true });
    try {
      const { data } = await api.get('/applicants/me/completion');
      set({
        completionPct: data.completion_pct,
        sections: data.sections ?? [],
        loading: false,
      });
    } catch {
      set({ loading: false });
    }
  },
  markSectionComplete: (key) => {
    set(state => ({
      sections: state.sections.map(s =>
        s.key === key ? { ...s, completed: true } : s
      ),
    }));
    const sections = get().sections;
    const completed = sections.filter(s => s.completed).length;
    if (sections.length > 0) set({ completionPct: Math.round((completed / sections.length) * 100) });
  },
  markSectionIncomplete: (key) => {
    set(state => ({
      sections: state.sections.map(s =>
        s.key === key ? { ...s, completed: false } : s
      ),
    }));
    const sections = get().sections;
    const completed = sections.filter(s => s.completed).length;
    if (sections.length > 0) set({ completionPct: Math.round((completed / sections.length) * 100) });
  },
}));