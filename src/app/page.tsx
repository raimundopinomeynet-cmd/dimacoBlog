import { DashboardContent } from '@/components/dashboard/dashboard-content';

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-gray-500">Monitoreo del posicionamiento de marca en LLMs</p>
      </div>
      <DashboardContent />
    </div>
  );
}
