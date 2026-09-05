import { useState, useCallback, useEffect } from 'react';

export function useCamera(facingMode: 'user' | 'environment' = 'user') {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  const start = useCallback(async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode },
        audio: false,
      });
      setStream(mediaStream);
      setReady(true);
      setError(null);
      return mediaStream;
    } catch (err: any) {
      setError(err.message || 'Camera access denied');
      setReady(false);
      return null;
    }
  }, [facingMode]);

  const stop = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
      setStream(null);
      setReady(false);
    }
  }, [stream]);

  useEffect(() => {
    return () => stop();
  }, [stop]);

  return { stream, error, ready, start, stop };
}
