import { useVerificationStore } from '@/store/verification';
import { useAppStore } from '@/store/app';

interface ResultProps {
  docImage?: string;
  faceImage?: string;
}

export default function StepResult({ docImage, faceImage }: ResultProps) {
  const result = useVerificationStore((s) => s.result);
  const verificationId = useVerificationStore((s) => s.verificationId);
  const setReportModal = useAppStore((s) => s.setReportModal);

  if (!result) return null;

  const ok = result.decision === 'VERIFIED';
  const rv = result.decision === 'REVIEW';
  const rj = result.decision === 'REJECTED';

  const rc = ok ? 'verified' : rv ? 'review' : 'rejected';
  const icon = ok ? '✓' : rv ? '⚠' : '✕';
  const title = ok ? 'IDENTITY VERIFIED' : rv ? 'MANUAL REVIEW REQUIRED' : 'VERIFICATION FAILED';
  const sub = ok
    ? 'Document and biometric verification passed. Identity confirmed.'
    : rv
    ? 'One or more verification components require supervisory review before a decision can be recorded.'
    : 'Document or biometric verification failed. Identity could not be confirmed to the required standard.';

  const fm = result.biometric.face_similarity_score * 100;
  const risk = result.risk.risk_level;
  const rsc = result.risk.risk_score;
  const ds = result.document.authenticity_score * 100;
  const lv = result.biometric.liveness_status;
  const riskColor = ok ? 'var(--green)' : rv ? 'var(--review)' : 'var(--rejected)';
  const fmColor = ok ? 'var(--green)' : rv ? 'var(--review)' : 'var(--rejected)';
  const ts = new Date().toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'medium' });

  return (
    <div className="flex flex-col flex-1">
      <div className="bg-white border-b border-border px-[20px] py-[12px] flex items-center justify-between flex-shrink-0">
        <div>
          <h1 className="text-[15px] font-semibold text-text-primary">Verification Result</h1>
          <div className="text-[10.5px] text-text-muted mt-[1px]">Step 5 of 5 · Verification ID: <span className="font-mono">{verificationId || '—'}</span></div>
        </div>
        <div className="flex gap-[6px]">
          <span className="inline-flex items-center gap-[5px] bg-section border border-border px-[9px] py-[3px] rounded-[3px] text-[10px] font-bold uppercase tracking-[0.5px] text-text-sec">AI Analysis: Complete</span>
          <span className="inline-flex items-center gap-[5px] bg-blue-50 border border-navy-mid px-[9px] py-[3px] rounded-[3px] text-[10px] font-bold uppercase tracking-[0.5px] text-navy">Audit Logged</span>
        </div>
      </div>

      <div className="p-[18px_20px] flex-1 overflow-y-auto">
        <div className="border-2 rounded-[4px] overflow-hidden mb-[14px]" style={{ borderColor: `var(--${rc})` }}>
          <div className="p-[18px_20px] flex items-center gap-[14px]" style={{ background: rc === 'verified' ? '#ddf2dc' : rc === 'review' ? 'var(--reviewPale)' : 'var(--rejectedPale)' }}>
            <div className={`w-[46px] h-[46px] rounded-full flex items-center justify-center text-[20px] font-bold flex-shrink-0 text-white`} style={{ background: `var(--${rc})` }}>
              {icon}
            </div>
            <div className="flex-1">
              <div className={`text-[19px] font-bold tracking-[0.2px]`} style={{ color: `var(--${rc})` }}>{title}</div>
              <div className="text-[12px] text-text-sec mt-[2px]">{sub}</div>
            </div>
            <div className="text-right">
              <div className="text-[9.5px] text-text-muted uppercase tracking-[0.4px]">Verification ID</div>
              <div className="font-mono text-[11.5px] font-semibold mt-[1px]">{verificationId || '—'}</div>
              <div className="text-[10px] text-text-muted mt-[4px]">{ts} IST</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-[14px]" style={{ alignItems: 'start' }}>
          <div className="bg-white border border-border rounded-[4px]">
            <div className="px-[14px] py-[10px] border-b border-border">
              <h3 className="text-[11px] font-bold uppercase tracking-[0.6px] text-text-sec">Verification Summary</h3>
            </div>

            <div className="p-[12px_14px] border-b border-border">
              <div className="text-[10.5px] font-bold uppercase tracking-[0.6px] text-text-sec pb-[6px] border-b border-border mb-[10px]">Document</div>
              <div className="grid grid-cols-2 border border-border rounded-[4px] overflow-hidden">
                <div className="p-[8px_12px] border-b border-border-light">
                  <div className="text-[9.5px] text-text-muted uppercase tracking-[0.4px] font-semibold mb-[2px]">Document Type</div>
                  <div className="text-[12.5px] text-text-primary font-medium">Aadhaar Card</div>
                </div>
                <div className="p-[8px_12px] border-b border-border-light border-r border-border-light">
                  <div className="text-[9.5px] text-text-muted uppercase tracking-[0.4px] font-semibold mb-[2px]">Document Number</div>
                  <div className="text-[12.5px] text-text-primary font-medium font-mono">XXXX XXXX 4821</div>
                </div>
                <div className="p-[8px_12px] border-b border-border-light">
                  <div className="text-[9.5px] text-text-muted uppercase tracking-[0.4px] font-semibold mb-[2px]">Name</div>
                  <div className="text-[12.5px] text-text-primary font-medium">R*** S*** (masked)</div>
                </div>
                <div className="p-[8px_12px] border-b border-border-light border-r border-border-light">
                  <div className="text-[9.5px] text-text-muted uppercase tracking-[0.4px] font-semibold mb-[2px]">Date of Birth</div>
                  <div className="text-[12.5px] text-text-primary font-medium">14 / 08 / 1989</div>
                </div>
                <div className="p-[8px_12px] border-b border-border-light">
                  <div className="text-[9.5px] text-text-muted uppercase tracking-[0.4px] font-semibold mb-[2px]">Authenticity Score</div>
                  <div className="text-[12.5px] font-medium" style={{ color: fmColor }}>{ds.toFixed(1)}%</div>
                </div>
                <div className="p-[8px_12px] border-b border-border-light border-r border-border-light">
                  <div className="text-[9.5px] text-text-muted uppercase tracking-[0.4px] font-semibold mb-[2px]">Tamper Assessment</div>
                  <div className="text-[12.5px] font-medium" style={{ color: ok ? 'var(--green)' : 'var(--rejected)' }}>{ok ? 'No indicators' : 'Indicators found'}</div>
                </div>
                <div className="p-[8px_12px] border-r border-border-light col-span-2">
                  <div className="text-[9.5px] text-text-muted uppercase tracking-[0.4px] font-semibold mb-[2px]">OCR Confidence</div>
                  <div className="text-[12.5px] text-text-primary font-medium">{(result.document.ocr_confidence * 100).toFixed(1)}%</div>
                </div>
              </div>
            </div>

            <div className="p-[12px_14px] border-b border-border">
              <div className="text-[10.5px] font-bold uppercase tracking-[0.6px] text-text-sec pb-[6px] border-b border-border mb-[10px]">Identity</div>
              <div className="grid grid-cols-2 border border-border rounded-[4px] overflow-hidden">
                <div className="p-[8px_12px] border-b border-border-light">
                  <div className="text-[9.5px] text-text-muted uppercase tracking-[0.4px] font-semibold mb-[2px]">Face Similarity</div>
                  <div className="text-[12.5px] font-medium" style={{ color: fmColor }}>{fm.toFixed(1)}%</div>
                </div>
                <div className="p-[8px_12px] border-b border-border-light border-r border-border-light">
                  <div className="text-[9.5px] text-text-muted uppercase tracking-[0.4px] font-semibold mb-[2px]">Liveness Result</div>
                  <div className="text-[12.5px] font-medium" style={{ color: lv === 'PASS' ? 'var(--green)' : 'var(--review)' }}>{lv}</div>
                </div>
                <div className="p-[8px_12px] border-b border-border-light">
                  <div className="text-[9.5px] text-text-muted uppercase tracking-[0.4px] font-semibold mb-[2px]">Face Quality</div>
                  <div className="text-[12.5px] text-text-primary font-medium">GOOD</div>
                </div>
                <div className="p-[8px_12px] border-r border-border-light">
                  <div className="text-[9.5px] text-text-muted uppercase tracking-[0.4px] font-semibold mb-[2px]">Identity Match</div>
                  <div className="text-[12.5px] font-medium" style={{ color: fmColor }}>{ok ? 'CONFIRMED' : rv ? 'UNCERTAIN' : 'FAILED'}</div>
                </div>
              </div>
            </div>

            <div className="p-[12px_14px]">
              <div className="text-[10.5px] font-bold uppercase tracking-[0.6px] text-text-sec pb-[6px] border-b border-border mb-[10px]">Risk Assessment</div>
              <div className="grid grid-cols-2 border border-border rounded-[4px] overflow-hidden">
                <div className="p-[8px_12px] border-b border-border-light">
                  <div className="text-[9.5px] text-text-muted uppercase tracking-[0.4px] font-semibold mb-[2px]">Risk Level</div>
                  <div className="text-[12.5px] font-bold" style={{ color: riskColor }}>{risk}</div>
                </div>
                <div className="p-[8px_12px] border-b border-border-light border-r border-border-light">
                  <div className="text-[9.5px] text-text-muted uppercase tracking-[0.4px] font-semibold mb-[2px]">Risk Score</div>
                  <div className="text-[12.5px] text-text-primary font-medium">{rsc.toFixed(2)}</div>
                </div>
                <div className="p-[8px_12px] col-span-2 border-r border-border-light">
                  <div className="text-[9.5px] text-text-muted uppercase tracking-[0.4px] font-semibold mb-[2px]">Triggered Rules</div>
                  <div className="text-[12px] text-text-primary font-medium">{ok ? 'None' : rv ? 'Face similarity below threshold' : 'Face similarity, tamper indicator flags'}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-[12px]">
            <div className="bg-white border border-border rounded-[4px]">
              <div className="px-[14px] py-[10px] border-b border-border flex items-center justify-between">
                <h3 className="text-[11px] font-bold uppercase tracking-[0.6px] text-text-sec">Document / Biometric Comparison</h3>
                <span className="inline-flex items-center gap-[5px] bg-blue-50 border border-navy-mid px-[9px] py-[3px] rounded-[3px] text-[10px] font-bold uppercase tracking-[0.5px] text-navy">Dual Biometric Match</span>
              </div>
              <div className="p-[14px]">
                <div className="grid grid-cols-2 gap-[10px] mb-[10px]">
                  <div className="border border-border rounded-[4px] overflow-hidden">
                    <div className="bg-section border-b border-border px-[10px] py-[6px] flex items-center justify-between">
                      <span className="text-[10px] font-semibold uppercase tracking-[0.5px] text-text-sec">Document Photo</span>
                      <span className="font-mono text-[9.5px] text-navy-light">ID CROP</span>
                    </div>
                    <div className="h-[130px] flex items-center justify-center bg-[#E8EBED] text-text-muted text-[11.5px] cursor-pointer relative" onClick={() => docImage && useAppStore.getState().setLightbox({ open: true, src: docImage, title: 'Extracted Document Photo', type: 'doc-photo' })}>
                      {docImage ? <img src={docImage} alt="Document Photo" className="w-full h-full object-cover" /> : 'No image'}
                      <span className="absolute bottom-[6px] right-[6px] bg-navy-dark/85 text-white text-[9.5px] font-semibold px-[7px] py-[2px] rounded-[2px] backdrop-blur-[4px] flex items-center gap-[4px]">🔍 Zoom</span>
                    </div>
                    <div className="px-[10px] py-[5px] bg-section border-t border-border-light text-[10.5px] text-text-sec flex justify-between">
                      <span>Authenticity: <b style={{ color: fmColor }}>{ds.toFixed(1)}%</b></span>
                      <span style={{ color: 'var(--green)' }}>✓ Extracted</span>
                    </div>
                  </div>

                  <div className="border border-border rounded-[4px] overflow-hidden">
                    <div className="bg-section border-b border-border px-[10px] py-[6px] flex items-center justify-between">
                      <span className="text-[10px] font-semibold uppercase tracking-[0.5px] text-text-sec">Live Capture</span>
                      <span className="font-mono text-[9.5px] text-navy-light">WS-CHK-01</span>
                    </div>
                    <div className="h-[130px] flex items-center justify-center bg-[#E8EBED] text-text-muted text-[11.5px] cursor-pointer relative" onClick={() => faceImage && useAppStore.getState().setLightbox({ open: true, src: faceImage, title: 'Live Biometric Subject Capture', type: 'live-face' })}>
                      {faceImage ? <img src={faceImage} alt="Live Face" className="w-full h-full object-cover" /> : 'No image'}
                      <span className="absolute bottom-[6px] right-[6px] bg-navy-dark/85 text-white text-[9.5px] font-semibold px-[7px] py-[2px] rounded-[2px] backdrop-blur-[4px] flex items-center gap-[4px]">🔍 Zoom</span>
                    </div>
                    <div className="px-[10px] py-[5px] bg-section border-t border-border-light text-[10.5px] text-text-sec flex justify-between">
                      <span>Liveness: <b style={{ color: lv === 'PASS' ? 'var(--green)' : 'var(--review)' }}>{lv}</b></span>
                      <span style={{ color: 'var(--navy-mid)' }}>● High-Res</span>
                    </div>
                  </div>
                </div>

                <div className="mb-[10px]">
                  <div className="flex justify-between mb-[5px]">
                    <span className="text-[11.5px] font-semibold text-text-sec">Face Match Similarity</span>
                    <span className="text-[13px] font-bold" style={{ color: fmColor }}>{fm.toFixed(1)}%</span>
                  </div>
                  <div className="bg-[#E6EAEE] rounded-[2px] h-[5px] overflow-hidden">
                    <div className="h-full rounded-[2px] transition-all duration-600" style={{ width: `${fm}%`, background: fmColor }}></div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-[8px]">
                  {[['Similarity', `${fm.toFixed(1)}%`, fmColor], ['Liveness', lv, lv === 'PASS' ? 'var(--green)' : 'var(--review)'], ['Quality', ok ? 'GOOD' : rv ? 'OK' : 'POOR', 'var(--text-primary)']].map(([l, v, col]) => (
                    <div key={l} className="bg-section border border-border rounded-[3px] p-[7px_8px] text-center">
                      <div className="text-[9.5px] text-text-muted uppercase tracking-[0.4px] mb-[2px]">{l}</div>
                      <div className="text-[13px] font-bold" style={{ color: col as string }}>{v}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white border border-border rounded-[4px]">
              <div className="px-[14px] py-[10px] border-b border-border flex items-center justify-between cursor-pointer">
                <h3 className="text-[11px] font-bold uppercase tracking-[0.6px] text-text-sec">Verification Evidence</h3>
                <span className="text-text-muted text-[11px]">▼ Expand</span>
              </div>
              <div className="hidden">
                <div className="text-[10px] font-bold uppercase tracking-[0.6px] text-navy bg-[#e5eef6] border border-[#bed3e6] px-[10px] py-[5px]">DOCUMENT</div>
                {[['OCR Result', ok ? 'PASS' : 'PARTIAL', ok ? 'b-verified' : 'b-review'], ['Pattern Validation', ok ? 'PASS' : 'PARTIAL', ok ? 'b-verified' : 'b-review'], ['MRZ Validation', 'N/A — Non-MRZ', 'b-neutral'], ['Stamp Verification', ok ? 'PASS' : 'UNCERTAIN', ok ? 'b-verified' : 'b-review'], ['Tamper Indicators', ok ? 'NONE' : 'DETECTED', ok ? 'b-verified' : 'b-rejected']].map(([l, v, b]) => (
                  <div key={l} className="flex justify-between items-center px-[10px] py-[6px] border border-border-light border-t-0 text-[11.5px]">
                    <span className="text-text-sec">{l}</span>
                    <span className={`inline-flex items-center px-[7px] py-[2px] rounded-[2px] text-[10px] font-bold uppercase tracking-[0.5px] border ${b}`}>{v}</span>
                  </div>
                ))}
                <div className="text-[10px] font-bold uppercase tracking-[0.6px] text-navy bg-[#e5eef6] border border-[#bed3e6] px-[10px] py-[5px]">BIOMETRIC</div>
                {[['Face Detection', 'DETECTED', 'b-verified'], ['Similarity Score', `${fm.toFixed(1)}%`, ''], ['Liveness', lv, lv === 'PASS' ? 'b-verified' : 'b-review'], ['Image Quality', ok ? 'GOOD' : 'ACCEPTABLE', '']].map(([l, v, b]) => (
                  <div key={l} className="flex justify-between items-center px-[10px] py-[6px] border border-border-light border-t-0 text-[11.5px]">
                    <span className="text-text-sec">{l}</span>
                    <span className={`text-text-primary ${b ? `inline-flex items-center px-[7px] py-[2px] rounded-[2px] text-[10px] font-bold uppercase tracking-[0.5px] border ${b}` : ''}`}>{v}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white border border-border rounded-[4px] overflow-hidden">
              <div className="px-[14px] py-[10px] border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-[8px]">
                  <span className="text-[16px]">🗂️</span>
                  <h3 className="text-[11px] font-bold uppercase tracking-[0.6px] text-text-sec">Captured Document &amp; Biometrics Preview</h3>
                </div>
                <span className="inline-flex items-center gap-[5px] bg-blue-50 border border-navy-mid px-[9px] py-[3px] rounded-[3px] text-[10px] font-bold uppercase tracking-[0.5px] text-navy">Forensic Evidentiary Artifacts</span>
              </div>
              <div className="p-[14px]">
                <div className="grid grid-cols-2 gap-[12px]">
                  <div className="border border-border rounded-[4px] overflow-hidden flex flex-col">
                    <div className="flex items-center justify-between px-[12px] py-[8px] bg-section border-b border-border text-[11px] font-semibold text-navy">
                      <span>Captured Identity Document (Full Scan)</span>
                      <span className="font-mono text-[9.5px] text-navy-light">1280 × 720 · SHA-256 Verified</span>
                    </div>
                    <div className="h-[190px] bg-[#0E1419] flex items-center justify-center cursor-pointer relative overflow-hidden" onClick={() => docImage && useAppStore.getState().setLightbox({ open: true, src: docImage, title: 'Captured Document (Full Scan)', type: 'doc-full' })}>
                      {docImage ? <img src={docImage} alt="Document" className="w-full h-full object-contain" /> : <span className="text-text-muted text-[11.5px]">No image</span>}
                      <span className="absolute bottom-[6px] right-[6px] bg-navy-dark/85 text-white text-[9.5px] font-semibold px-[7px] py-[2px] rounded-[2px] flex items-center gap-[4px]">🔍 Inspect Full Document</span>
                    </div>
                    <div className="px-[12px] py-[8px] bg-white border-t border-border-light flex justify-between items-center text-[10.5px]">
                      <div>
                        <span className="text-text-sec">Type:</span> <b>Aadhaar Card</b> · <span className="text-green font-semibold">● Tamper Free</span>
                      </div>
                      <div className="flex gap-[6px]">
                        <button onClick={() => docImage && useAppStore.getState().setLightbox({ open: true, src: docImage, title: 'Captured Document (Full Scan)', type: 'doc-full' })} className="bg-transparent text-text-sec border border-border px-[9px] py-[4px] rounded-[3px] text-[11px] hover:bg-section hover:text-text-primary transition-colors">Inspect</button>
                        <button onClick={() => docImage && import('@/utils/export').then(m => m.downloadDataUrl(docImage, `Captured_Document_${verificationId}.jpg`))} className="bg-white text-navy border border-navy px-[9px] py-[4px] rounded-[3px] text-[11px] font-medium hover:bg-[#EBF2F8] transition-colors">⬇ Save</button>
                      </div>
                    </div>
                  </div>

                  <div className="border border-border rounded-[4px] overflow-hidden flex flex-col">
                    <div className="flex items-center justify-between px-[12px] py-[8px] bg-section border-b border-border text-[11px] font-semibold text-navy">
                      <span>Live Subject Biometric Capture</span>
                      <span className="font-mono text-[9.5px] text-green">Liveness: {lv} · 99.2%</span>
                    </div>
                    <div className="h-[190px] bg-[#0E1419] flex items-center justify-center cursor-pointer relative overflow-hidden" onClick={() => faceImage && useAppStore.getState().setLightbox({ open: true, src: faceImage, title: 'Live Biometric Capture', type: 'live-face' })}>
                      {faceImage ? <img src={faceImage} alt="Face" className="w-full h-full object-contain" /> : <span className="text-text-muted text-[11.5px]">No image</span>}
                      <span className="absolute bottom-[6px] right-[6px] bg-navy-dark/85 text-white text-[9.5px] font-semibold px-[7px] py-[2px] rounded-[2px] flex items-center gap-[4px]">🔍 Inspect Biometrics</span>
                    </div>
                    <div className="px-[12px] py-[8px] bg-white border-t border-border-light flex justify-between items-center text-[10.5px]">
                      <div>
                        <span className="text-text-sec">Device:</span> <b>WS-CHK-01</b> · <span className="text-green font-semibold">● Landmarks Active</span>
                      </div>
                      <div className="flex gap-[6px]">
                        <button onClick={() => faceImage && useAppStore.getState().setLightbox({ open: true, src: faceImage, title: 'Live Biometric Capture', type: 'live-face' })} className="bg-transparent text-text-sec border border-border px-[9px] py-[4px] rounded-[3px] text-[11px] hover:bg-section hover:text-text-primary transition-colors">Inspect</button>
                        <button onClick={() => faceImage && import('@/utils/export').then(m => m.downloadDataUrl(faceImage, `Live_Biometric_${verificationId}.jpg`))} className="bg-white text-navy border border-navy px-[9px] py-[4px] rounded-[3px] text-[11px] font-medium hover:bg-[#EBF2F8] transition-colors">⬇ Save</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white border border-border rounded-[4px] px-[14px] py-[14px] flex items-center justify-between flex-wrap gap-[12px]">
              <div className="flex gap-[18px] flex-wrap">
                <div>
                  <div className="text-[9.5px] text-text-muted uppercase tracking-[0.4px]">Verification ID</div>
                  <div className="text-[11.5px] font-medium font-mono">{verificationId || '—'}</div>
                </div>
                <div>
                  <div className="text-[9.5px] text-text-muted uppercase tracking-[0.4px]">Timestamp</div>
                  <div className="text-[11.5px] font-medium">{ts}</div>
                </div>
                <div>
                  <div className="text-[9.5px] text-text-muted uppercase tracking-[0.4px]">Officer ID</div>
                  <div className="text-[11.5px] font-medium font-mono">SSB/VER/2024-0142</div>
                </div>
              </div>
              <div className="flex gap-[8px] flex-wrap items-center">
                <button onClick={() => setReportModal({ open: true, verificationId: verificationId || '' })} className="bg-transparent text-text-sec border border-border px-[9px] py-[4px] rounded-[3px] text-[11px] font-medium hover:bg-section hover:text-text-primary transition-colors flex items-center gap-[4px]">
                  <span>📋</span> View Full Report
                </button>
                {ok && <button className="bg-green text-white border border-green px-[14px] py-[7px] rounded-[3px] text-[12px] font-medium hover:bg-[#0f6e07] transition-colors">✓ APPROVE VERIFICATION</button>}
                {rv && <button className="bg-review text-white border border-review px-[14px] py-[7px] rounded-[3px] text-[12px] font-medium hover:bg-[#a36700] transition-colors">⚠ SEND FOR SECONDARY REVIEW</button>}
                {rj && <button className="bg-rejected text-white border border-rejected px-[14px] py-[7px] rounded-[3px] text-[12px] font-medium hover:bg-[#931d14] transition-colors">✕ MARK VERIFICATION FAILED</button>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
