import { useState, useEffect } from 'react';
import { useFaceCamera } from '@/utils/camera';
import { useVerificationStore } from '@/store/verification';

export default function StepFaceCapture() {
  const { goToStep, setFaceImage } = useVerificationStore();
  const { videoRef, isActive, start, capture } = useFaceCamera();
  const [indicators, setIndicators] = useState([false, false, false, false]);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    start();
    const steps = [
      { camText: 'Face detected', label: 'Face detected' },
      { camText: 'Position: Acceptable', label: 'Position acceptable' },
      { camText: 'Quality: Good', label: 'Lighting acceptable' },
      { camText: null, label: 'Image quality acceptable' },
    ];
    const timers = steps.map((_, i) =>
      setTimeout(() => {
        setIndicators((prev) => {
          const next = [...prev];
          next[i] = true;
          return next;
        });
      }, (i + 1) * 600)
    );
    return () => timers.forEach(clearTimeout);
  }, [start]);

  const handleCapture = async () => {
    const frame = capture();
    if (frame) {
      setFaceImage(frame);
      setProcessing(true);
      goToStep(4);
    }
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      setFaceImage(dataUrl);
      setIndicators([true, true, true, true]);
      setProcessing(true);
      goToStep(4);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex flex-col flex-1">
      <div className="bg-white border-b border-border px-[20px] py-[12px] flex items-center justify-between flex-shrink-0">
        <div>
          <h1 className="text-[15px] font-semibold text-text-primary">Biometric Verification</h1>
          <div className="text-[10.5px] text-text-muted mt-[1px]">Step 3 of 5 · Facial biometric capture</div>
        </div>
        <span className="inline-flex items-center gap-[5px] bg-blue-50 border border-navy-mid px-[9px] py-[3px] rounded-[3px] text-[10px] font-bold uppercase tracking-[0.5px] text-navy">
          <span className={`w-[5px] h-[5px] rounded-full flex-shrink-0 ${isActive ? 'bg-green' : 'bg-saffron'}`}></span>
          {isActive ? 'Camera Active' : 'Camera Standby'}
        </span>
      </div>

      <div className="p-[18px_20px] flex-1 overflow-y-auto">
        <div className="grid grid-cols-2 gap-[16px]" style={{ alignItems: 'start' }}>
          <div>
            <p className="text-[12.5px] text-text-sec mb-[10px]">Position the subject's face within the oval guide. Ensure adequate, even lighting and that the face is fully unobstructed.</p>

            <div className="bg-[#161C21] border border-[#2A3440] rounded-[4px] aspect-video relative overflow-hidden flex items-center justify-center">
              {!isActive && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white/28 text-[12.5px] text-center gap-[6px]">
                  <div className="text-[32px]">📷</div>
                  <div>Initialising camera…</div>
                </div>
              )}
              <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" style={{ display: isActive ? 'block' : 'none' }} />

              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[190px] h-[250px] border-2 border-white/30 rounded-full"></div>
                <div className="absolute top-[calc(50%-140px)] left-1/2 -translate-x-1/2 text-saffron/70 text-[9px] tracking-[0.8px] uppercase font-semibold whitespace-nowrap">ALIGN FACE WITHIN OVAL</div>
              </div>

              <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-[12px] py-[7px] flex gap-[14px] items-center">
                <div className={`flex items-center gap-[5px] text-[10px] ${indicators[0] ? 'text-green' : 'text-white/40'}`}>
                  <span className={`w-[5px] h-[5px] rounded-full flex-shrink-0 ${indicators[0] ? 'bg-green' : 'bg-saffron/50'}`}></span>
                  {indicators[0] ? 'Face detected' : 'Awaiting face'}
                </div>
                <div className={`flex items-center gap-[5px] text-[10px] ${indicators[1] ? 'text-green' : 'text-white/40'}`}>
                  <span className={`w-[5px] h-[5px] rounded-full flex-shrink-0 ${indicators[1] ? 'bg-green' : 'bg-saffron/50'}`}></span>
                  {indicators[1] ? 'Position: Acceptable' : 'Position: —'}
                </div>
                <div className={`flex items-center gap-[5px] text-[10px] ${indicators[2] ? 'text-green' : 'text-white/40'}`}>
                  <span className={`w-[5px] h-[5px] rounded-full flex-shrink-0 ${indicators[2] ? 'bg-green' : 'bg-saffron/50'}`}></span>
                  {indicators[2] ? 'Quality: Good' : 'Quality: —'}
                </div>
              </div>
            </div>

            <div className="flex gap-[8px] mt-[10px] flex-wrap">
              <button onClick={handleCapture} disabled={processing} className="flex-1 bg-navy text-white border border-navy px-[14px] py-[9px] rounded-[3px] text-[12.5px] font-medium hover:bg-navy-dark hover:border-navy-dark transition-colors disabled:opacity-50">
                CAPTURE FACE
              </button>
              <button onClick={start} className="bg-transparent text-text-sec border border-border px-[14px] py-[7px] rounded-[3px] text-[12px] font-medium hover:bg-section hover:text-text-primary transition-colors">RETAKE</button>
              <label className="bg-white text-navy border border-navy px-[14px] py-[7px] rounded-[3px] text-[12px] font-medium cursor-pointer inline-flex items-center gap-[6px] hover:bg-[#EBF2F8] transition-colors">
                📁 Upload Photo
                <input type="file" accept="image/*" className="hidden" onChange={handleUpload} />
              </label>
            </div>
          </div>

          <div className="flex flex-col gap-[10px]">
            <div className="bg-section border border-border rounded-[4px] p-[12px_14px]">
              <div className="text-[10px] font-bold uppercase tracking-[0.6px] text-text-sec mb-[9px] pb-[7px] border-b border-border">Capture Indicators</div>
              {[
                { id: 'fi-1', label: 'Face detected', idx: 0 },
                { id: 'fi-2', label: 'Position acceptable', idx: 1 },
                { id: 'fi-3', label: 'Lighting acceptable', idx: 2 },
                { id: 'fi-4', label: 'Image quality acceptable', idx: 3 },
              ].map(({ id, label, idx }) => (
                <div key={id} className={`flex items-center gap-[10px] py-[7px] border-b border-[#EFF1F4] text-[12.5px] ${idx === 3 ? 'border-b-0' : ''} ${indicators[idx] ? 'text-text-primary' : 'text-text-sec'}`}>
                  <span className={`w-[17px] h-[17px] rounded-full flex items-center justify-center text-[9px] flex-shrink-0 border-[1.5px] ${indicators[idx] ? 'bg-green border-green text-white' : 'border-border bg-section text-text-muted'}`}>
                    {indicators[idx] ? '✓' : '○'}
                  </span>
                  {label}
                </div>
              ))}
            </div>

            <div className="bg-section border border-border rounded-[4px] p-[12px_14px]">
              <div className="text-[10px] font-bold uppercase tracking-[0.6px] text-text-sec mb-[9px] pb-[7px] border-b border-border">Subject Instructions</div>
              {['Look directly at the camera lens', 'Keep face fully visible and unobstructed', 'Remove objects covering the face', 'Maintain a neutral expression', 'Remain still during capture'].map((inst, i) => (
                <div key={i} className="flex items-center gap-[10px] py-[4px] text-[11.5px] text-text-sec">
                  <span className="text-navy-mid text-[9px]">▸</span>{inst}
                </div>
              ))}
            </div>

            <div className="bg-section border border-border rounded-[4px] p-[12px_14px]">
              <div className="text-[10px] font-bold uppercase tracking-[0.6px] text-text-sec mb-[9px] pb-[7px] border-b border-border">Biometric Engine</div>
              {[['InsightFace · Local model'], ['Liveness detection: Active'], ['Local processing only'], ['Retention: Session only']].map(([l]) => (
                <div key={l} className="flex items-center gap-[8px] py-[4px] text-[11.5px] text-text-sec">
                  <span className="text-navy-mid text-[9px]">▪</span>
                  <span>{l}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
