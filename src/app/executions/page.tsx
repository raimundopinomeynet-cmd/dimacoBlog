import { ExecutionsContent } from '@/components/executions/executions-content';

export default function ExecutionsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Ejecuciones</h1>
        <p className="mt-1 text-gray-500">Historial de ejecuciones y respuestas de los LLMs</p>
      </div>
      <ExecutionsContent />
    </div>
  );
}
