import { ReactNode, Fragment } from 'react';
import { Officer } from '../types';
import { useAuthStore } from '../store/auth';
import { useAppStore } from '../store/app';
import ReportModal from './ReportModal';
import ImageLightbox from './ImageLightbox';

interface LayoutProps {
  officer: Officer;
  onLogout: () => void;
  currentPage: string;
  onNavigate: (page: string) => void;
  children: ReactNode;
}

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: '▦', section: 'Operations' },
  { id: 'verification', label: 'New Verification', icon: '＋', section: 'Operations', action: 'start' },
  { id: 'history', label: 'Verification History', icon: '☰', section: 'Operations' },
  { id: 'pending', label: 'Pending Review', icon: '◎', section: 'Operations', badge: 3 },
  { id: 'audit', label: 'Audit Trail', icon: '📋', section: 'Administration' },
  { id: 'admin', label: 'Admin Dashboard', icon: '⚙', section: 'Administration' },
  { id: 'system', label: 'System Status', icon: '◉', section: 'Administration' },
];

export function GovernmentHeader({ officerName, onLogout }: { officerName: string; onLogout: () => void }) {
  return (
    <header className="h-[60px] bg-navy-dark flex items-center px-4 gap-3 flex-shrink-0 border-t-[3px] border-saffron relative z-50">
      <div className="w-11 h-11 rounded-full border-[1.5px] border-saffron/70 flex items-center justify-center flex-shrink-0 overflow-hidden bg-[#18191B]">
        <img src="/emblem_logo.jpg" alt="Government of India Emblem" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
      </div>
      <div className="border-r border-white/12 pr-3 flex-shrink-0">
        <div className="text-[10px] font-semibold text-white/88 uppercase tracking-[0.9px]">Government of India</div>
        <div className="text-[9px] text-white/50 uppercase tracking-[0.4px] mt-[1px]">Ministry of Home Affairs</div>
      </div>
      <div className="flex-1 pl-1">
        <div className="text-white text-[16px] font-bold tracking-[0.6px]">PRAMAANX</div>
        <div className="text-white/42 text-[9.5px] tracking-[0.2px] mt-[1px]">Identity &amp; Document Verification System</div>
      </div>
      <div className="flex items-center gap-4 ml-auto">
        <div className="flex flex-col items-end gap-[1px]">
          <span className="text-[9px] text-white/38 uppercase tracking-[0.4px]">Officer</span>
          <span className="text-[11px] text-white/82 font-medium">{officerName}</span>
        </div>
        <div className="flex items-center gap-1 bg-green/14 border border-green/38 rounded-[3px] px-2 py-[3px]">
          <span className="w-[5px] h-[5px] rounded-full bg-[#4caf50] flex-shrink-0"></span>
          <span className="text-[9.5px] text-[#7dcc76] font-semibold tracking-[0.5px]">SECURE SESSION</span>
        </div>
        <button onClick={onLogout} className="bg-transparent border border-white/18 text-white/65 px-2 py-[4px] rounded-[3px] text-[10.5px] tracking-[0.2px] hover:bg-white/9 hover:text-white transition-all">
          ⏻ SIGN OUT
        </button>
      </div>
    </header>
  );
}

export function SecurityStatusBar({ checkpointLabel }: { checkpointLabel: string }) {
  return (
    <div className="bg-section border-b border-border px-4 py-[4px] flex items-center gap-3 flex-shrink-0 flex-wrap">
      <div className="flex items-center gap-1 text-[9.5px] text-text-muted uppercase tracking-[0.4px] font-medium">
        <span className="w-[4px] h-[4px] rounded-full bg-green"></span>JWT Authenticated
      </div>
      <div className="flex items-center gap-1 text-[9.5px] text-text-muted uppercase tracking-[0.4px] font-medium">
        <span className="w-[4px] h-[4px] rounded-full bg-green"></span>Local Verification Enabled
      </div>
      <div className="flex items-center gap-1 text-[9.5px] text-text-muted uppercase tracking-[0.4px] font-medium">
        <span className="w-[4px] h-[4px] rounded-full bg-green"></span>Audit Logging Active
      </div>
      <div className="flex items-center gap-1 text-[9.5px] text-text-muted uppercase tracking-[0.4px] font-medium">
        <span className="w-[4px] h-[4px] rounded-full bg-green"></span>Camera Access Granted
      </div>
      <div className="flex items-center gap-1 text-[9.5px] text-text-muted uppercase tracking-[0.4px] font-medium">
        <span className="w-[4px] h-[4px] rounded-full bg-green"></span>Access Control Active
      </div>
      <div className="ml-auto text-[10px] text-text-muted">{checkpointLabel}</div>
    </div>
  );
}

