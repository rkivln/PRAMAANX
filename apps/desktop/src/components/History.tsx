import { useAppStore } from '@/store/app';
import { VerificationRecord } from '@/types';

const MOCK_RECORDS: VerificationRecord[] = [
  { id: 'VR-20241204-00047', t: '11:34', doc: 'Passport', nm: 'P*** S***', dec: 'VERIFIED', fm: '96.2', risk: 'LOW', off: 'R. SHARMA', st: 'Closed', timestamp: '04/12/2024, 11:34:22 IST', checkpoint: 'CHK-JALP-01 · Border Entry Checkpoint', workstation: 'WS-CHK-01' },
  { id: 'VR-20241204-00046', t: '11:18', doc: 'Aadhaar', nm: 'M*** K***', dec: 'VERIFIED', fm: '91.4', risk: 'LOW', off: 'R. SHARMA', st: 'Closed', timestamp: '04/12/2024, 11:18:55 IST', checkpoint: 'CHK-JALP-01 · Border Entry Checkpoint', workstation: 'WS-CHK-01' },
  { id: 'VR-20241204-00045', t: '11:02', doc: 'Voter ID', nm: 'A*** R***', dec: 'VERIFIED', fm: '88.7', risk: 'LOW', off: 'R. SHARMA', st: 'Closed', timestamp: '04/12/2024, 11:02:14 IST', checkpoint: 'CHK-JALP-01 · Border Entry Checkpoint', workstation: 'WS-CHK-01' },
  { id: 'VR-20241204-00044', t: '11:09', doc: 'Voter ID', nm: 'S*** B***', dec: 'REVIEW', fm: '72.1', risk: 'HIGH', off: 'R. SHARMA', st: 'Pending', timestamp: '04/12/2024, 11:09:38 IST', checkpoint: 'CHK-JALP-01 · Border Entry Checkpoint', workstation: 'WS-CHK-01' },
  { id: 'VR-20241204-00043', t: '10:51', doc: 'Passport', nm: 'V*** T***', dec: 'VERIFIED', fm: '93.8', risk: 'LOW', off: 'R. SHARMA', st: 'Closed', timestamp: '04/12/2024, 10:51:07 IST', checkpoint: 'CHK-JALP-01 · Border Entry Checkpoint', workstation: 'WS-CHK-01' },
  { id: 'VR-20241204-00042', t: '10:38', doc: 'Aadhaar', nm: 'R*** J***', dec: 'REJECTED', fm: '61.3', risk: 'HIGH', off: 'R. SHARMA', st: 'Closed', timestamp: '04/12/2024, 10:38:14 IST', checkpoint: 'CHK-JALP-01 · Border Entry Checkpoint', workstation: 'WS-CHK-01' },
  { id: 'VR-20241204-00041', t: '10:23', doc: 'Aadhaar', nm: 'D*** P***', dec: 'REVIEW', fm: '79.5', risk: 'LOW', off: 'R. SHARMA', st: 'Pending', timestamp: '04/12/2024, 10:23:41 IST', checkpoint: 'CHK-JALP-01 · Border Entry Checkpoint', workstation: 'WS-CHK-01' },
  { id: 'VR-20241204-00040', t: '10:11', doc: 'Passport', nm: 'N*** G***', dec: 'VERIFIED', fm: '97.1', risk: 'LOW', off: 'R. SHARMA', st: 'Closed', timestamp: '04/12/2024, 10:11:33 IST', checkpoint: 'CHK-JALP-01 · Border Entry Checkpoint', workstation: 'WS-CHK-01' },
];

function badgeClass(dec: string) {
  return dec === 'VERIFIED' ? 'b-verified' : dec === 'REVIEW' ? 'b-review' : 'b-rejected';
}

function riskStyle(risk: string) {
  return risk === 'LOW' ? { color: 'var(--green)' } : risk === 'MEDIUM' ? { color: 'var(--review)' } : { color: 'var(--rejected)' };
}

