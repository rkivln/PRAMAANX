import { create } from 'zustand';
import { VerificationResult } from '@/types';

type VerificationStep = 0 | 1 | 2 | 3 | 4 | 5;

interface VerificationState {
  verificationId: string | null;
  currentStep: VerificationStep;
  result: VerificationResult | null;
  docImage: string | null;
  docPhoto: string | null;
  faceImage: string | null;
  docStream: MediaStream | null;
  faceStream: MediaStream | null;
  isProcessing: boolean;
  setVerificationId: (id: string | null) => void;
  setStep: (step: VerificationStep) => void;
  setResult: (result: VerificationResult | null) => void;
  setDocImage: (image: string | null) => void;
  setDocPhoto: (photo: string | null) => void;
  setFaceImage: (image: string | null) => void;
  setDocStream: (stream: MediaStream | null) => void;
  setFaceStream: (stream: MediaStream | null) => void;
  setIsProcessing: (processing: boolean) => void;
  startVerification: () => void;
  goToStep: (step: number) => void;
  completeVerification: () => void;
  cancelVerification: () => void;
  reset: () => void;
}

export const useVerificationStore = create<VerificationState>((set: any) => ({
  verificationId: null,
  currentStep: 0,
  result: null,
  docImage: null,
  docPhoto: null,
  faceImage: null,
  docStream: null,
  faceStream: null,
  isProcessing: false,

  setVerificationId: (verificationId) => set({ verificationId }),
  setStep: (currentStep) => set({ currentStep }),
  setResult: (result) => set({ result }),
  setDocImage: (docImage) => set({ docImage }),
  setDocPhoto: (docPhoto) => set({ docPhoto }),
  setFaceImage: (faceImage) => set({ faceImage }),
  setDocStream: (docStream) => set({ docStream }),
  setFaceStream: (faceStream) => set({ faceStream }),
  setIsProcessing: (isProcessing) => set({ isProcessing }),

  startVerification: () => {
    const d = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const s = String(Math.floor(Math.random() * 900 + 100)).padStart(5, '0');
    const vid = `VR-${d}-${s}`;
    set({ verificationId: vid, currentStep: 1, result: null, docImage: null, docPhoto: null, faceImage: null, isProcessing: false });
  },

  goToStep: (step: number) => set({ currentStep: step as VerificationStep }),

  completeVerification: () => set({ isProcessing: false }),

  cancelVerification: () => set({
    verificationId: null,
    currentStep: 0,
    result: null,
    docImage: null,
    docPhoto: null,
    faceImage: null,
    docStream: null,
    faceStream: null,
    isProcessing: false,
  }),

  reset: () => set({
    verificationId: null,
    currentStep: 0,
    result: null,
    docImage: null,
    docPhoto: null,
    faceImage: null,
    docStream: null,
    faceStream: null,
    isProcessing: false,
  }),
}));
