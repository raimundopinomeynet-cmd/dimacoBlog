'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Plus,
  MoreVertical,
  Pencil,
  Trash2,
  Play,
  Globe,
  Building2,
  Briefcase,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ProjectDialog } from './project-dialog';
import { DeleteProjectDialog } from './delete-project-dialog';
import type { Project } from '@/types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function ProjectsContent() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [executing, setExecuting] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const response = await fetch('/api/projects');
      if (response.ok) {
        const data = await response.json();
        setProjects(data);
      }
    } catch (error) {
      console.error('Error loading projects:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los proyectos.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (project: Project) => {
    setSelectedProject(project);
    setDialogOpen(true);
  };

  const handleDelete = (project: Project) => {
    setSelectedProject(project);
    setDeleteDialogOpen(true);
  };

  const handleExecute = async (project: Project) => {
    setExecuting(project.id);
    try {
      const response = await fetch('/api/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId: project.id }),
      });

      if (response.ok) {
        toast({
          title: 'Ejecucion iniciada',
          description: `Los prompts de "${project.name}" se estan ejecutando.`,
          variant: 'success',
        });
      } else {
        throw new Error('Error al ejecutar');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo iniciar la ejecucion.',
        variant: 'destructive',
      });
    } finally {
      setExecuting(null);
    }
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setSelectedProject(null);
    loadProjects();
  };

  const handleDeleteConfirm = async () => {
    if (!selectedProject) return;

    try {
      const response = await fetch(`/api/projects/${selectedProject.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast({
          title: 'Proyecto eliminado',
          description: `"${selectedProject.name}" ha sido eliminado.`,
          variant: 'success',
        });
        loadProjects();
      } else {
        throw new Error('Error al eliminar');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo eliminar el proyecto.',
        variant: 'destructive',
      });
    } finally {
      setDeleteDialogOpen(false);
      setSelectedProject(null);
    }
  };

  if (loading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-48" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <p className="text-sm text-gray-500">
          {projects.length} {projects.length === 1 ? 'proyecto' : 'proyectos'} configurados
        </p>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Proyecto
        </Button>
      </div>

      {projects.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
              <Building2 className="h-6 w-6 text-gray-400" />
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900">No hay proyectos</h3>
            <p className="mt-1 text-sm text-gray-500">
              Crea tu primer proyecto de monitoreo de marca.
            </p>
            <Button className="mt-4" onClick={() => setDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Crear Proyecto
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <Card key={project.id} className="relative">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{project.name}</CardTitle>
                    <CardDescription className="mt-1">{project.brand_name}</CardDescription>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEdit(project)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleExecute(project)}>
                        <Play className="mr-2 h-4 w-4" />
                        Ejecutar ahora
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDelete(project)}
                        className="text-red-600"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Eliminar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary" className="gap-1">
                    <Briefcase className="h-3 w-3" />
                    {project.industry}
                  </Badge>
                  <Badge variant="secondary" className="gap-1">
                    <Globe className="h-3 w-3" />
                    {project.country}
                  </Badge>
                </div>

                <div>
                  <p className="text-xs font-medium text-gray-500">Servicio</p>
                  <p className="text-sm text-gray-700">{project.service}</p>
                </div>

                <div>
                  <p className="text-xs font-medium text-gray-500">Prompts configurados</p>
                  <p className="text-sm text-gray-700">{project.prompts?.length || 0} prompts</p>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <Badge variant={project.is_active ? 'success' : 'outline'}>
                    {project.is_active ? 'Activo' : 'Inactivo'}
                  </Badge>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleExecute(project)}
                    disabled={executing === project.id}
                  >
                    {executing === project.id ? (
                      'Ejecutando...'
                    ) : (
                      <>
                        <Play className="mr-1 h-3 w-3" />
                        Ejecutar
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <ProjectDialog
        open={dialogOpen}
        onClose={handleDialogClose}
        project={selectedProject}
      />

      <DeleteProjectDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
        projectName={selectedProject?.name || ''}
      />
    </>
  );
}
