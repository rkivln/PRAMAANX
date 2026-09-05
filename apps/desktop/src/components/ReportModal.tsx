import { useAppStore } from '@/store/app';
import { VerificationRecord } from '@/types';

const MOCK_RECORDS: VerificationRecord[] = [
  { id: 'VR-20241204-00047', t: '11:34', doc: 'Passport', dec: 'VERIFIED', fm: '96.2', authenticity: '97.3', liveness: 'PASS', risk: 'LOW', riskScore: '0.08', nm: 'P*** S***', off: 'R. SHARMA', st: 'Closed', timestamp: '04/12/2024, 11:34:22 IST', checkpoint: 'CHK-JALP-01 · Border Entry Checkpoint', workstation: 'WS-CHK-01' },
];

function getRecord(vid: string) {
  const rec = MOCK_RECORDS.find(r => r.id === vid);
  if (rec) return rec;
  return {
    id: vid,
    t: '11:34',
    doc: 'Aadhaar Card',
    docNum: 'XXXX XXXX 4821',
    dec: 'VERIFIED' as const,
    fm: '94.7',
    authenticity: '97.3',
    liveness: 'PASS',
    risk: 'LOW',
    riskScore: '0.08',
    nm: 'R*** S***',
    off: 'RAJESH SHARMA',
    st: 'Closed',
    timestamp: new Date().toLocaleString('en-IN') + ' IST',
    checkpoint: 'CHK-JALP-01 · Border Entry Checkpoint',
    workstation: 'WS-CHK-01',
  };
}