export default function History({ onNavigate }: { onNavigate: (page: string) => void }) {
  const setReportModal = useAppStore((s: any) => s.setReportModal);

  return (
    <div className="flex flex-col flex-1">
      <div className="bg-white border-b border-border px-[20px] py-[12px] flex items-center justify-between flex-shrink-0">
        <div>
          <h1 className="text-[15px] font-semibold text-text-primary">Verification History</h1>
          <div className="text-[10.5px] text-text-muted mt-[1px]">All verifications · Current session</div>
        </div>
        <button onClick={() => onNavigate('verification')} className="bg-navy text-white border border-navy px-[14px] py-[7px] rounded-[3px] text-[12px] font-medium hover:bg-navy-dark hover:border-navy-dark transition-colors">+ New Verification</button>
      </div>

      <div className="px-[14px] py-[8px] bg-section border-b border-border flex items-center gap-[8px] flex-wrap flex-shrink-0">
        <span className="text-[10.5px] font-semibold text-text-muted uppercase tracking-[0.4px]">Filter:</span>
        <select className="px-[8px] py-[4px] border border-border rounded-[3px] text-[11.5px] text-text-primary bg-white"><option>All Decisions</option><option>Verified</option><option>Review</option><option>Rejected</option></select>
        <select className="px-[8px] py-[4px] border border-border rounded-[3px] text-[11.5px] text-text-primary bg-white"><option>All Documents</option><option>Aadhaar</option><option>Passport</option><option>Voter ID</option></select>
        <select className="px-[8px] py-[4px] border border-border rounded-[3px] text-[11.5px] text-text-primary bg-white"><option>All Officers</option><option>R. SHARMA</option></select>
        <input type="date" className="px-[8px] py-[4px] border border-border rounded-[3px] text-[11.5px] text-text-primary bg-white" />
        <button className="bg-transparent text-text-sec border border-border px-[9px] py-[4px] rounded-[3px] text-[11px] hover:bg-section hover:text-text-primary transition-colors">Apply</button>
        <button className="bg-transparent text-text-sec border border-border px-[9px] py-[4px] rounded-[3px] text-[11px] hover:bg-section hover:text-text-primary transition-colors ml-auto">Export CSV</button>
        <button className="bg-transparent text-text-sec border border-border px-[9px] py-[4px] rounded-[3px] text-[11px] hover:bg-section hover:text-text-primary transition-colors">Export Excel</button>
      </div>

      <div className="p-[12px_20px] flex-1 overflow-y-auto">
        <div className="bg-white border border-border rounded-[4px]">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-[12px]">
              <thead>
                <tr>
                  <th className="bg-section text-text-muted text-[10.5px] font-semibold uppercase tracking-[0.5px] px-[11px] py-[8px] text-left border-b border-border whitespace-nowrap">Verification ID</th>
                  <th className="bg-section text-text-muted text-[10.5px] font-semibold uppercase tracking-[0.5px] px-[11px] py-[8px] text-left border-b border-border whitespace-nowrap">Time</th>
                  <th className="bg-section text-text-muted text-[10.5px] font-semibold uppercase tracking-[0.5px] px-[11px] py-[8px] text-left border-b border-border whitespace-nowrap">Document</th>
                  <th className="bg-section text-text-muted text-[10.5px] font-semibold uppercase tracking-[0.5px] px-[11px] py-[8px] text-left border-b border-border whitespace-nowrap">Name (Masked)</th>
                  <th className="bg-section text-text-muted text-[10.5px] font-semibold uppercase tracking-[0.5px] px-[11px] py-[8px] text-left border-b border-border whitespace-nowrap">Decision</th>
                  <th className="bg-section text-text-muted text-[10.5px] font-semibold uppercase tracking-[0.5px] px-[11px] py-[8px] text-left border-b border-border whitespace-nowrap">Face Match</th>
                  <th className="bg-section text-text-muted text-[10.5px] font-semibold uppercase tracking-[0.5px] px-[11px] py-[8px] text-left border-b border-border whitespace-nowrap">Risk</th>
                  <th className="bg-section text-text-muted text-[10.5px] font-semibold uppercase tracking-[0.5px] px-[11px] py-[8px] text-left border-b border-border whitespace-nowrap">Officer</th>
                  <th className="bg-section text-text-muted text-[10.5px] font-semibold uppercase tracking-[0.5px] px-[11px] py-[8px] text-left border-b border-border whitespace-nowrap">Action</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_RECORDS.map((v) => (
                  <tr key={v.id} className="hover:bg-[#F5F7F9]">
                    <td className="px-[11px] py-[8px] border-b border-[#EFF1F4] font-mono text-[11px]">{v.id}</td>
                    <td className="px-[11px] py-[8px] border-b border-[#EFF1F4]">{v.t} IST</td>
                    <td className="px-[11px] py-[8px] border-b border-[#EFF1F4]">{v.doc}</td>
                    <td className="px-[11px] py-[8px] border-b border-[#EFF1F4] text-text-muted">{v.nm}</td>
                    <td className="px-[11px] py-[8px] border-b border-[#EFF1F4]">
                      <span className={`inline-flex items-center gap-[3px] px-[7px] py-[2px] rounded-[2px] text-[10px] font-bold uppercase tracking-[0.5px] border ${badgeClass(v.dec)}`}>{v.dec}</span>
                    </td>
                    <td className="px-[11px] py-[8px] border-b border-[#EFF1F4]">{v.fm}%</td>
                    <td className="px-[11px] py-[8px] border-b border-[#EFF1F4]"><span style={{ ...riskStyle(v.risk), fontWeight: 700 }}>{v.risk}</span></td>
                    <td className="px-[11px] py-[8px] border-b border-[#EFF1F4]">{v.off}</td>
                    <td className="px-[11px] py-[8px] border-b border-[#EFF1F4]">
                      <button onClick={() => setReportModal({ open: true, verificationId: v.id })} className="bg-transparent text-text-sec border border-border px-[9px] py-[4px] rounded-[3px] text-[11px] hover:bg-section hover:text-text-primary transition-colors">Report</button>
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
