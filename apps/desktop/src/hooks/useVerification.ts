import { useCallback } from 'react';
import { useVerificationStore } from '@/store/verification';
import { useAuthStore } from '@/store/auth';

export function useVerification() {
  const {
    verificationId,
    currentStep,
    result,
    docImage,
    docPhoto,
    faceImage,
    isProcessing,
    setVerificationId,
    setStep,
    setResult,
    setDocImage,
    setDocPhoto,
    setFaceImage,
    setIsProcessing,
    reset,
  } = useVerificationStore();

  const { checkpoint, officer } = useAuthStore();

  const generateVerificationId = useCallback(() => {
    const d = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const s = String(Math.floor(Math.random() * 900 + 100)).padStart(5, '0');
    return `VR-${d}-${s}`;
  }, []);

  const startVerification = useCallback(() => {
    const vid = generateVerificationId();
    setVerificationId(vid);
    setStep(1);
    setResult(null);
    setDocImage(null);
    setDocPhoto(null);
    setFaceImage(null);
    setIsProcessing(false);
  }, [generateVerificationId, setVerificationId, setStep, setResult, setDocImage, setDocPhoto, setFaceImage, setIsProcessing]);

  const goToStep = useCallback((step: number) => {
    setStep(step as 1 | 2 | 3 | 4 | 5);
  }, [setStep]);

  const completeVerification = useCallback(() => {
    setIsProcessing(false);
  }, [setIsProcessing]);

  const cancelVerification = useCallback(() => {
    reset();
  }, [reset]);

  return {
    verificationId,
    currentStep,
    result,
    docImage,
    docPhoto,
    faceImage,
    isProcessing,
    checkpoint: checkpoint || null,
    officer: officer || null,
    startVerification,
    goToStep,
    completeVerification,
    cancelVerification,
    setVerificationId,
    setStep,
    setResult,
    setDocImage,
    setDocPhoto,
    setFaceImage,
    setIsProcessing,
  };
}