export function Sidebar({ currentPage, onNavigate }: { currentPage: string; onNavigate: (page: string) => void }) {
  const officer = useAuthStore((s: any) => s.officer);

  return (
    <nav className="w-[218px] bg-navy-dark flex flex-col flex-shrink-0 border-r border-white/5 overflow-y-auto">
      {Object.entries(
        NAV_ITEMS.reduce<Record<string, typeof NAV_ITEMS>>((acc, item) => {
          if (!acc[item.section]) acc[item.section] = [];
          acc[item.section].push(item);
          return acc;
        }, {})
      ).map(([section, items]) => (
        <div key={section} className="py-2.5">
          <div className="text-[9px] text-white/28 uppercase tracking-[1.1px] px-[14px] py-[3px] font-semibold">{section}</div>
          {items.map((item) => (
            <div
              key={item.id}
              onClick={() => {
                if (item.action === 'start') {
                  onNavigate('verification');
                } else {
                  onNavigate(item.id);
                }
              }}
              className={`flex items-center gap-2 px-[14px] py-[8px] text-[12px] cursor-pointer border-l-2 border-transparent transition-all ${
                currentPage === item.id ? 'bg-navy-mid/28 text-white border-l-saffron font-medium' : 'text-white/58 hover:bg-white/4 hover:text-white/88'
              }`}
            >
              <span className="text-[12px] w-[14px] text-center flex-shrink-0 opacity-75">{item.icon}</span>
              {item.label}
              {item.badge && <span className="ml-auto bg-review/25 border border-review/50 text-[#e09b2e] text-[9px] font-bold px-[5px] py-[1px] rounded-[2px]">{item.badge}</span>}
            </div>
          ))}
        </div>
      ))}
      <div className="mt-auto pt-3 pb-2 px-[14px] border-t border-white/7">
        <div className="text-[9px] text-white/28 uppercase tracking-[0.6px] mb-[2px]">Officer</div>
        <div className="text-[11.5px] text-white/78 font-medium">{officer?.name || '—'}</div>
        <div className="text-[10.5px] text-white/42 mt-[1px]">{officer?.role || '—'}</div>
        <div className="text-[10px] text-saffron font-medium mt-[4px] tracking-[0.3px]">{officer?.checkpoint?.code || '—'}</div>
      </div>
    </nav>
  );
}

export function PageHeader({ title, breadcrumb, actions }: { title: string; breadcrumb?: string; actions?: ReactNode }) {
  return (
    <div className="bg-white border-b border-border px-[20px] py-[12px] flex items-center justify-between flex-shrink-0">
      <div>
        <h1 className="text-[15px] font-semibold text-text-primary">{title}</h1>
        {breadcrumb && <div className="text-[10.5px] text-text-muted mt-[1px]">{breadcrumb}</div>}
      </div>
      {actions && <div className="flex items-center gap-[6px]">{actions}</div>}
    </div>
  );
}

export function StepIndicator({ currentStep }: { currentStep: number }) {
  const steps = [
    { n: '01', label: 'AUTHENTICATE' },
    { n: '02', label: 'DOCUMENT' },
    { n: '03', label: 'FACE' },
    { n: '04', label: 'ANALYSIS' },
    { n: '05', label: 'RESULT' },
  ];

  return (
    <div className="bg-white border-b border-border px-[20px] flex items-center flex-shrink-0 overflow-x-auto">
      {steps.map((s, i) => {
        const n = i + 1;
        const cls = n < currentStep ? 'text-green border-b-[2px] border-green' : n === currentStep ? 'text-navy border-b-[2px] border-navy' : 'text-text-muted border-b-[2px] border-transparent';
        return (
          <Fragment key={s.n}>
            <div className={`flex items-center gap-[7px] px-[14px] py-[11px] text-[11px] font-medium whitespace-nowrap cursor-default ${cls}`}>
              <span className={`w-[19px] h-[19px] rounded-full flex items-center justify-center text-[9.5px] font-bold flex-shrink-0 ${
                n < currentStep ? 'bg-green border-[1.5px] border-green text-white' : n === currentStep ? 'bg-navy border-[1.5px] border-navy text-white' : 'bg-section border-[1.5px] border-border text-text-muted'
              }`}>
                {n < currentStep ? '✓' : s.n}
              </span>
              {s.label}
            </div>
            {i < steps.length - 1 && <span className="text-[#C8D0D8] text-[11px] self-center px-[2px]">›</span>}
          </Fragment>
        );
      })}
    </div>
  );
}

export default function Layout({ officer, onLogout, currentPage, onNavigate, children }: LayoutProps) {
  const reportModal = useAppStore((s: any) => s.reportModal);
  const lightbox = useAppStore((s: any) => s.lightbox);

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-page">
      <GovernmentHeader
        officerName={officer.name}
        onLogout={onLogout}
      />
      <SecurityStatusBar checkpointLabel={officer.checkpoint ? `${officer.checkpoint.code} · ${officer.checkpoint.name}` : '—'} />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar currentPage={currentPage} onNavigate={onNavigate} />
        <main className="flex-1 overflow-y-auto bg-page">
          {children}
        </main>
      </div>

      {reportModal.open && <ReportModal />}
      {lightbox.open && <ImageLightbox />}
    </div>
  );
}
