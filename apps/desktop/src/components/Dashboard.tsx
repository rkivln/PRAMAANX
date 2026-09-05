import { GovernmentHeader, SecurityStatusBar, Sidebar } from '@/components';
import { useAuthStore } from '@/store/auth';
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

export default function Dashboard({ onNavigate }: { onNavigate: (page: string) => void }) {
  const officer = useAuthStore((s: any) => s.officer);
  const checkpoint = useAuthStore((s: any) => s.checkpoint);
  const setReportModal = useAppStore((s: any) => s.setReportModal);

  const stats = {
    total: MOCK_RECORDS.length,
    verified: MOCK_RECORDS.filter((r) => r.dec === 'VERIFIED').length,
    pending: MOCK_RECORDS.filter((r) => r.dec === 'REVIEW').length,
    rejected: MOCK_RECORDS.filter((r) => r.dec === 'REJECTED').length,
  };

  return (
    <div className="flex flex-col flex-1">
      <GovernmentHeader
        officerName={officer?.name || '—'}
        onLogout={() => {
          useAuthStore.getState().logout();
          useAppStore.getState().setCurrentPage('login');
        }}
      />
      <SecurityStatusBar checkpointLabel={checkpoint ? `${checkpoint.checkpoint_code} · ${checkpoint.name}` : '—'} />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar currentPage="dashboard" onNavigate={onNavigate} />

        <main className="flex-1 overflow-y-auto bg-page">
          <div className="page active flex flex-col">
            <div className="bg-white border-b border-border px-[20px] py-[12px] flex items-center justify-between flex-shrink-0">
              <div>
                <h1 className="text-[15px] font-semibold text-text-primary">Verification Operations</h1>
                <div className="text-[10.5px] text-text-muted mt-[1px]">{`Dashboard · ${checkpoint?.name || '—'}`}</div>
              </div>
              <button onClick={() => onNavigate('verification')} className="bg-navy text-white border border-navy px-[14px] py-[9px] rounded-[3px] text-[12.5px] font-medium hover:bg-navy-dark hover:border-navy-dark transition-colors">
                + START NEW VERIFICATION
              </button>
            </div>

            <div className="p-[18px_20px] flex-1 overflow-y-auto">
              <div className="grid grid-cols-4 gap-[8px] mb-[14px]">
                <div className="bg-white border border-border rounded-[4px] p-[10px_12px]">
                  <div className="text-[9.5px] text-text-muted uppercase tracking-[0.5px] font-semibold mb-[3px]">System Status</div>
                  <div className="text-[12.5px] font-semibold text-text-primary flex items-center gap-[6px]">
                    <span className="w-[6px] h-[6px] rounded-full bg-green inline-block flex-shrink-0"></span>Operational
                  </div>
                </div>
                <div className="bg-white border border-border rounded-[4px] p-[10px_12px]">
                  <div className="text-[9.5px] text-text-muted uppercase tracking-[0.5px] font-semibold mb-[3px]">Local Verifier</div>
                  <div className="text-[12.5px] font-semibold text-text-primary flex items-center gap-[6px]">
                    <span className="w-[6px] h-[6px] rounded-full bg-green inline-block flex-shrink-0"></span>Ready
                  </div>
                </div>
                <div className="bg-white border border-border rounded-[4px] p-[10px_12px]">
                  <div className="text-[9.5px] text-text-muted uppercase tracking-[0.5px] font-semibold mb-[3px]">Camera</div>
                  <div className="text-[12.5px] font-semibold text-text-primary flex items-center gap-[6px]">
                    <span className="w-[6px] h-[6px] rounded-full bg-green inline-block flex-shrink-0"></span>Connected
                  </div>
                </div>
                <div className="bg-white border border-border rounded-[4px] p-[10px_12px]">
                  <div className="text-[9.5px] text-text-muted uppercase tracking-[0.5px] font-semibold mb-[3px]">AI Analysis</div>
                  <div className="text-[12.5px] font-semibold text-text-primary flex items-center gap-[6px]">
                    <span className="w-[6px] h-[6px] rounded-full bg-green inline-block flex-shrink-0"></span>Available
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-[10px] mb-[14px]">
                <div className="bg-white border border-border rounded-[4px] p-[12px_14px]">
                  <div className="text-[10px] text-text-muted uppercase tracking-[0.5px] font-semibold mb-[3px]">Today's Verifications</div>
                  <div className="text-[22px] font-bold text-text-primary leading-[1.1]">{stats.total}</div>
                  <div className="text-[10.5px] text-text-sec mt-[3px]">Shift total</div>
                </div>
                <div className="bg-white border border-border rounded-[4px] p-[12px_14px]">
                  <div className="text-[10px] text-text-muted uppercase tracking-[0.5px] font-semibold mb-[3px]">Verified</div>
                  <div className="text-[22px] font-bold leading-[1.1]" style={{ color: 'var(--green)' }}>{stats.verified}</div>
                  <div className="text-[10.5px] text-text-sec mt-[3px]">87.2% success rate</div>
                </div>
                <div className="bg-white border border-border rounded-[4px] p-[12px_14px]">
                  <div className="text-[10px] text-text-muted uppercase tracking-[0.5px] font-semibold mb-[3px]">Pending Review</div>
                  <div className="text-[22px] font-bold leading-[1.1]" style={{ color: 'var(--review)' }}>{stats.pending}</div>
                  <div className="text-[10.5px] text-text-sec mt-[3px]">Awaiting supervisor</div>
                </div>
                <div className="bg-white border border-border rounded-[4px] p-[12px_14px]">
                  <div className="text-[10px] text-text-muted uppercase tracking-[0.5px] font-semibold mb-[3px]">Rejected</div>
                  <div className="text-[22px] font-bold leading-[1.1]" style={{ color: 'var(--rejected)' }}>{stats.rejected}</div>
                  <div className="text-[10.5px] text-text-sec mt-[3px]">Doc / identity failure</div>
                </div>
              </div>

              <div className="bg-white border border-border rounded-[4px] mb-[14px]">
                <div className="px-[14px] py-[10px] border-b border-border flex items-center justify-between">
                  <h3 className="text-[11px] font-bold uppercase tracking-[0.6px] text-text-sec">Recent Verification Activity</h3>
                  <div className="flex gap-[6px]">
                    <button onClick={() => onNavigate('history')} className="bg-transparent text-text-sec border border-border px-[9px] py-[4px] rounded-[3px] text-[11px] hover:bg-section hover:text-text-primary transition-colors">View All</button>
                    <button onClick={() => onNavigate('verification')} className="bg-navy text-white border border-navy px-[9px] py-[4px] rounded-[3px] text-[11px] hover:bg-navy-dark transition-colors">+ New</button>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-[12px]">
                    <thead>
                      <tr>
                        <th className="bg-section text-text-muted text-[10.5px] font-semibold uppercase tracking-[0.5px] px-[11px] py-[8px] text-left border-b border-border whitespace-nowrap">Verification ID</th>
                        <th className="bg-section text-text-muted text-[10.5px] font-semibold uppercase tracking-[0.5px] px-[11px] py-[8px] text-left border-b border-border whitespace-nowrap">Time</th>
                        <th className="bg-section text-text-muted text-[10.5px] font-semibold uppercase tracking-[0.5px] px-[11px] py-[8px] text-left border-b border-border whitespace-nowrap">Document</th>
                        <th className="bg-section text-text-muted text-[10.5px] font-semibold uppercase tracking-[0.5px] px-[11px] py-[8px] text-left border-b border-border whitespace-nowrap">Result</th>
                        <th className="bg-section text-text-muted text-[10.5px] font-semibold uppercase tracking-[0.5px] px-[11px] py-[8px] text-left border-b border-border whitespace-nowrap">Officer</th>
                        <th className="bg-section text-text-muted text-[10.5px] font-semibold uppercase tracking-[0.5px] px-[11px] py-[8px] text-left border-b border-border whitespace-nowrap">Status</th>
                        <th className="bg-section text-text-muted text-[10.5px] font-semibold uppercase tracking-[0.5px] px-[11px] py-[8px] text-left border-b border-border whitespace-nowrap">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {MOCK_RECORDS.slice(0, 7).map((v) => (
                        <tr key={v.id} className="hover:bg-[#F5F7F9]">
                          <td className="px-[11px] py-[8px] border-b border-[#EFF1F4] font-mono text-[11px]">{v.id}</td>
                          <td className="px-[11px] py-[8px] border-b border-[#EFF1F4]">{v.t} IST</td>
                          <td className="px-[11px] py-[8px] border-b border-[#EFF1F4]">{v.doc}</td>
                          <td className="px-[11px] py-[8px] border-b border-[#EFF1F4]">
                            <span className={`inline-flex items-center gap-[3px] px-[7px] py-[2px] rounded-[2px] text-[10px] font-bold uppercase tracking-[0.5px] border ${badgeClass(v.dec)}`}>{v.dec}</span>
                          </td>
                          <td className="px-[11px] py-[8px] border-b border-[#EFF1F4]">{v.off}</td>
                          <td className="px-[11px] py-[8px] border-b border-[#EFF1F4]">
                            <span className={`w-[6px] h-[6px] rounded-full inline-block flex-shrink-0 ${v.st === 'Closed' ? 'bg-green' : 'bg-review'}`}></span> {v.st}
                          </td>
                          <td className="px-[11px] py-[8px] border-b border-[#EFF1F4]">
                            <button onClick={() => setReportModal({ open: true, verificationId: v.id })} className="bg-transparent text-text-sec border border-border px-[9px] py-[4px] rounded-[3px] text-[11px] hover:bg-section hover:text-text-primary transition-colors">View</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-[14px]">
                <div className="bg-white border border-border rounded-[4px]">
                  <div className="px-[14px] py-[10px] border-b border-border">
                    <h3 className="text-[11px] font-bold uppercase tracking-[0.6px] text-text-sec">Quick Actions</h3>
                  </div>
                  <div className="p-[14px] flex flex-col gap-[7px]">
                    <button onClick={() => onNavigate('verification')} className="bg-navy text-white border border-navy px-[14px] py-[7px] rounded-[3px] text-[12px] font-medium hover:bg-navy-dark transition-colors text-left flex items-center gap-[5px]">＋ Start New Verification</button>
                    <button onClick={() => onNavigate('pending')} className="bg-transparent text-text-sec border border-border px-[14px] py-[7px] rounded-[3px] text-[12px] font-medium hover:bg-section hover:text-text-primary transition-colors text-left flex items-center gap-[5px]">◎ Pending Review (3)</button>
                    <button onClick={() => onNavigate('history')} className="bg-transparent text-text-sec border border-border px-[14px] py-[7px] rounded-[3px] text-[12px] font-medium hover:bg-section hover:text-text-primary transition-colors text-left flex items-center gap-[5px]">☰ Verification History</button>
                    <button onClick={() => onNavigate('audit')} className="bg-transparent text-text-sec border border-border px-[14px] py-[7px] rounded-[3px] text-[12px] font-medium hover:bg-section hover:text-text-primary transition-colors text-left flex items-center gap-[5px]">📋 Audit Trail</button>
                  </div>
                </div>

                <div className="bg-white border border-border rounded-[4px]">
                  <div className="px-[14px] py-[10px] border-b border-border">
                    <h3 className="text-[11px] font-bold uppercase tracking-[0.6px] text-text-sec">Checkpoint Information</h3>
                  </div>
                  <div className="p-[14px]">
                    <div className="grid grid-cols-2 border border-border rounded-[4px] overflow-hidden">
                      <div className="p-[8px_12px] border-b border-border-light">
                        <div className="text-[9.5px] text-text-muted uppercase tracking-[0.4px] font-semibold mb-[2px]">Checkpoint ID</div>
                        <div className="text-[12.5px] text-text-primary font-medium font-mono">{checkpoint?.checkpoint_code || '—'}</div>
                      </div>
                      <div className="p-[8px_12px] border-b border-border-light border-r border-border-light">
                        <div className="text-[9.5px] text-text-muted uppercase tracking-[0.4px] font-semibold mb-[2px]">Location</div>
                        <div className="text-[12.5px] text-text-primary font-medium">{checkpoint?.location || '—'}</div>
                      </div>
                      <div className="p-[8px_12px] border-b border-border-light">
                        <div className="text-[9.5px] text-text-muted uppercase tracking-[0.4px] font-semibold mb-[2px]">Officer</div>
                        <div className="text-[12.5px] text-text-primary font-medium">{officer?.name || '—'}</div>
                      </div>
                      <div className="p-[8px_12px] border-b border-border-light border-r border-border-light">
                        <div className="text-[9.5px] text-text-muted uppercase tracking-[0.4px] font-semibold mb-[2px]">Shift Start</div>
                        <div className="text-[12.5px] text-text-primary font-medium">08:00 IST</div>
                      </div>
                      <div className="p-[8px_12px] border-b border-border-light">
                        <div className="text-[9.5px] text-text-muted uppercase tracking-[0.4px] font-semibold mb-[2px]">Workstation</div>
                        <div className="text-[12.5px] text-text-primary font-medium font-mono">WS-CHK-01</div>
                      </div>
                      <div className="p-[8px_12px] border-r border-border-light">
                        <div className="text-[9.5px] text-text-muted uppercase tracking-[0.4px] font-semibold mb-[2px]">Engine</div>
                        <div className="text-[12.5px] font-medium" style={{ color: 'var(--green)' }}>● Operational</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
