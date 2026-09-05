const PENDING = [
  { id: 'VR-20241204-00039', t: '09:47', doc: 'Passport', rule: 'Face Mismatch >15%', risk: 'MEDIUM', off: 'R. SHARMA' },
  { id: 'VR-20241204-00041', t: '10:23', doc: 'Aadhaar Card', rule: 'OCR Confidence Low', risk: 'LOW', off: 'R. SHARMA' },
  { id: 'VR-20241204-00044', t: '11:09', doc: 'Voter ID', rule: 'Tamper Indicator Detected', risk: 'HIGH', off: 'R. SHARMA' },
];

function riskStyle(risk: string) {
  return risk === 'LOW' ? { color: 'var(--green)' } : risk === 'MEDIUM' ? { color: 'var(--review)' } : { color: 'var(--rejected)' };
}

export default function PendingReview() {
  return (
    <div className="flex flex-col flex-1">
      <div className="bg-white border-b border-border px-[20px] py-[12px] flex items-center justify-between flex-shrink-0">
        <div>
          <h1 className="text-[15px] font-semibold text-text-primary">Pending Review</h1>
          <div className="text-[10.5px] text-text-muted mt-[1px]">{PENDING.length} verifications awaiting supervisory decision</div>
        </div>
        <span className="inline-flex items-center gap-[5px] bg-reviewPale border border-review px-[9px] py-[3px] rounded-[3px] text-[10px] font-bold uppercase tracking-[0.5px] text-[#7a5000]">3 Pending</span>
      </div>

      <div className="p-[18px_20px] flex-1 overflow-y-auto">
        <div className="bg-white border border-border rounded-[4px]">
          <div className="px-[14px] py-[10px] border-b border-border">
            <h3 className="text-[11px] font-bold uppercase tracking-[0.6px] text-text-sec">Verifications Requiring Review</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-[12px]">
              <thead>
                <tr>
                  <th className="bg-section text-text-muted text-[10.5px] font-semibold uppercase tracking-[0.5px] px-[11px] py-[8px] text-left border-b border-border whitespace-nowrap">Verification ID</th>
                  <th className="bg-section text-text-muted text-[10.5px] font-semibold uppercase tracking-[0.5px] px-[11px] py-[8px] text-left border-b border-border whitespace-nowrap">Time</th>
                  <th className="bg-section text-text-muted text-[10.5px] font-semibold uppercase tracking-[0.5px] px-[11px] py-[8px] text-left border-b border-border whitespace-nowrap">Document Type</th>
                  <th className="bg-section text-text-muted text-[10.5px] font-semibold uppercase tracking-[0.5px] px-[11px] py-[8px] text-left border-b border-border whitespace-nowrap">Triggered Rule</th>
                  <th className="bg-section text-text-muted text-[10.5px] font-semibold uppercase tracking-[0.5px] px-[11px] py-[8px] text-left border-b border-border whitespace-nowrap">Risk Level</th>
                  <th className="bg-section text-text-muted text-[10.5px] font-semibold uppercase tracking-[0.5px] px-[11px] py-[8px] text-left border-b border-border whitespace-nowrap">Officer</th>
                  <th className="bg-section text-text-muted text-[10.5px] font-semibold uppercase tracking-[0.5px] px-[11px] py-[8px] text-left border-b border-border whitespace-nowrap">Action</th>
                </tr>
              </thead>
              <tbody>
                {PENDING.map((v) => (
                  <tr key={v.id} className="hover:bg-[#F5F7F9]">
                    <td className="px-[11px] py-[8px] border-b border-[#EFF1F4] font-mono text-[11px]">{v.id}</td>
                    <td className="px-[11px] py-[8px] border-b border-[#EFF1F4]">{v.t} IST</td>
                    <td className="px-[11px] py-[8px] border-b border-[#EFF1F4]">{v.doc}</td>
                    <td className="px-[11px] py-[8px] border-b border-[#EFF1F4]">
                      <span className={`inline-flex items-center gap-[3px] px-[7px] py-[2px] rounded-[2px] text-[10px] font-bold uppercase tracking-[0.5px] border ${v.risk === 'HIGH' ? 'bg-rejectedPale border-rejected text-rejected' : 'bg-reviewPale border-review text-[#7a5000]'}`}>{v.rule}</span>
                    </td>
                    <td className="px-[11px] py-[8px] border-b border-[#EFF1F4]"><span style={{ ...riskStyle(v.risk), fontWeight: 700 }}>{v.risk}</span></td>
                    <td className="px-[11px] py-[8px] border-b border-[#EFF1F4]">{v.off}</td>
                    <td className="px-[11px] py-[8px] border-b border-[#EFF1F4]">
                      <button className="bg-white text-navy border border-navy px-[9px] py-[4px] rounded-[3px] text-[11px] font-medium hover:bg-[#EBF2F8] transition-colors">Review</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
