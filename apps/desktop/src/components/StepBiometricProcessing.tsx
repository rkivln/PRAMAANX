import { useState, useEffect } from 'react';
import { useVerificationStore } from '@/store/verification';

const ITEMS = [
  'Face detected in image', 'Facial landmarks extracted', 'Face alignment completed',
  'Identity embedding generated', 'Face similarity calculated', 'Liveness assessment completed',
  'Face quality assessed', 'Visual consistency checked', 'Evidence fusion completed',
];

export default function StepBiometricProcessing() {
  const [checked, setChecked] = useState<boolean[]>(new Array(ITEMS.length).fill(false));
  const [progress, setProgress] = useState(0);
  const { goToStep, setResult } = useVerificationStore();

  useEffect(() => {
    const delays = [400, 850, 1300, 1800, 2300, 2800, 3200, 3650, 4100];
    const pcts = [10, 22, 34, 47, 61, 73, 82, 91, 100];
    const timers = delays.map((delay, i) =>
      setTimeout(() => {
        setChecked((prev) => {
          const next = [...prev];
          next[i] = true;
          return next;
        });
        setProgress(pcts[i]);
        if (i === ITEMS.length - 1) {
          setTimeout(() => {
            setResult({
              verification_id: '',
              decision: 'VERIFIED',
              confidence: 0.94,
              document: {
                document_type_detected: 'Aadhaar Card',
                ocr_confidence: 0.964,
                pattern_validation_status: 'PASS',
                mrz_status: 'N/A',
                stamp_status: 'VERIFIED',
                tamper_status: 'CLEAN',
                authenticity_score: 0.973,
              },
              biometric: {
                face_detected: true,
                face_quality_score: 0.92,
                face_similarity_score: 0.947,
                liveness_score: 0.992,
                liveness_status: 'PASS',
                face_match_status: 'CONFIRMED',
              },
              risk: {
                risk_score: 0.08,
                risk_level: 'LOW',
                confidence: 0.94,
                decision_recommendation: 'VERIFIED',
                reasons: [],
              },
            });
            goToStep(5);
          }, 700);
        }
      }, delay)
    );
    return () => timers.forEach(clearTimeout);
  }, [goToStep, setResult]);

  return (
    <div className="flex flex-col flex-1">
      <div className="bg-white border-b border-border px-[20px] py-[12px] flex items-center justify-between flex-shrink-0">
        <div>
          <h1 className="text-[15px] font-semibold text-text-primary">Biometric Analysis</h1>
          <div className="text-[10.5px] text-text-muted mt-[1px]">Step 4 of 5 · Local face recognition engine</div>
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
                <h3 className="text-[11px] font-bold uppercase tracking-[0.6px] text-text-sec">Biometric Analysis Checklist</h3>
              </div>
              <div className="p-[8px_14px]">
                {ITEMS.map((item, i) => (
                  <div key={i} className={`flex items-center gap-[10px] py-[7px] border-b border-[#EFF1F4] text-[12.5px] ${i === ITEMS.length - 1 ? 'border-b-0' : ''} ${checked[i] ? 'text-text-primary' : 'text-text-sec'}`}>
                    <div className={`w-[17px] h-[17px] rounded-full flex items-center justify-center text-[9px] flex-shrink-0 border-[1.5px] ${checked[i] ? 'bg-green border-green text-white' : 'border-border bg-section text-text-muted'}`}>
                      {checked[i] ? '✓' : '◌'}
                    </div>
                    {item}
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
                  {checked.every(Boolean) ? 'Biometric analysis complete' : ITEMS[checked.filter(Boolean).length] || 'Initialising biometric engine…'}
                </div>
                <div className="text-[10.5px] text-text-muted">InsightFace · Local model · Session-only retention</div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-[10px]">
            <div className="bg-white border border-border rounded-[4px]">
              <div className="px-[14px] py-[10px] border-b border-border">
                <h3 className="text-[11px] font-bold uppercase tracking-[0.6px] text-text-sec">Analysis Status</h3>
              </div>
              <div className="p-[20px_14px] text-center">
                <div className="text-[10px] text-text-muted uppercase tracking-[0.5px] mb-[4px]">Status</div>
                <div className="text-[18px] font-bold" style={{ color: checked.every(Boolean) ? 'var(--green)' : 'var(--navy)' }}>
                  {checked.every(Boolean) ? 'COMPLETE' : 'ANALYSIS IN PROGRESS'}
                </div>
                <div className="mt-[14px] bg-section border border-border rounded-[2px] h-[4px] overflow-hidden">
                  <div className="h-full bg-navy-mid transition-all duration-300" style={{ width: `${progress}%` }}></div>
                </div>
                <div className="text-[10px] text-text-muted mt-[5px]">{progress}%</div>
              </div>
            </div>

            <div className="bg-white border border-border rounded-[4px]">
              <div className="px-[14px] py-[10px] border-b border-border">
                <h3 className="text-[11px] font-bold uppercase tracking-[0.6px] text-text-sec">Processing Notes</h3>
              </div>
              <div className="p-[10px_14px] flex flex-col gap-[6px]">
                {['Facial data processed locally only', 'No biometric data transmitted', 'Session-only face image retention', 'Audit log records result only'].map((note, i) => (
                  <div key={i} className="flex items-center gap-[8px] text-[11.5px] text-text-sec">
                    <span className="text-green text-[10px]">●</span>{note}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
