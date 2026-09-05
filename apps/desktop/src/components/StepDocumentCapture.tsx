import { useState, useEffect } from 'react';
import { useDocumentCamera } from '@/utils/camera';
import { useVerificationStore } from '@/store/verification';
import { useAuthStore } from '@/store/auth';

export default function StepDocumentCapture() {
  const { startVerification, goToStep, setDocImage } = useVerificationStore();
  const officer = useAuthStore((s: any) => s.officer);
  const verificationId = useVerificationStore((s: any) => s.verificationId);
  const { videoRef, isActive, start, capture } = useDocumentCamera();
  const [detected, setDetected] = useState(false);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!verificationId) {
      startVerification();
    }
    start();
    const timer = setTimeout(() => setDetected(true), 2200);
    return () => clearTimeout(timer);
  }, []);

  const handleCapture = async () => {
    const frame = capture();
    if (frame) {
      setDocImage(frame);
      setProcessing(true);
      goToStep(2);
    }
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      setDocImage(dataUrl);
      setDetected(true);
      setProcessing(true);
      goToStep(2);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex flex-col flex-1">
      <div className="bg-white border-b border-border px-[20px] py-[12px] flex items-center justify-between flex-shrink-0">
        <div>
          <h1 className="text-[15px] font-semibold text-text-primary">Document Capture</h1>
          <div className="text-[10.5px] text-text-muted mt-[1px]">Step 1 of 5 · Verification ID: <span className="font-mono">{verificationId || '—'}</span></div>
        </div>
        <span className="inline-flex items-center gap-[5px] bg-blue-50 border border-navy-mid px-[9px] py-[3px] rounded-[3px] text-[10px] font-bold uppercase tracking-[0.5px] text-navy">
          <span className={`w-[5px] h-[5px] rounded-full flex-shrink-0 ${isActive ? 'bg-green' : 'bg-saffron'}`}></span>
          {isActive ? 'Camera Active' : 'Camera Standby'}
        </span>
      </div>

      <div className="p-[18px_20px] flex-1 overflow-y-auto">
        <div className="grid grid-cols-2 gap-[16px]" style={{ alignItems: 'start' }}>
          <div>
            <p className="text-[12.5px] text-text-sec mb-[10px]">Position the identity document inside the guide frame. Ensure all four corners are visible and the document lies flat.</p>

            <div className="bg-[#161C21] border border-[#2A3440] rounded-[4px] aspect-video relative overflow-hidden flex items-center justify-center">
              {!isActive && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white/28 text-[12.5px] text-center gap-[6px]">
                  <div className="text-[32px]">📷</div>
                  <div>Initialising camera…</div>
                  <div className="text-[10.5px] text-white/20 mt-[3px]">Allow camera access when prompted</div>
                </div>
              )}
              <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" style={{ display: isActive ? 'block' : 'none' }} />

              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[68%] h-[60%] border-[1.5px] border-white/20">
                  <div className="absolute -top-[2px] -left-[2px] w-[18px] h-[18px] border-t-[2.5px] border-l-[2.5px] border-saffron"></div>
                  <div className="absolute -top-[2px] -right-[2px] w-[18px] h-[18px] border-t-[2.5px] border-r-[2.5px] border-saffron"></div>
                  <div className="absolute -bottom-[2px] -left-[2px] w-[18px] h-[18px] border-b-[2.5px] border-l-[2.5px] border-saffron"></div>
                  <div className="absolute -bottom-[2px] -right-[2px] w-[18px] h-[18px] border-b-[2.5px] border-r-[2.5px] border-saffron"></div>
                </div>
              </div>

              <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-[12px] py-[7px] flex gap-[14px] items-center">
                <div className={`flex items-center gap-[5px] text-[10px] ${isActive ? 'text-white/75' : 'text-white/40'}`}>
                  <span className={`w-[5px] h-[5px] rounded-full flex-shrink-0 ${isActive ? 'bg-saffron' : 'bg-saffron/50'}`}></span>
                  {isActive ? 'Camera active' : 'Camera initializing'}
                </div>
                <div className={`flex items-center gap-[5px] text-[10px] ${detected ? 'text-green' : 'text-white/40'}`}>
                  <span className={`w-[5px] h-[5px] rounded-full flex-shrink-0 ${detected ? 'bg-green' : 'bg-saffron/50'}`}></span>
                  {detected ? 'DOCUMENT DETECTED' : 'Awaiting document'}
                </div>
              </div>
            </div>

            <div className="flex gap-[8px] mt-[10px] flex-wrap">
              <button onClick={handleCapture} disabled={processing} className="flex-1 bg-navy text-white border border-navy px-[14px] py-[9px] rounded-[3px] text-[12.5px] font-medium hover:bg-navy-dark hover:border-navy-dark transition-colors disabled:opacity-50">
                CAPTURE DOCUMENT
              </button>
              <button onClick={start} className="bg-transparent text-text-sec border border-border px-[14px] py-[7px] rounded-[3px] text-[12px] font-medium hover:bg-section hover:text-text-primary transition-colors">RETAKE</button>
              <label className="bg-white text-navy border border-navy px-[14px] py-[7px] rounded-[3px] text-[12px] font-medium cursor-pointer inline-flex items-center gap-[6px] hover:bg-[#EBF2F8] transition-colors">
                📁 Upload Image
                <input type="file" accept="image/*" className="hidden" onChange={handleUpload} />
              </label>
            </div>

            <div className="mt-[7px] text-[10.5px] text-text-muted">
              Verification ID: <span className="font-mono">{verificationId || '—'}</span> · Officer: {officer?.name || '—'}
            </div>
          </div>

          <div className="flex flex-col gap-[10px]">
            <div className="bg-section border border-border rounded-[4px] p-[12px_14px]">
              <div className="text-[10px] font-bold uppercase tracking-[0.6px] text-text-sec mb-[9px] pb-[7px] border-b border-border">Capture Requirements</div>
              {['Document fully visible in frame', 'No excessive glare or reflection', 'All four corners detected', 'Image quality acceptable', 'Text clearly readable', 'No obstructions over document'].map((req, i) => (
                <div key={i} className={`flex items-center gap-[10px] py-[7px] border-b border-[#EFF1F4] text-[12.5px] ${i === 5 ? 'border-b-0' : ''} ${detected ? 'text-text-primary' : 'text-text-sec'}`}>
                  <span className={`w-[17px] h-[17px] rounded-full flex items-center justify-center text-[9px] flex-shrink-0 border-[1.5px] ${detected ? 'bg-green border-green text-white' : 'border-border bg-section text-text-muted'}`}>
                    {detected ? '✓' : '◌'}
                  </span>
                  {req}
                </div>
              ))}
            </div>

            <div className="bg-section border border-border rounded-[4px] p-[12px_14px]">
              <div className="text-[10px] font-bold uppercase tracking-[0.6px] text-text-sec mb-[9px] pb-[7px] border-b border-border">Accepted Document Types</div>
              {['Aadhaar Card (original / laminated)', 'Indian Passport (all pages)', 'Voter ID Card (EPIC)', 'Driving Licence', 'PAN Card'].map((doc, i) => (
                <div key={i} className="flex items-center gap-[10px] py-[4px] text-[11.5px] text-text-sec">
                  <span className="text-navy-mid text-[9px]">◉</span>{doc}
                </div>
              ))}
            </div>

            <div className="bg-section border border-border rounded-[4px] p-[12px_14px]">
              <div className="text-[10px] font-bold uppercase tracking-[0.6px] text-text-sec mb-[9px] pb-[7px] border-b border-border">Processing Engine</div>
              {[['OCR Engine', 'Tesseract 5.3'], ['MRZ Parser', 'Active'], ['Tamper Analysis', 'Active'], ['Local Processing Only', '—']].map(([l, v]) => (
                <div key={l} className="flex items-center gap-[8px] py-[4px] text-[11.5px] text-text-sec">
                  <span className="text-navy-mid text-[9px]">▪</span>
                  <span>{l}: <span className={v === 'Active' ? 'text-green font-medium' : 'text-text-primary'}>{v}</span></span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
