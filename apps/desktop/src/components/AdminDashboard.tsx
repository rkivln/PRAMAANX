import { GovernmentHeader, SecurityStatusBar, Sidebar } from '@/components';
import { useAuthStore } from '@/store/auth';
import { useAppStore } from '@/store/app';

export default function AdminDashboard() {
  const officer = useAuthStore((s: any) => s.officer);
  const checkpoint = useAuthStore((s: any) => s.checkpoint);
  const setCurrentPage = useAppStore((s: any) => s.setCurrentPage);

  const stats = {
    total: 312,
    verified: 271,
    pending: 24,
    rejected: 17,
    officers: 8,
  };

  const ADMIN_DATA = [
    { id: 'VR-20241204-00047', t: '11:34', cp: 'CHK-JALP-01', off: 'R. SHARMA', doc: 'Passport', dec: 'VERIFIED', risk: 'LOW' },
    { id: 'VR-20241204-00046', t: '11:18', cp: 'CHK-JALP-01', off: 'R. SHARMA', doc: 'Aadhaar', dec: 'VERIFIED', risk: 'LOW' },
    { id: 'VR-20241204-00035', t: '11:15', cp: 'CHK-SILG-02', off: 'M. DEWAN', doc: 'Passport', dec: 'VERIFIED', risk: 'LOW' },
    { id: 'VR-20241204-00044', t: '11:09', cp: 'CHK-JALP-01', off: 'R. SHARMA', doc: 'Voter ID', dec: 'REVIEW', risk: 'HIGH' },
    { id: 'VR-20241204-00033', t: '11:05', cp: 'CHK-DOC-03', off: 'S. KUMAR', doc: 'Aadhaar', dec: 'REJECTED', risk: 'HIGH' },
    { id: 'VR-20241204-00030', t: '10:52', cp: 'CHK-SILG-02', off: 'M. DEWAN', doc: 'Passport', dec: 'VERIFIED', risk: 'LOW' },
    { id: 'VR-20241204-00042', t: '10:38', cp: 'CHK-JALP-01', off: 'R. SHARMA', doc: 'Aadhaar', dec: 'REJECTED', risk: 'HIGH' },
    { id: 'VR-20241204-00028', t: '10:22', cp: 'CHK-SEC-04', off: 'A. BOSE', doc: 'Voter ID', dec: 'REVIEW', risk: 'MEDIUM' },
  ];

  function decBadge(d: string) {
    return d === 'VERIFIED' ? 'b-verified' : d === 'REVIEW' ? 'b-review' : 'b-rejected';
  }

  function riskStyle(risk: string) {
    return risk === 'LOW' ? { color: 'var(--green)' } : risk === 'MEDIUM' ? { color: 'var(--review)' } : { color: 'var(--rejected)' };
  }

  return (
    <div className="flex flex-col flex-1">
      <GovernmentHeader
        officerName={officer?.name || '—'}
        onLogout={() => {
          useAuthStore.getState().logout();
          setCurrentPage('login');
        }}
      />
      <SecurityStatusBar checkpointLabel={checkpoint ? `${checkpoint.checkpoint_code} · ${checkpoint.name}` : '—'} />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar currentPage="admin" onNavigate={setCurrentPage} />

        <main className="flex-1 overflow-y-auto bg-page">
          <div className="page active flex flex-col">
            <div className="bg-white border-b border-border px-[20px] py-[12px] flex items-center justify-between flex-shrink-0">
              <div>
                <h1 className="text-[15px] font-semibold text-text-primary">Verification Operations</h1>
                <div className="text-[10.5px] text-text-muted mt-[1px]">Administrator View · All Checkpoints</div>
              </div>
              <span className="inline-flex items-center gap-[5px] bg-blue-50 border border-navy-mid px-[9px] py-[3px] rounded-[3px] text-[10px] font-bold uppercase tracking-[0.5px] text-navy">Admin Access</span>
            </div>

            <div className="p-[18px_20px] flex-1 overflow-y-auto">
              <div className="grid grid-cols-5 gap-[10px] mb-[14px]">
                <div className="bg-white border border-border rounded-[4px] p-[12px_14px]">
                  <div className="text-[10px] text-text-muted uppercase tracking-[0.5px] font-semibold mb-[3px]">Total Verifications</div>
                  <div className="text-[22px] font-bold text-text-primary leading-[1.1]">{stats.total}</div>
                  <div className="text-[10.5px] text-text-sec mt-[3px]">All checkpoints today</div>
                </div>
                <div className="bg-white border border-border rounded-[4px] p-[12px_14px]">
                  <div className="text-[10px] text-text-muted uppercase tracking-[0.5px] font-semibold mb-[3px]">Verified</div>
                  <div className="text-[22px] font-bold leading-[1.1]" style={{ color: 'var(--green)' }}>{stats.verified}</div>
                  <div className="text-[10.5px] text-text-sec mt-[3px]">86.9%</div>
                </div>
                <div className="bg-white border border-border rounded-[4px] p-[12px_14px]">
                  <div className="text-[10px] text-text-muted uppercase tracking-[0.5px] font-semibold mb-[3px]">Pending Review</div>
                  <div className="text-[22px] font-bold leading-[1.1]" style={{ color: 'var(--review)' }}>{stats.pending}</div>
                  <div className="text-[10.5px] text-text-sec mt-[3px]">7.7%</div>
                </div>
                <div className="bg-white border border-border rounded-[4px] p-[12px_14px]">
                  <div className="text-[10px] text-text-muted uppercase tracking-[0.5px] font-semibold mb-[3px]">Rejected</div>
                  <div className="text-[22px] font-bold leading-[1.1]" style={{ color: 'var(--rejected)' }}>{stats.rejected}</div>
                  <div className="text-[10.5px] text-text-sec mt-[3px]">5.4%</div>
                </div>
                <div className="bg-white border border-border rounded-[4px] p-[12px_14px]">
                  <div className="text-[10px] text-text-muted uppercase tracking-[0.5px] font-semibold mb-[3px]">Active Officers</div>
                  <div className="text-[22px] font-bold text-text-primary leading-[1.1]">{stats.officers}</div>
                  <div className="text-[10.5px] text-text-sec mt-[3px]">5 checkpoints</div>
                </div>
              </div>

              <div className="bg-white border border-border rounded-[4px]">
                <div className="px-[14px] py-[10px] border-b border-border flex items-center justify-between">
                  <h3 className="text-[11px] font-bold uppercase tracking-[0.6px] text-text-sec">All Verification Records</h3>
                  <div className="flex gap-[6px]">
                    <select className="px-[7px] py-[3px] border border-border rounded-[3px] text-[11.5px] text-text-primary bg-white"><option>All Checkpoints</option></select>
                    <select className="px-[7px] py-[3px] border border-border rounded-[3px] text-[11.5px] text-text-primary bg-white"><option>All Decisions</option></select>
                    <button className="bg-transparent text-text-sec border border-border px-[9px] py-[4px] rounded-[3px] text-[11px] hover:bg-section hover:text-text-primary transition-colors">Export</button>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-[12px]">
                    <thead>
                      <tr>
                        <th className="bg-section text-text-muted text-[10.5px] font-semibold uppercase tracking-[0.5px] px-[11px] py-[8px] text-left border-b border-border whitespace-nowrap">Verification ID</th>
                        <th className="bg-section text-text-muted text-[10.5px] font-semibold uppercase tracking-[0.5px] px-[11px] py-[8px] text-left border-b border-border whitespace-nowrap">Time</th>
                        <th className="bg-section text-text-muted text-[10.5px] font-semibold uppercase tracking-[0.5px] px-[11px] py-[8px] text-left border-b border-border whitespace-nowrap">Checkpoint</th>
                        <th className="bg-section text-text-muted text-[10.5px] font-semibold uppercase tracking-[0.5px] px-[11px] py-[8px] text-left border-b border-border whitespace-nowrap">Officer</th>
                        <th className="bg-section text-text-muted text-[10.5px] font-semibold uppercase tracking-[0.5px] px-[11px] py-[8px] text-left border-b border-border whitespace-nowrap">Document</th>
                        <th className="bg-section text-text-muted text-[10.5px] font-semibold uppercase tracking-[0.5px] px-[11px] py-[8px] text-left border-b border-border whitespace-nowrap">Decision</th>
                        <th className="bg-section text-text-muted text-[10.5px] font-semibold uppercase tracking-[0.5px] px-[11px] py-[8px] text-left border-b border-border whitespace-nowrap">Risk</th>
                        <th className="bg-section text-text-muted text-[10.5px] font-semibold uppercase tracking-[0.5px] px-[11px] py-[8px] text-left border-b border-border whitespace-nowrap">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ADMIN_DATA.map((v) => (
                        <tr key={v.id} className="hover:bg-[#F5F7F9]">
                          <td className="px-[11px] py-[8px] border-b border-[#EFF1F4] font-mono text-[10.5px]">{v.id}</td>
                          <td className="px-[11px] py-[8px] border-b border-[#EFF1F4]">{v.t} IST</td>
                          <td className="px-[11px] py-[8px] border-b border-[#EFF1F4]"><span className="inline-flex items-center gap-[3px] bg-blue-50 border border-navy-mid px-[9px] py-[3px] rounded-[3px] text-[9px] font-bold uppercase tracking-[0.5px] text-navy">{v.cp}</span></td>
                          <td className="px-[11px] py-[8px] border-b border-[#EFF1F4]">{v.off}</td>
                          <td className="px-[11px] py-[8px] border-b border-[#EFF1F4]">{v.doc}</td>
                          <td className="px-[11px] py-[8px] border-b border-[#EFF1F4]">
                            <span className={`inline-flex items-center gap-[3px] px-[7px] py-[2px] rounded-[2px] text-[10px] font-bold uppercase tracking-[0.5px] border ${decBadge(v.dec)}`}>{v.dec}</span>
                          </td>
                          <td className="px-[11px] py-[8px] border-b border-[#EFF1F4]"><span style={{ ...riskStyle(v.risk), fontWeight: 700 }}>{v.risk}</span></td>
                          <td className="px-[11px] py-[8px] border-b border-[#EFF1F4]">
                            <button className="bg-transparent text-text-sec border border-border px-[9px] py-[4px] rounded-[3px] text-[11px] hover:bg-section hover:text-text-primary transition-colors">View</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
