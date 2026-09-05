import { create } from 'zustand';

interface AppState {
  currentPage: string;
  setCurrentPage: (page: string) => void;
  lightbox: {
    open: boolean;
    src: string | null;
    title: string;
    type: string;
  };
  setLightbox: (lightbox: { open: boolean; src: string | null; title: string; type: string }) => void;
  reportModal: {
    open: boolean;
    verificationId: string | null;
  };
  setReportModal: (reportModal: { open: boolean; verificationId: string | null }) => void;
  exportMenuOpen: boolean;
  setExportMenuOpen: (open: boolean) => void;
}

export const useAppStore = create<AppState>((set: any) => ({
  currentPage: 'login',
  setCurrentPage: (currentPage) => set({ currentPage }),
  lightbox: {
    open: false,
    src: null,
    title: '',
    type: '',
  },
  setLightbox: (lightbox) => set({ lightbox }),
  reportModal: {
    open: false,
    verificationId: null,
  },
  setReportModal: (reportModal) => set({ reportModal }),
  exportMenuOpen: false,
  setExportMenuOpen: (exportMenuOpen) => set({ exportMenuOpen }),
}));
