import { useCallback, useEffect, useRef, useState } from 'react';

export function useCamera(facingMode: 'environment' | 'user' = 'environment') {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isActive, setIsActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const start = useCallback(async () => {
    try {
      setError(null);
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode,
        },
      });
      setStream(mediaStream);
      setIsActive(true);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      return mediaStream;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Camera access failed';
      setError(msg);
      setIsActive(false);
      return null;
    }
  }, [facingMode]);

  const stop = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
      setIsActive(false);
    }
  }, [stream]);

  const captureFrame = useCallback((): string | null => {
    if (!videoRef.current || !isActive) return null;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg', 0.95);
  }, [isActive]);

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [stream]);

  return {
    videoRef,
    stream,
    error,
    isActive,
    start,
    stop,
    captureFrame,
  };
}

export function useDocumentCamera() {
  const camera = useCamera('environment');
  const capture = useCallback(() => camera.captureFrame(), [camera]);
  return { ...camera, capture };
}

export function useFaceCamera() {
  const camera = useCamera('user');
  const capture = useCallback(() => camera.captureFrame(), [camera]);
  return { ...camera, capture };
}
