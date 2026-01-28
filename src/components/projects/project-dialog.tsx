'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Project } from '@/types';

interface ProjectDialogProps {
  open: boolean;
  onClose: () => void;
  project: Project | null;
}

const emptyForm = {
  name: '',
  brandName: '',
  industry: '',
  service: '',
  country: '',
  prompts: ['', '', '', '', ''],
};

export function ProjectDialog({ open, onClose, project }: ProjectDialogProps) {
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const isEditing = !!project;

  useEffect(() => {
    if (project) {
      setForm({
        name: project.name,
        brandName: project.brand_name,
        industry: project.industry,
        service: project.service,
        country: project.country,
        prompts: project.prompts.length >= 5
          ? project.prompts
          : [...project.prompts, ...Array(5 - project.prompts.length).fill('')],
      });
    } else {
      setForm(emptyForm);
    }
  }, [project, open]);

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handlePromptChange = (index: number, value: string) => {
    setForm((prev) => ({
      ...prev,
      prompts: prev.prompts.map((p, i) => (i === index ? value : p)),
    }));
  };

  const addPrompt = () => {
    setForm((prev) => ({
      ...prev,
      prompts: [...prev.prompts, ''],
    }));
  };

  const removePrompt = (index: number) => {
    if (form.prompts.length <= 1) return;
    setForm((prev) => ({
      ...prev,
      prompts: prev.prompts.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate
    if (!form.name || !form.brandName || !form.industry || !form.service || !form.country) {
      toast({
        title: 'Error',
        description: 'Por favor completa todos los campos requeridos.',
        variant: 'destructive',
      });
      return;
    }

    const filledPrompts = form.prompts.filter((p) => p.trim());
    if (filledPrompts.length === 0) {
      toast({
        title: 'Error',
        description: 'Debes agregar al menos un prompt.',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);

    try {
      const url = isEditing ? `/api/projects/${project.id}` : '/api/projects';
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          brandName: form.brandName,
          industry: form.industry,
          service: form.service,
          country: form.country,
          prompts: filledPrompts,
        }),
      });

      if (response.ok) {
        toast({
          title: isEditing ? 'Proyecto actualizado' : 'Proyecto creado',
          description: `"${form.name}" ha sido ${isEditing ? 'actualizado' : 'creado'} exitosamente.`,
          variant: 'success',
        });
        onClose();
      } else {
        throw new Error('Error al guardar');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo guardar el proyecto.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar Proyecto' : 'Nuevo Proyecto'}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Modifica la configuracion de tu proyecto de monitoreo.'
              : 'Configura un nuevo proyecto de monitoreo de marca.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre del proyecto *</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="Mi proyecto de monitoreo"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="brandName">Nombre de la marca *</Label>
              <Input
                id="brandName"
                value={form.brandName}
                onChange={(e) => handleChange('brandName', e.target.value)}
                placeholder="Mi Marca"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="industry">Industria *</Label>
              <Input
                id="industry"
                value={form.industry}
                onChange={(e) => handleChange('industry', e.target.value)}
                placeholder="Tecnologia"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="service">Servicio *</Label>
              <Input
                id="service"
                value={form.service}
                onChange={(e) => handleChange('service', e.target.value)}
                placeholder="Software empresarial"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="country">Pais *</Label>
              <Input
                id="country"
                value={form.country}
                onChange={(e) => handleChange('country', e.target.value)}
                placeholder="Chile"
              />
            </div>
          </div>

          {/* Prompts */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Prompts de prueba</Label>
                <p className="text-sm text-gray-500">
                  Define los prompts que se ejecutaran contra los LLMs.
                </p>
              </div>
              <Button type="button" variant="outline" size="sm" onClick={addPrompt}>
                <Plus className="mr-1 h-4 w-4" />
                Agregar
              </Button>
            </div>

            <div className="space-y-3">
              {form.prompts.map((prompt, index) => (
                <div key={index} className="flex gap-2">
                  <div className="flex-1">
                    <Textarea
                      value={prompt}
                      onChange={(e) => handlePromptChange(index, e.target.value)}
                      placeholder={`Prompt ${index + 1}: Ej. "Recomienda empresas de ${form.service || 'servicios'} en ${form.country || 'mi pais'}"`}
                      rows={2}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removePrompt(index)}
                    disabled={form.prompts.length <= 1}
                    className="flex-shrink-0"
                  >
                    <Trash2 className="h-4 w-4 text-gray-400" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
              Cancelar
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : isEditing ? (
                'Guardar cambios'
              ) : (
                'Crear proyecto'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
