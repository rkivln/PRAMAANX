import LoginScreen from '@/components/LoginScreen';
import CheckpointScreen from '@/components/CheckpointScreen';
import DashboardPage from '@/pages/DashboardPage';
import VerificationPage from '@/pages/VerificationPage';
import HistoryPage from '@/pages/HistoryPage';
import PendingPage from '@/pages/PendingPage';
import AuditPage from '@/pages/AuditPage';
import AdminPage from '@/pages/AdminPage';
import SystemPage from '@/pages/SystemPage';
import Layout from '@/components/Layout';
import { useAppStore } from '@/store/app';
import { useAuthStore } from '@/store/auth';
import { Checkpoint } from '@/types';

export default function App() {
  const currentPage = useAppStore((s: any) => s.currentPage);
  const setCurrentPage = useAppStore((s: any) => s.setCurrentPage);
  const setCheckpoint = useAuthStore((s: any) => s.setCheckpoint);
  const setOfficer = useAuthStore((s: any) => s.setOfficer);
  const officer = useAuthStore((s: any) => s.officer);

  const handleLogin = () => {
    setOfficer({
      id: 'SSB/VER/2024-0142',
      officer_id: 'SSB/VER/2024-0142',
      name: 'Rajesh Sharma',
      role: 'officer',
      email: 'officer@pramaanx.gov.in',
    } as any);
    setCurrentPage('checkpoint');
  };

  const handleDemo = () => {
    setOfficer({
      id: 'DEMO/TRAIN/001',
      officer_id: 'DEMO/TRAIN/001',
      name: 'Demo Officer',
      role: 'officer',
      email: 'demo@pramaanx.gov.in',
    } as any);
    const demoCheckpoint: Checkpoint = {
      id: 'CHK-TRAIN',
      checkpoint_code: 'CHK-TRAIN',
      name: 'Training / Demonstration',
      location: 'Training Centre',
      checkpoint_type: 'Training',
      status: 'demo',
    };
    setCheckpoint(demoCheckpoint as any);
    setCurrentPage('dashboard');
  };

  const handleCheckpointSelect = (cp: Checkpoint) => {
    setCheckpoint(cp as any);
    setCurrentPage('dashboard');
  };

  const handleLogout = () => {
    setOfficer(null as any);
    setCurrentPage('login');
  };

  if (currentPage === 'login') {
    return <LoginScreen onLogin={handleLogin} onDemo={handleDemo} />;
  }

  if (currentPage === 'checkpoint') {
    return <CheckpointScreen onSelect={handleCheckpointSelect} onBack={() => setCurrentPage('login')} />;
  }

  return (
    <Layout
      officer={officer}
      onLogout={handleLogout}
      currentPage={currentPage}
      onNavigate={setCurrentPage}
    >
      {currentPage === 'dashboard' && <DashboardPage onNavigate={setCurrentPage} />}
      {currentPage === 'verification' && <VerificationPage />}
      {currentPage === 'history' && <HistoryPage />}
      {currentPage === 'pending' && <PendingPage />}
      {currentPage === 'audit' && <AuditPage />}
      {currentPage === 'admin' && <AdminPage />}
      {currentPage === 'system' && <SystemPage />}
    </Layout>
  );
}