export default function ReportModal() {
  const { reportModal, setReportModal } = useAppStore();
  const rec = getRecord(reportModal.verificationId || '');

  if (!reportModal.open) return null;

  const ok = rec.dec === 'VERIFIED';
  const rv = rec.dec === 'REVIEW';
  const color = ok ? '#138808' : rv ? '#C47A00' : '#B42318';
  const bg = ok ? '#E6F4E6' : rv ? '#FFF3D6' : '#FDECEA';
  const fm = rec.fm || (ok ? '94.7' : rv ? '78.2' : '61.3');
  const ds = rec.authenticity || (ok ? '97.3' : rv ? '82.1' : '54.6');
  const ts = rec.timestamp || (rec.t + ' IST');

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-[5px] z-[9990] flex items-center justify-center p-[16px]" onClick={() => setReportModal({ open: false, verificationId: null })}>
      <div className="w-[900px] max-w-[96vw] max-h-[94vh] bg-white rounded-[8px] overflow-hidden flex flex-col shadow-[0_24px_60px_rgba(0,0,0,0.45)]" onClick={(e) => e.stopPropagation()}>
        <div className="bg-navy-dark text-white px-[20px] py-[12px] flex items-center justify-between border-t-[3px] border-saffron">
          <div className="flex items-center gap-[10px]">
            <span className="text-[18px]">📋</span>
            <div>
              <div className="text-[13px] font-bold tracking-[0.4px]">GOVERNMENT OF INDIA · VERIFICATION DOSSIER</div>
              <div className="text-[10.5px] text-white/70">{`Verification Dossier: ${rec.id} · Generated at ${rec.t || '11:34'} IST`}</div>
            </div>
          </div>
          <button onClick={() => setReportModal({ open: false, verificationId: null })} className="bg-transparent text-white border border-white/18 px-[9px] py-[4px] rounded-[3px] text-[11px] hover:bg-white/9 transition-colors">✕ Close</button>
        </div>

        <div className="flex-1 overflow-y-auto p-[30px] bg-[#FAFBFD]">
          <div className="bg-white border border-border rounded-[4px] p-[32px] shadow-[0_2px_10px_rgba(0,0,0,0.05)] relative">
            <div className="absolute inset-[6px] border border-navy/18 pointer-events-none rounded-[2px]"></div>

            <div className="flex items-center justify-between border-b-[2px] border-navy pb-[16px] mb-[20px]">
              <div className="w-[60px] h-[60px] border-[2px] border-navy rounded-full overflow-hidden flex items-center justify-center bg-[#18191B] flex-shrink-0">
                <img src="/emblem_logo.jpg" alt="Government of India Emblem" className="w-full h-full object-cover" onError={(e) => (e.target as HTMLImageElement).style.display = 'none'} />
              </div>
              <div className="flex-1 text-center px-[15px]">
                <div className="text-[15px] font-bold text-navy-dark uppercase tracking-[0.5px]">Government of India · Ministry of Home Affairs</div>
                <div className="text-[11px] text-text-sec uppercase font-medium mt-[4px]">PRAMAANX IDENTITY &amp; DOCUMENT SCREENING SYSTEM</div>
                <div className="text-[13px] font-bold text-navy-mid mt-[4px]">Official Verification &amp; Forensic Dossier</div>
              </div>
              <div className="px-[12px] py-[6px] rounded-[4px] text-[12px] font-bold text-center border-[1.5px]" style={{ background: bg, color, borderColor: color }}>
                {rec.dec}
              </div>
            </div>

            <div className="grid grid-cols-4 gap-[10px] mb-[18px]">
              <div className="bg-[#F4F7F9] border border-border-light p-[7px_10px] rounded-[3px]">
                <div className="text-[9px] font-semibold uppercase text-text-muted">Verification ID</div>
                <div className="text-[12px] font-bold text-text-primary mt-[1px] font-mono">{rec.id}</div>
              </div>
              <div className="bg-[#F4F7F9] border border-border-light p-[7px_10px] rounded-[3px]">
                <div className="text-[9px] font-semibold uppercase text-text-muted">Date &amp; Time</div>
                <div className="text-[12px] font-bold text-text-primary mt-[1px]">{ts}</div>
              </div>
              <div className="bg-[#F4F7F9] border border-border-light p-[7px_10px] rounded-[3px]">
                <div className="text-[9px] font-semibold uppercase text-text-muted">Screening Officer</div>
                <div className="text-[12px] font-bold text-text-primary mt-[1px]">{rec.off || 'RAJESH SHARMA'}</div>
              </div>
              <div className="bg-[#F4F7F9] border border-border-light p-[7px_10px] rounded-[3px]">
                <div className="text-[9px] font-semibold uppercase text-text-muted">Officer ID</div>
                <div className="text-[12px] font-bold text-text-primary mt-[1px] font-mono">SSB/VER/2024-0142</div>
              </div>
              <div className="bg-[#F4F7F9] border border-border-light p-[7px_10px] rounded-[3px]">
                <div className="text-[9px] font-semibold uppercase text-text-muted">Checkpoint ID</div>
                <div className="text-[12px] font-bold text-text-primary mt-[1px] font-mono">CHK-JALP-01</div>
              </div>
              <div className="bg-[#F4F7F9] border border-border-light p-[7px_10px] rounded-[3px]">
                <div className="text-[9px] font-semibold uppercase text-text-muted">Workstation</div>
                <div className="text-[12px] font-bold text-text-primary mt-[1px] font-mono">WS-CHK-01</div>
              </div>
              <div className="bg-[#F4F7F9] border border-border-light p-[7px_10px] rounded-[3px]">
                <div className="text-[9px] font-semibold uppercase text-text-muted">Document Type</div>
                <div className="text-[12px] font-bold text-text-primary mt-[1px]">{rec.doc || 'Aadhaar Card'}</div>
              </div>
              <div className="bg-[#F4F7F9] border border-border-light p-[7px_10px] rounded-[3px]">
                <div className="text-[9px] font-semibold uppercase text-text-muted">Document Number</div>
                <div className="text-[12px] font-bold text-text-primary mt-[1px] font-mono">{rec.docNum || 'XXXX XXXX 4821'}</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-[18px] mb-[18px]">
              <div className="border border-border rounded-[4px] overflow-hidden bg-white">
                <div className="bg-[#EDF2F7] px-[12px] py-[6px] flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase text-navy">Captured Document (Full Scan)</span>
                  <span className="font-mono text-[10px] text-navy-light">Authenticity: {ds}%</span>
                </div>
                <div className="h-[180px] bg-[#0F161C] flex items-center justify-center p-[6px]">
                  <div className="w-full h-full bg-[#E8EBED] flex items-center justify-center text-text-muted text-[11.5px]">Document Image Placeholder</div>
                </div>
                <div className="px-[10px] py-[6px] bg-[#F8FAFC] border-t border-border-light flex justify-between text-[10px] text-text-sec">
                  <span>SHA-256: Verified</span>
                  <span style={{ color: 'var(--green)', fontWeight: 600 }}>● Tamper Free</span>
                </div>
              </div>

              <div className="border border-border rounded-[4px] overflow-hidden bg-white">
                <div className="bg-[#EDF2F7] px-[12px] py-[6px] flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase text-navy">Live Biometric Face Capture</span>
                  <span className="font-mono text-[10px] text-green">Match: {fm}%</span>
                </div>
                <div className="h-[180px] bg-[#0F161C] flex items-center justify-center p-[6px]">
                  <div className="w-full h-full bg-[#E8EBED] flex items-center justify-center text-text-muted text-[11.5px]">Face Image Placeholder</div>
                </div>
                <div className="px-[10px] py-[6px] bg-[#F8FAFC] border-t border-border-light flex justify-between text-[10px] text-text-sec">
                  <span>Liveness: {rec.liveness || 'PASS'}</span>
                  <span style={{ color: 'var(--navy-mid)', fontWeight: 600 }}>● InsightFace Model</span>
                </div>
              </div>
            </div>

            <table className="w-full border-collapse mb-[18px] text-[11px]">
              <thead>
                <tr>
                  <th className="border border-[#D9E1E8] px-[10px] py-[6px] text-left bg-[#EEF3F8] font-semibold text-navy-dark text-[10px] uppercase">Assessment Component</th>
                  <th className="border border-[#D9E1E8] px-[10px] py-[6px] text-left bg-[#EEF3F8] font-semibold text-navy-dark text-[10px] uppercase">Measured Metric</th>
                  <th className="border border-[#D9E1E8] px-[10px] py-[6px] text-left bg-[#EEF3F8] font-semibold text-navy-dark text-[10px] uppercase">Engine / Standard</th>
                  <th className="border border-[#D9E1E8] px-[10px] py-[6px] text-left bg-[#EEF3F8] font-semibold text-navy-dark text-[10px] uppercase">Result Status</th>
                </tr>
              </thead>
              <tbody>
                <tr><td className="border border-[#D9E1E8] px-[10px] py-[6px]"><b>Document Authenticity</b></td><td className="border border-[#D9E1E8] px-[10px] py-[6px]">{ds}% Score</td><td className="border border-[#D9E1E8] px-[10px] py-[6px]">Tesseract 5.3 + Local Python Engine</td><td className="border border-[#D9E1E8] px-[10px] py-[6px]" style={{ color, fontWeight: 700 }}>{ok ? 'PASSED' : rv ? 'UNDER REVIEW' : 'FAILED'}</td></tr>
                <tr><td className="border border-[#D9E1E8] px-[10px] py-[6px]"><b>Biometric Face Match</b></td><td className="border border-[#D9E1E8] px-[10px] py-[6px]">{fm}% Similarity</td><td className="border border-[#D9E1E8] px-[10px] py-[6px]">InsightFace Local Model (512-dim Embedding)</td><td className="border border-[#D9E1E8] px-[10px] py-[6px]" style={{ color, fontWeight: 700 }}>{ok ? 'CONFIRMED' : rv ? 'UNCERTAIN' : 'MISMATCH'}</td></tr>
                <tr><td className="border border-[#D9E1E8] px-[10px] py-[6px]"><b>Liveness Assessment</b></td><td className="border border-[#D9E1E8] px-[10px] py-[6px]">Active Challenge Pass (99.2%)</td><td className="border border-[#D9E1E8] px-[10px] py-[6px]">Local Passive + Texture Analysis</td><td className="border border-[#D9E1E8] px-[10px] py-[6px]" style={{ color: 'var(--green)', fontWeight: 700 }}>PASS</td></tr>
                <tr><td className="border border-[#D9E1E8] px-[10px] py-[6px]"><b>Tamper &amp; Integrity Analysis</b></td><td className="border border-[#D9E1E8] px-[10px] py-[6px]">No digital or physical alterations</td><td className="border border-[#D9E1E8] px-[10px] py-[6px]">Forensic Edge &amp; Color Discrepancy</td><td className="border border-[#D9E1E8] px-[10px] py-[6px]" style={{ color: ok ? 'var(--green)' : 'var(--rejected)', fontWeight: 700 }}>{ok ? 'CLEAN' : 'FLAGGED'}</td></tr>
                <tr><td className="border border-[#D9E1E8] px-[10px] py-[6px]"><b>Overall Risk Assessment</b></td><td className="border border-[#D9E1E8] px-[10px] py-[6px]">Score: {rec.riskScore || '0.08'} · Level: {rec.risk || 'LOW'}</td><td className="border border-[#D9E1E8] px-[10px] py-[6px]">MHA PRAMAANX Multi-Modal Rules v2.4</td><td className="border border-[#D9E1E8] px-[10px] py-[6px]" style={{ color, fontWeight: 700 }}>{rec.risk || 'LOW'}</td></tr>
              </tbody>
            </table>

            <div className="flex justify-between items-end border-t border-border pt-[18px] mt-[16px]">
              <div className="w-[90px] h-[90px] border-[2px] border-dashed border-navy-mid rounded-full flex flex-col items-center justify-center text-[8px] font-bold text-navy-mid text-center uppercase transform -rotate-[8deg] opacity-85">
                <div>GOVERNMENT OF INDIA</div>
                <div className="text-[10px] mt-[2px]">★ PRAMAANX ★</div>
                <div>VERIFIED SEAL</div>
              </div>
              <div>
                <div className="w-[220px] border-t border-text-primary text-center pt-[5px] text-[11px] font-bold text-text-primary">{rec.off || 'RAJESH SHARMA'}</div>
                <div className="text-center text-[9.5px] text-text-muted mt-[2px]">Authorized Screening Officer · WS-CHK-01</div>
              </div>
            </div>
          </div>
        </div>

        <div className="px-[24px] py-[12px] bg-section border-t border-border flex items-center justify-between flex-wrap gap-[10px]">
          <div className="flex items-center gap-[8px] flex-wrap">
            <span className="text-[11px] font-semibold text-text-sec">Download Report:</span>
            <button className="bg-white text-[#D9381E] border border-border px-[9px] py-[4px] rounded-[3px] text-[11px] font-semibold hover:bg-section transition-colors">📄 PDF</button>
            <button className="bg-white text-[#2B579A] border border-border px-[9px] py-[4px] rounded-[3px] text-[11px] font-semibold hover:bg-section transition-colors">📝 Word (.doc)</button>
            <button className="bg-white text-[#217346] border border-border px-[9px] py-[4px] rounded-[3px] text-[11px] font-semibold hover:bg-section transition-colors">📊 Excel (.xlsx)</button>
            <button className="bg-white text-[#107C41] border border-border px-[9px] py-[4px] rounded-[3px] text-[11px] font-semibold hover:bg-section transition-colors">📑 CSV</button>
          </div>
          <div className="flex gap-[8px]">
            <button className="bg-transparent text-text-sec border border-border px-[9px] py-[4px] rounded-[3px] text-[11px] hover:bg-section hover:text-text-primary transition-colors">🖨️ Print Certificate</button>
            <button onClick={() => setReportModal({ open: false, verificationId: null })} className="bg-navy text-white border border-navy px-[14px] py-[7px] rounded-[3px] text-[12px] font-medium hover:bg-navy-dark transition-colors">Done</button>
          </div>
        </div>
      </div>
    </div>
  );
}
