import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Camera, RefreshCw, CheckCircle, UserCheck, ArrowLeft, Video } from 'lucide-react';

interface StepFaceCaptureProps {
  onCaptureComplete: (faceDataUri: string) => void;
  onBackToDocument: () => void;
  initialFaceImage?: string;
  docImagePreview?: string;
}

export const StepFaceCapture: React.FC<StepFaceCaptureProps> = ({
  onCaptureComplete,
  onBackToDocument,
  initialFaceImage,
  docImagePreview
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const isAcquiringRef = useRef<boolean>(false);

  const [capturedFace, setCapturedFace] = useState<string | null>(initialFaceImage || null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch (e) {
          console.warn('Face track stop notice:', e);
        }
      });
      streamRef.current = null;
    }
    if (videoRef.current && videoRef.current.srcObject) {
      try {
        const s = videoRef.current.srcObject as MediaStream;
        s.getTracks().forEach((t) => t.stop());
      } catch (e) {
        console.warn('Video face stop notice:', e);
      }
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  }, []);

  const loadCameraDevices = async () => {
    try {
      if (!navigator.mediaDevices?.enumerateDevices) return;
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoInputs = devices.filter((d) => d.kind === 'videoinput');
      setVideoDevices(videoInputs);
      if (videoInputs.length > 0 && !selectedDeviceId) {
        setSelectedDeviceId(videoInputs[0].deviceId);
      }
    } catch (e) {
      console.warn('[Face Camera] Device enumeration notice:', e);
    }
  };

  useEffect(() => {
    loadCameraDevices();
  }, []);

  // Synchronize video element srcObject whenever active stream or state changes
  useEffect(() => {
    if (videoRef.current && streamRef.current) {
      if (videoRef.current.srcObject !== streamRef.current) {
        videoRef.current.srcObject = streamRef.current;
        videoRef.current.muted = true;
        videoRef.current.play().catch((pErr) => console.warn('Video face sync notice:', pErr));
      }
    }
  }, [isCameraActive]);

  const startCamera = async (deviceId?: string) => {
    if (isAcquiringRef.current) return;
    isAcquiringRef.current = true;
    setCameraError(null);

    stopCamera();
    await new Promise((resolve) => setTimeout(resolve, 150));

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError('Camera API not accessible. Please ensure you are opening via localhost and camera permissions are allowed.');
      isAcquiringRef.current = false;
      return;
    }

    const targetDeviceId = deviceId || selectedDeviceId;

    try {
      let mediaStream: MediaStream;
      try {
        const constraints: MediaStreamConstraints = targetDeviceId
          ? { video: { deviceId: { ideal: targetDeviceId }, width: { ideal: 1280 }, height: { ideal: 720 } }, audio: false }
          : { video: { width: { ideal: 1280 }, height: { ideal: 720 } }, audio: false };
        mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      } catch (constraintErr) {
        console.warn('[Face Camera] Ideal constraints rejected, attempting basic video: true fallback', constraintErr);
        mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      }

      streamRef.current = mediaStream;

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.muted = true;
        try {
          await videoRef.current.play();
        } catch (pErr) {
          console.warn('Video face playback notice:', pErr);
        }
      }

      setIsCameraActive(true);
      await loadCameraDevices();
    } catch (err: any) {
      console.error('[Face Camera] getUserMedia failed:', err);
      setIsCameraActive(false);

      if (err?.name === 'NotReadableError' || err?.message?.includes('Could not start video source')) {
        setCameraError('Camera is currently in use by another program. Please close other camera apps and click Retry.');
      } else if (err?.name === 'NotAllowedError') {
        setCameraError('Camera access denied. Please allow camera permissions in your browser.');
      } else {
        setCameraError(`Camera initialization notice: ${err?.message || 'Unable to open camera'}`);
      }
    } finally {
      isAcquiringRef.current = false;
    }
  };

  useEffect(() => {
    if (!capturedFace) {
      startCamera();
    }
    return () => {
      stopCamera();
    };
  }, [capturedFace, stopCamera]);

  const handleCapture = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    if (video.videoWidth === 0 || video.videoHeight === 0) {
      console.warn('Face video dimensions not ready yet');
      return;
    }
    const canvas = canvasRef.current || document.createElement('canvas');
    canvas.width = video.videoWidth || 800;
    canvas.height = video.videoHeight || 600;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUri = canvas.toDataURL('image/jpeg', 0.95);
      setCapturedFace(dataUri);
      stopCamera();
    }
  };

  const handleRetake = () => {
    setCapturedFace(null);
    startCamera();
  };

  const handleProceed = () => {
    if (capturedFace) {
      onCaptureComplete(capturedFace);
    }
  };

  const handleDeviceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newId = e.target.value;
    setSelectedDeviceId(newId);
    startCamera(newId);
  };

  return (
    <div className="flex flex-col h-full bg-[#F3F5F7]">
      {/* Step Header */}
      <div className="bg-white border-b border-[#D6DCE2] px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onBackToDocument}
            className="p-1.5 hover:bg-[#F3F5F7] rounded text-[#5B6773] hover:text-[#0B2942] transition"
            title="Back to Document Scan"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 text-xs font-semibold bg-[#FF9933] text-[#0B2942] rounded">STEP 2 OF 2</span>
              <h2 className="text-lg font-bold text-[#0B2942]">Real-Time Facial Verification</h2>
            </div>
            <p className="text-xs text-[#5B6773] mt-0.5">
              Align subject face within biometric reticle for local ArcFace 512D deep feature extraction
            </p>
          </div>
        </div>

        {/* Controls: Camera Switcher & Document Thumbnail */}
        <div className="flex items-center gap-4">
          {videoDevices.length > 1 && (
            <div className="flex items-center gap-2">
              <Video className="w-3.5 h-3.5 text-[#5B6773]" />
              <select
                value={selectedDeviceId}
                onChange={handleDeviceChange}
                className="border border-[#D6DCE2] bg-[#F8F9FA] text-[#17212B] text-xs font-medium px-2.5 py-1.5 rounded focus:outline-none focus:ring-1 focus:ring-[#0B2942]"
              >
                {videoDevices.map((dev, idx) => (
                  <option key={dev.deviceId || idx} value={dev.deviceId}>
                    {dev.label || `Camera ${idx + 1}`}
                  </option>
                ))}
              </select>
            </div>
          )}

          {docImagePreview && (
            <div className="flex items-center gap-2.5 px-3 py-1.5 bg-[#F8F9FA] border border-[#D6DCE2] rounded">
              <img
                src={docImagePreview}
                alt="Doc Preview"
                className="w-10 h-7 object-cover rounded border border-[#D6DCE2]"
              />
              <div className="text-[11px]">
                <div className="font-semibold text-[#17212B]">Document Reference Ready</div>
                <div className="text-[10px] text-[#138808] font-medium flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" /> Captured in Step 1
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Viewport */}
      <div className="flex-1 p-6 flex gap-6 overflow-hidden">
        {/* Biometric Face Viewport */}
        <div className="flex-1 bg-[#161C21] rounded border border-[#2A3440] relative flex items-center justify-center overflow-hidden shadow-sm">
          {!capturedFace ? (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-contain transform scale-x-[-1] ${isCameraActive ? 'block' : 'hidden'}`}
              />

              {!isCameraActive && (
                <div className="text-center p-8 text-white/70 flex flex-col items-center gap-4 max-w-md">
                  <div className="w-16 h-16 rounded-full bg-[#FF9933]/20 border border-[#FF9933]/40 flex items-center justify-center">
                    <Camera className="w-8 h-8 text-[#FF9933]" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white mb-1">Face Camera Initializing</h3>
                    <p className="text-xs text-white/60 leading-relaxed">
                      {cameraError || 'Connecting to facial capture sensor...'}
                    </p>
                  </div>
                  <button
                    onClick={() => startCamera()}
                    className="px-5 py-2.5 bg-[#FF9933] hover:bg-[#e68a2e] text-[#0B2942] font-bold text-xs rounded flex items-center gap-2 shadow transition"
                  >
                    <RefreshCw className="w-4 h-4" /> Retry Camera Connection
                  </button>
                </div>
              )}

              {/* Biometric Face Oval Overlay */}
              {isCameraActive && (
                <div className="absolute w-[240px] h-[310px] border-2 border-[#FF9933]/90 rounded-[50%] pointer-events-none pulse-guide flex flex-col items-center justify-between py-4">
                  <span className="text-[10px] font-mono text-[#FF9933] bg-[#0B2942]/90 px-2.5 py-0.5 rounded shadow">
                    [ EYE LEVEL ALIGNMENT ]
                  </span>
                  <div className="w-full border-t border-dashed border-white/25" />
                  <span className="text-[10px] font-mono text-white/70 bg-[#0B2942]/90 px-2.5 py-0.5 rounded shadow">
                    CHIN LEVEL
                  </span>
                </div>
              )}

              {/* Live telemetry indicators */}
              {isCameraActive && (
                <div className="absolute top-3 left-4 text-[10px] font-mono text-white/80 flex items-center gap-3">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#138808] animate-ping" /> SENSOR: ACTIVE
                  </span>
                  <span>ARCFACE 512-DIMENSIONAL EMBEDDING MATCH</span>
                </div>
              )}
            </>
          ) : (
            <div className="w-full h-full relative flex items-center justify-center bg-black/40">
              <img
                src={capturedFace}
                alt="Captured Face"
                className="max-h-full max-w-full object-contain"
              />
              <div className="absolute top-4 left-4 bg-[#0B2942]/90 border border-white/20 text-white text-xs px-3 py-1.5 rounded flex items-center gap-1.5 font-medium">
                <CheckCircle className="w-3.5 h-3.5 text-[#138808]" /> Biometric Frame Acquired
              </div>
            </div>
          )}

          <canvas ref={canvasRef} className="hidden" />
        </div>

        {/* Guidance & Verification Controls */}
        <div className="w-80 bg-white border border-[#D6DCE2] rounded p-5 flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold text-[#0B2942] uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <UserCheck className="w-4 h-4 text-[#FF9933]" /> Biometric Quality Standards
            </h3>

            <div className="space-y-3 text-xs text-[#5B6773]">
              <div className="p-3 bg-[#F8F9FA] rounded border border-[#E8ECF0]">
                <div className="font-semibold text-[#17212B] mb-1.5">Subject Checklist:</div>
                <ul className="list-disc list-inside space-y-1.5 text-[11.5px]">
                  <li>Direct frontal gaze into camera</li>
                  <li>Neutral facial expression</li>
                  <li>Eyes open, no dark glasses or masks</li>
                  <li>Adequate illumination on face</li>
                </ul>
              </div>

              <div className="p-3 bg-[#F8F9FA] rounded border border-[#E8ECF0]">
                <div className="text-[11px] font-semibold text-[#17212B]">Verification Pipeline:</div>
                <div className="text-[11px] text-[#7A858F] mt-1 space-y-1">
                  <div>1. Crop Portrait from Document Image</div>
                  <div>2. Crop Live Face from Webcam Image</div>
                  <div>3. Extract 512-D ArcFace Embeddings</div>
                  <div>4. Compute Cosine Distance &amp; Similarity</div>
                  <div>5. Passive Liveness &amp; Moiré Analysis</div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2.5 pt-4 border-t border-[#D6DCE2]">
            {!capturedFace ? (
              <button
                onClick={handleCapture}
                disabled={!isCameraActive}
                className="w-full py-3 bg-[#0B2942] hover:bg-[#123B63] disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-xs rounded flex items-center justify-center gap-2 shadow transition"
              >
                <Camera className="w-4 h-4 text-[#FF9933]" /> Capture Live Face
              </button>
            ) : (
              <>
                <button
                  onClick={handleProceed}
                  className="w-full py-3 bg-[#138808] hover:bg-[#0f6f06] text-white font-bold text-xs rounded flex items-center justify-center gap-2 shadow transition"
                >
                  Run Full Verification &rarr;
                </button>

                <button
                  onClick={handleRetake}
                  className="w-full py-2 bg-[#F8F9FA] hover:bg-[#E8ECF0] border border-[#D6DCE2] text-[#17212B] font-semibold text-xs rounded flex items-center justify-center gap-2 transition"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Retake Face Image
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
