import AdminDashboard from '@/components/AdminDashboard';
import { GovernmentHeader, SecurityStatusBar, Sidebar } from '@/components';
import { useAuthStore } from '@/store/auth';
import { useAppStore } from '@/store/app';

export default function AdminPage() {
  const officer = useAuthStore((s: any) => s.officer);
  const checkpoint = useAuthStore((s: any) => s.checkpoint);
  const setCurrentPage = useAppStore((s: any) => s.setCurrentPage);

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
          <AdminDashboard />
        </main>
      </div>
    </div>
  );
}
