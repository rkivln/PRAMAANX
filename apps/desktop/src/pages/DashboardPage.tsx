import Dashboard from '@/components/Dashboard';

export default function DashboardPage({ onNavigate }: { onNavigate: (page: string) => void }) {
  return <Dashboard onNavigate={onNavigate} />;
}
