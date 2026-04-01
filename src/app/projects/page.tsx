import { ProjectsContent } from '@/components/projects/projects-content';

export default function ProjectsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Proyectos</h1>
        <p className="mt-1 text-gray-500">Gestiona tus proyectos de monitoreo de marca</p>
      </div>
      <ProjectsContent />
    </div>
  );
}
