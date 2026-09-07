import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Camera, RefreshCw, CheckCircle, ShieldCheck, Video, AlertTriangle } from 'lucide-react';

interface StepDocumentCaptureProps {
  onCaptureComplete: (docDataUri: string, docType: string) => void;
  initialDocImage?: string;
  initialDocType?: string;
}

export const StepDocumentCapture: React.FC<StepDocumentCaptureProps> = ({
  onCaptureComplete,
  initialDocImage,
  initialDocType = 'Passport'
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const isAcquiringRef = useRef<boolean>(false);

  const [capturedImage, setCapturedImage] = useState<string | null>(initialDocImage || null);
  const [documentType, setDocumentType] = useState<string>(initialDocType);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');

  // Stop active camera stream and release hardware handles
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch (e) {
          console.warn('Track stop notice:', e);
        }
      });
      streamRef.current = null;
    }
    if (videoRef.current && videoRef.current.srcObject) {
      try {
        const s = videoRef.current.srcObject as MediaStream;
        s.getTracks().forEach((t) => t.stop());
      } catch (e) {
        console.warn('Video srcObject stop notice:', e);
      }
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  }, []);

  // Enumerate available video inputs
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
      console.warn('[Camera] Device enumeration warning:', e);
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
        videoRef.current.play().catch((pErr) => console.warn('Video sync notice:', pErr));
      }
    }
  }, [isCameraActive]);

  // Start webcam stream safely
  const startCamera = async (deviceId?: string) => {
    if (isAcquiringRef.current) return;
    isAcquiringRef.current = true;
    setCameraError(null);

    // Stop and allow 150ms for Windows DirectShow driver to release exclusive lock
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
        console.warn('[Camera] Ideal constraints rejected, attempting basic video: true fallback', constraintErr);
        mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      }

      streamRef.current = mediaStream;

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.muted = true;
        try {
          await videoRef.current.play();
        } catch (pErr) {
          console.warn('Video playback notice:', pErr);
        }
      }

      setIsCameraActive(true);
      await loadCameraDevices();
    } catch (err: any) {
      console.error('[Camera] getUserMedia failed:', err);
      setIsCameraActive(false);

      if (err?.name === 'NotReadableError' || err?.message?.includes('Could not start video source')) {
        setCameraError(
          'Camera is in use by another application or tab (e.g. Teams, Zoom, or Windows Camera). Please close other apps and click Retry.'
        );
      } else if (err?.name === 'NotAllowedError' || err?.name === 'PermissionDeniedError') {
        setCameraError('Camera access denied. Please click the camera/lock icon in your browser address bar and choose "Allow".');
      } else if (err?.name === 'NotFoundError') {
        setCameraError('No webcam was detected. Please verify your camera is plugged in or enabled in Windows Settings.');
      } else {
        setCameraError(`Camera initialization notice: ${err?.message || 'Unable to open camera'}`);
      }
    } finally {
      isAcquiringRef.current = false;
    }
  };

  useEffect(() => {
    if (!capturedImage) {
      startCamera();
    }
    return () => {
      stopCamera();
    };
  }, [capturedImage, stopCamera]);

  const handleCapture = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    if (video.videoWidth === 0 || video.videoHeight === 0) {
      console.warn('Video dimensions not ready yet');
      return;
    }
    const canvas = canvasRef.current || document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUri = canvas.toDataURL('image/jpeg', 0.95);
      setCapturedImage(dataUri);
      stopCamera();
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
  };

  const handleProceed = () => {
    if (capturedImage) {
      onCaptureComplete(capturedImage, documentType);
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
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 text-xs font-semibold bg-[#0B2942] text-white rounded">STEP 1 OF 2</span>
            <h2 className="text-lg font-bold text-[#0B2942]">Document Screening &amp; Capture</h2>
          </div>
          <p className="text-xs text-[#5B6773] mt-0.5">
            Hold official travel or identity document in front of webcam within the optical guide frame
          </p>
        </div>

        {/* Controls: Camera Selector & Document Type */}
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

          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-[#5B6773] uppercase tracking-wider">Document Type:</label>
            <select
              value={documentType}
              onChange={(e) => setDocumentType(e.target.value)}
              className="border border-[#D6DCE2] bg-[#F8F9FA] text-[#17212B] text-xs font-medium px-3 py-1.5 rounded focus:outline-none focus:ring-1 focus:ring-[#0B2942]"
            >
              <option value="Passport">Passport (ICAO 9303 TD3)</option>
              <option value="National ID">National ID Card (TD1)</option>
              <option value="Aadhaar Card">Aadhaar Card</option>
              <option value="Driving Licence">Driving Licence</option>
              <option value="Voter ID">Voter ID</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Viewport */}
      <div className="flex-1 p-6 flex gap-6 overflow-hidden">
        {/* Optical Scanning Frame */}
        <div className="flex-1 bg-[#161C21] rounded border border-[#2A3440] relative flex items-center justify-center overflow-hidden shadow-sm">
          {!capturedImage ? (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-contain ${isCameraActive ? 'block' : 'hidden'}`}
              />

              {!isCameraActive && (
                <div className="text-center p-8 text-white/70 flex flex-col items-center gap-4 max-w-md">
                  <div className="w-16 h-16 rounded-full bg-[#FF9933]/20 border border-[#FF9933]/40 flex items-center justify-center">
                    <Camera className="w-8 h-8 text-[#FF9933]" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white mb-1">Webcam Sensor Initializing</h3>
                    <p className="text-xs text-white/60 leading-relaxed">
                      {cameraError || 'Connecting to local camera stream...'}
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

              {/* Passport & ID Reticle Frame Overlay */}
              {isCameraActive && (
                <div className="absolute w-[76%] h-[72%] border-2 border-white/30 rounded pointer-events-none pulse-guide">
                  <div className="corner-bracket corner-tl" />
                  <div className="corner-bracket corner-tr" />
                  <div className="corner-bracket corner-bl" />
                  <div className="corner-bracket corner-br" />

                  {/* MRZ Guidance Zone at Bottom */}
                  <div className="absolute bottom-3 left-4 right-4 h-14 border border-dashed border-[#FF9933]/80 bg-[#FF9933]/15 flex items-center justify-center">
                    <span className="text-[11px] font-mono font-bold text-[#FF9933] uppercase tracking-widest">
                      [ MRZ STRIP &bull; ALIGN BOTTOM LINES HERE ]
                    </span>
                  </div>

                  <div className="absolute top-2 left-4 text-[10px] font-mono text-white/80">
                    OPTICAL SENSOR: LIVE &bull; DOCUMENT SCAN READY
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="w-full h-full relative flex items-center justify-center bg-black/40">
              <img
                src={capturedImage}
                alt="Captured Document"
                className="max-h-full max-w-full object-contain"
              />
              <div className="absolute top-4 left-4 bg-[#0B2942]/90 border border-white/20 text-white text-xs px-3 py-1.5 rounded flex items-center gap-1.5 font-medium">
                <CheckCircle className="w-3.5 h-3.5 text-[#138808]" /> Document Frame Acquired
              </div>
            </div>
          )}

          <canvas ref={canvasRef} className="hidden" />
        </div>

        {/* Guidance & Controls Sidebar */}
        <div className="w-80 bg-white border border-[#D6DCE2] rounded p-5 flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold text-[#0B2942] uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#FF9933]" /> Live Document Guidance
            </h3>

            <div className="space-y-3 text-xs text-[#5B6773]">
              <div className="p-3 bg-[#F8F9FA] rounded border border-[#E8ECF0]">
                <div className="font-semibold text-[#17212B] mb-1.5">Optical Alignment Checklist:</div>
                <ul className="list-disc list-inside space-y-1.5 text-[11.5px]">
                  <li>Hold the document steady in front of the lens</li>
                  <li>Ensure all four corners fit inside the frame</li>
                  <li>Avoid direct glare or light reflections</li>
                  <li>Align bottom MRZ lines into the dashed box</li>
                </ul>
              </div>

              <div className="p-3 bg-[#F8F9FA] rounded border border-[#E8ECF0]">
                <div className="text-[11px] font-semibold text-[#17212B]">Automated Pipeline:</div>
                <div className="text-[11px] text-[#7A858F] mt-1 space-y-1">
                  <div>1. Optical Text &amp; Barcode Extraction</div>
                  <div>2. ICAO 9303 MRZ Check Digit Validation</div>
                  <div>3. Face Portrait Extraction from Document</div>
                  <div>4. Error Level Analysis (Pillow ELA)</div>
                  <div>5. OpenCV Laplacian Blur &amp; Tamper Scan</div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons (Webcam Only - No Upload) */}
          <div className="space-y-2.5 pt-4 border-t border-[#D6DCE2]">
            {!capturedImage ? (
              <button
                onClick={handleCapture}
                disabled={!isCameraActive}
                className="w-full py-3 bg-[#0B2942] hover:bg-[#123B63] disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-xs rounded flex items-center justify-center gap-2 shadow transition"
              >
                <Camera className="w-4 h-4 text-[#FF9933]" /> Capture Document Frame
              </button>
            ) : (
              <>
                <button
                  onClick={handleProceed}
                  className="w-full py-3 bg-[#138808] hover:bg-[#0f6f06] text-white font-bold text-xs rounded flex items-center justify-center gap-2 shadow transition"
                >
                  Confirm &amp; Proceed to Face Scan &rarr;
                </button>

                <button
                  onClick={handleRetake}
                  className="w-full py-2 bg-[#F8F9FA] hover:bg-[#E8ECF0] border border-[#D6DCE2] text-[#17212B] font-semibold text-xs rounded flex items-center justify-center gap-2 transition"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Retake Document Image
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
