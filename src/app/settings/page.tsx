import { SettingsContent } from '@/components/settings/settings-content';

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Configuracion</h1>
        <p className="mt-1 text-gray-500">Configura tus API keys y preferencias</p>
      </div>
      <SettingsContent />
    </div>
  );
}
