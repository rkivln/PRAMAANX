import { useState, useEffect } from 'react';
import { useVerificationStore } from '@/store/verification';

const ITEMS = [
  'Image received', 'Document type detected', 'OCR extraction',
  'Indian document pattern validation', 'MRZ analysis', 'Stamp verification',
  'Image integrity / tamper analysis', 'Rule validation', 'Risk assessment',
];

export default function StepDocumentProcessing() {
  const [checked, setChecked] = useState<boolean[]>(new Array(ITEMS.length).fill(false));
  const { goToStep } = useVerificationStore();

  useEffect(() => {
    const delays = [350, 700, 1050, 1450, 1850, 2250, 2700, 3100, 3500];
    const timers = delays.map((delay, i) =>
      setTimeout(() => {
        setChecked((prev) => {
          const next = [...prev];
          next[i] = true;
          return next;
        });
        if (i === ITEMS.length - 1) {
          setTimeout(() => goToStep(3), 700);
        }
      }, delay)
    );
    return () => timers.forEach(clearTimeout);
  }, [goToStep]);

  return (
    <div className="flex flex-col flex-1">
      <div className="bg-white border-b border-border px-[20px] py-[12px] flex items-center justify-between flex-shrink-0">
        <div>
          <h1 className="text-[15px] font-semibold text-text-primary">Document Verification</h1>
          <div className="text-[10.5px] text-text-muted mt-[1px]">Step 2 of 5 · Local verification engine</div>
        </div>
        <span className="inline-flex items-center gap-[5px] bg-blue-50 border border-navy-mid px-[9px] py-[3px] rounded-[3px] text-[10px] font-bold uppercase tracking-[0.5px] text-navy">
          Processing
        </span>
      </div>

      <div className="p-[18px_20px] flex-1 overflow-y-auto">
        <div className="grid grid-cols-2 gap-[16px]" style={{ alignItems: 'start' }}>
          <div>
            <div className="bg-white border border-border rounded-[4px] mb-[10px]">
              <div className="px-[14px] py-[10px] border-b border-border">
                <h3 className="text-[11px] font-bold uppercase tracking-[0.6px] text-text-sec">Verification Checklist</h3>
              </div>
              <div className="p-[8px_14px]">
                {ITEMS.map((item, i) => (
                  <div key={i} className={`flex items-center gap-[10px] py-[7px] border-b border-[#EFF1F4] text-[12.5px] ${i === ITEMS.length - 1 ? 'border-b-0' : ''} ${checked[i] ? 'text-text-primary' : 'text-text-sec'}`}>
                    <div className={`w-[17px] h-[17px] rounded-full flex items-center justify-center text-[9px] flex-shrink-0 border-[1.5px] ${checked[i] ? 'bg-green border-green text-white' : 'border-border bg-section text-text-muted'}`}>
                      {checked[i] ? '✓' : '◌'}
                    </div>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-[10px] p-[10px_12px] bg-section border border-border rounded-[4px]">
              {!checked.every(Boolean) && (
                <div className="w-[20px] h-[20px] border-2 border-border border-t-navy-mid rounded-full animate-spin flex-shrink-0"></div>
              )}
              <div>
                <div className="text-[12px] font-semibold text-text-primary">
                  {checked.every(Boolean) ? 'Document verification complete' : ITEMS[checked.filter(Boolean).length] || 'Initialising verification engine…'}
                </div>
                <div className="text-[10.5px] text-text-muted">Local Python Engine · Port 5000</div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-[10px]">
            <div className="bg-white border border-border rounded-[4px]">
              <div className="px-[14px] py-[10px] border-b border-border">
                <h3 className="text-[11px] font-bold uppercase tracking-[0.6px] text-text-sec">Local Verification Engine</h3>
              </div>
              <div className="p-[20px_14px] text-center">
                <div className="text-[10px] text-text-muted uppercase tracking-[0.5px] mb-[4px]">Engine Status</div>
                <div className="text-[18px] font-bold" style={{ color: checked.every(Boolean) ? 'var(--green)' : 'var(--navy)' }}>
                  {checked.every(Boolean) ? 'COMPLETE' : 'PROCESSING'}
                </div>
              </div>
              <div className="px-[14px] pb-[14px]">
                <div className="bg-section border border-border rounded-[4px]">
                  {[['OCR Engine', 'Tesseract 5.3'], ['Document Rules', 'Active'], ['MRZ Parser', 'Active'], ['Tamper Analysis', 'Active']].map(([l, v], i, arr) => (
                    <div key={l} className={`flex justify-between px-[10px] py-[6px] text-[11.5px] ${i < arr.length - 1 ? 'border-b border-border-light' : ''}`}>
                      <span className="text-text-sec">{l}</span>
                      <span className={`font-medium ${v === 'Active' ? 'text-green' : 'text-text-primary'}`}>{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white border border-border rounded-[4px]">
              <div className="px-[14px] py-[10px] border-b border-border">
                <h3 className="text-[11px] font-bold uppercase tracking-[0.6px] text-text-sec">Detected Document</h3>
              </div>
              <div className="p-[20px_14px] text-center text-text-muted text-[12px]">
                {checked[1] ? (
                  <div className="text-left">
                    <div className="mb-[10px]"><span className="inline-flex items-center gap-[5px] bg-blue-50 border border-navy-mid px-[9px] py-[3px] rounded-[3px] text-[10px] font-bold uppercase tracking-[0.5px] text-navy">AADHAAR CARD</span></div>
                    <div className="text-[12px] text-text-sec">Issuing Authority: UIDAI, Government of India</div>
                    <div className="text-[12px] text-text-sec mt-[2px]">Format: Standard Laminated Plastic</div>
                  </div>
                ) : 'Awaiting document type detection…'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
