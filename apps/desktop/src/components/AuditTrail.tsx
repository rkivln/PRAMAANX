
const AUDIT = [
  { ts: '11:34:22', off: 'SSB/VER/2024-0142', ev: 'VERIFICATION_COMPLETE', vid: 'VR-20241204-00047', act: 'Decision: VERIFIED', res: 'Success', ws: 'WS-CHK-01' },
  { ts: '11:34:01', off: 'SSB/VER/2024-0142', ev: 'FACE_CAPTURE', vid: 'VR-20241204-00047', act: 'Biometric captured', res: 'Success', ws: 'WS-CHK-01' },
  { ts: '11:33:44', off: 'SSB/VER/2024-0142', ev: 'DOC_CAPTURE', vid: 'VR-20241204-00047', act: 'Document captured', res: 'Success', ws: 'WS-CHK-01' },
  { ts: '11:33:12', off: 'SSB/VER/2024-0142', ev: 'VERIFICATION_START', vid: 'VR-20241204-00047', act: 'Session created', res: 'Success', ws: 'WS-CHK-01' },
  { ts: '11:18:55', off: 'SSB/VER/2024-0142', ev: 'VERIFICATION_COMPLETE', vid: 'VR-20241204-00046', act: 'Decision: VERIFIED', res: 'Success', ws: 'WS-CHK-01' },
  { ts: '11:09:38', off: 'SSB/VER/2024-0142', ev: 'REVIEW_FLAGGED', vid: 'VR-20241204-00044', act: 'Rule: Face Mismatch', res: 'Review', ws: 'WS-CHK-01' },
  { ts: '10:38:14', off: 'SSB/VER/2024-0142', ev: 'VERIFICATION_COMPLETE', vid: 'VR-20241204-00042', act: 'Decision: REJECTED', res: 'Rejected', ws: 'WS-CHK-01' },
  { ts: '08:01:05', off: 'SSB/VER/2024-0142', ev: 'SESSION_LOGIN', vid: '—', act: 'Officer login', res: 'Success', ws: 'WS-CHK-01' },
];

function evBadge(ev: string) {
  const m: Record<string, string> = {
    VERIFICATION_COMPLETE: 'b-verified', REVIEW_FLAGGED: 'b-review',
    SESSION_LOGIN: 'b-info', DOC_CAPTURE: 'b-neutral', FACE_CAPTURE: 'b-neutral', VERIFICATION_START: 'b-neutral',
  };
  return <span className={`inline-flex items-center gap-[3px] px-[7px] py-[2px] rounded-[2px] text-[10px] font-bold uppercase tracking-[0.5px] border ${m[ev] || 'b-neutral'}`}>{ev}</span>;
}

export default function AuditTrail() {
  const d = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' });

  return (
    <div className="flex flex-col flex-1">
      <div className="bg-white border-b border-border px-[20px] py-[12px] flex items-center justify-between flex-shrink-0">
        <div>
          <h1 className="text-[15px] font-semibold text-text-primary">Audit Trail</h1>
          <div className="text-[10.5px] text-text-muted mt-[1px]">System event log · Read-only · Tamper-evident</div>
        </div>
        <span className="inline-flex items-center gap-[5px] bg-blue-50 border border-navy-mid px-[9px] py-[3px] rounded-[3px] text-[10px] font-bold uppercase tracking-[0.5px] text-navy">Audit Logging Active</span>
      </div>

      <div className="px-[14px] py-[8px] bg-section border-b border-border flex items-center gap-[8px] flex-wrap flex-shrink-0">
        <span className="text-[10.5px] font-semibold text-text-muted uppercase tracking-[0.4px]">Filter:</span>
        <select className="px-[8px] py-[4px] border border-border rounded-[3px] text-[11.5px] text-text-primary bg-white"><option>All Events</option><option>Login</option><option>Verification</option><option>Decision</option><option>Error</option></select>
        <select className="px-[8px] py-[4px] border border-border rounded-[3px] text-[11.5px] text-text-primary bg-white"><option>All Officers</option><option>R. SHARMA</option></select>
        <input type="date" className="px-[8px] py-[4px] border border-border rounded-[3px] text-[11.5px] text-text-primary bg-white" />
        <button className="bg-transparent text-text-sec border border-border px-[9px] py-[4px] rounded-[3px] text-[11px] hover:bg-section hover:text-text-primary transition-colors">Apply</button>
        <button className="bg-transparent text-text-sec border border-border px-[9px] py-[4px] rounded-[3px] text-[11px] hover:bg-section hover:text-text-primary transition-colors ml-auto">Export Log</button>
      </div>

      <div className="p-[12px_20px] flex-1 overflow-y-auto">
        <div className="bg-white border border-border rounded-[4px]">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-[12px]">
              <thead>
                <tr>
                  <th className="bg-section text-text-muted text-[10.5px] font-semibold uppercase tracking-[0.5px] px-[11px] py-[8px] text-left border-b border-border whitespace-nowrap">Timestamp</th>
                  <th className="bg-section text-text-muted text-[10.5px] font-semibold uppercase tracking-[0.5px] px-[11px] py-[8px] text-left border-b border-border whitespace-nowrap">Officer ID</th>
                  <th className="bg-section text-text-muted text-[10.5px] font-semibold uppercase tracking-[0.5px] px-[11px] py-[8px] text-left border-b border-border whitespace-nowrap">Event Type</th>
                  <th className="bg-section text-text-muted text-[10.5px] font-semibold uppercase tracking-[0.5px] px-[11px] py-[8px] text-left border-b border-border whitespace-nowrap">Verification ID</th>
                  <th className="bg-section text-text-muted text-[10.5px] font-semibold uppercase tracking-[0.5px] px-[11px] py-[8px] text-left border-b border-border whitespace-nowrap">Action</th>
                  <th className="bg-section text-text-muted text-[10.5px] font-semibold uppercase tracking-[0.5px] px-[11px] py-[8px] text-left border-b border-border whitespace-nowrap">Result</th>
                  <th className="bg-section text-text-muted text-[10.5px] font-semibold uppercase tracking-[0.5px] px-[11px] py-[8px] text-left border-b border-border whitespace-nowrap">Workstation</th>
                </tr>
              </thead>
              <tbody>
                {AUDIT.map((e) => (
                  <tr key={e.ts} className="hover:bg-[#F5F7F9]">
                    <td className="px-[11px] py-[8px] border-b border-[#EFF1F4] font-mono text-[11px]">{d} {e.ts}</td>
                    <td className="px-[11px] py-[8px] border-b border-[#EFF1F4] font-mono text-[10.5px]">{e.off}</td>
                    <td className="px-[11px] py-[8px] border-b border-[#EFF1F4]">{evBadge(e.ev)}</td>
                    <td className="px-[11px] py-[8px] border-b border-[#EFF1F4] font-mono text-[10.5px]">{e.vid}</td>
                    <td className="px-[11px] py-[8px] border-b border-[#EFF1F4] text-text-sec">{e.act}</td>
                    <td className="px-[11px] py-[8px] border-b border-[#EFF1F4]">{e.res}</td>
                    <td className="px-[11px] py-[8px] border-b border-[#EFF1F4] font-mono text-[10.5px]">{e.ws}</td>
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
