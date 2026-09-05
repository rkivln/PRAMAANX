import { create } from 'zustand';

interface AuthState {
  officer: any;
  checkpoint: any;
  setOfficer: (officer: any) => void;
  setCheckpoint: (checkpoint: any) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set: any) => ({
  officer: null,
  checkpoint: null,
  setOfficer: (officer) => set({ officer }),
  setCheckpoint: (checkpoint) => set({ checkpoint }),
  logout: () => set({ officer: null, checkpoint: null }),
}));
