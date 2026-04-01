'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  Eye,
  ChevronDown,
  ChevronUp,
  MessageSquare,
} from 'lucide-react';
import { formatDate } from '@/lib/utils';
import type { Project, Execution } from '@/types';

interface ExecutionWithProject extends Execution {
  projects?: { name: string; brand_name: string };
}

interface ResponseWithAnalysis {
  id: string;
  prompt_text: string;
  llm_provider: 'openai' | 'gemini';
  llm_model: string;
  response_text: string;
  response_time_ms: number;
  created_at: string;
  analysis_results?: {
    brand_mentioned: boolean;
    mention_count: number;
    sentiment_score: number;
    sentiment_label: string;
    prominence_score: number;
    warmth_score: number;
  }[];
}

export function ExecutionsContent() {
  const [executions, setExecutions] = useState<ExecutionWithProject[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<string>('all');
  const [expandedExecution, setExpandedExecution] = useState<string | null>(null);
  const [selectedExecution, setSelectedExecution] = useState<ExecutionWithProject | null>(null);
  const [responses, setResponses] = useState<ResponseWithAnalysis[]>([]);
  const [loadingResponses, setLoadingResponses] = useState(false);

  useEffect(() => {
    loadData();
  }, [selectedProject]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [execRes, projectsRes] = await Promise.all([
        fetch(`/api/executions${selectedProject !== 'all' ? `?projectId=${selectedProject}` : ''}`),
        fetch('/api/projects'),
      ]);

      if (execRes.ok) {
        const data = await execRes.json();
        setExecutions(data);
      }

      if (projectsRes.ok) {
        const data = await projectsRes.json();
        setProjects(data);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadExecutionDetails = async (execution: ExecutionWithProject) => {
    setSelectedExecution(execution);
    setLoadingResponses(true);

    try {
      const response = await fetch(`/api/executions/${execution.id}/responses`);
      if (response.ok) {
        const data = await response.json();
        setResponses(data);
      }
    } catch (error) {
      console.error('Error loading responses:', error);
    } finally {
      setLoadingResponses(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'running':
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="success">Completado</Badge>;
      case 'failed':
        return <Badge variant="destructive">Fallido</Badge>;
      case 'running':
        return <Badge variant="secondary">Ejecutando</Badge>;
      default:
        return <Badge variant="outline">Pendiente</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-16 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Select value={selectedProject} onValueChange={setSelectedProject}>
            <SelectTrigger className="w-[250px]">
              <SelectValue placeholder="Filtrar por proyecto" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los proyectos</SelectItem>
              {projects.map((project) => (
                <SelectItem key={project.id} value={project.id}>
                  {project.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <p className="text-sm text-gray-500">
          {executions.length} {executions.length === 1 ? 'ejecucion' : 'ejecuciones'}
        </p>
      </div>

      {executions.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
              <MessageSquare className="h-6 w-6 text-gray-400" />
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900">No hay ejecuciones</h3>
            <p className="mt-1 text-sm text-gray-500">
              Las ejecuciones aparecen aqui cuando se ejecutan los prompts.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {executions.map((execution) => (
            <Card key={execution.id}>
              <CardHeader
                className="cursor-pointer"
                onClick={() =>
                  setExpandedExecution(expandedExecution === execution.id ? null : execution.id)
                }
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(execution.status)}
                    <div>
                      <CardTitle className="text-base">
                        {execution.projects?.name || 'Proyecto desconocido'}
                      </CardTitle>
                      <CardDescription>
                        {formatDate(execution.executed_at, "dd 'de' MMMM yyyy, HH:mm")}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {getStatusBadge(execution.status)}
                    {expandedExecution === execution.id ? (
                      <ChevronUp className="h-4 w-4 text-gray-400" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-gray-400" />
                    )}
                  </div>
                </div>
              </CardHeader>
              {expandedExecution === execution.id && (
                <CardContent>
                  <div className="flex items-center justify-between border-t pt-4">
                    <div className="text-sm text-gray-500">
                      <p>Marca: {execution.projects?.brand_name}</p>
                      <p>ID: {execution.id}</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => loadExecutionDetails(execution)}>
                      <Eye className="mr-2 h-4 w-4" />
                      Ver respuestas
                    </Button>
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Response Details Dialog */}
      <Dialog open={!!selectedExecution} onOpenChange={() => setSelectedExecution(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle>Respuestas de la ejecucion</DialogTitle>
            <DialogDescription>
              {selectedExecution?.projects?.name} -{' '}
              {selectedExecution && formatDate(selectedExecution.executed_at, "dd 'de' MMMM yyyy, HH:mm")}
            </DialogDescription>
          </DialogHeader>

          {loadingResponses ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : (
            <Tabs defaultValue="openai">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="openai">OpenAI</TabsTrigger>
                <TabsTrigger value="gemini">Gemini</TabsTrigger>
              </TabsList>
              <TabsContent value="openai" className="space-y-4">
                {responses
                  .filter((r) => r.llm_provider === 'openai')
                  .map((response, idx) => (
                    <ResponseCard key={response.id} response={response} index={idx + 1} />
                  ))}
                {responses.filter((r) => r.llm_provider === 'openai').length === 0 && (
                  <p className="py-4 text-center text-gray-500">No hay respuestas de OpenAI</p>
                )}
              </TabsContent>
              <TabsContent value="gemini" className="space-y-4">
                {responses
                  .filter((r) => r.llm_provider === 'gemini')
                  .map((response, idx) => (
                    <ResponseCard key={response.id} response={response} index={idx + 1} />
                  ))}
                {responses.filter((r) => r.llm_provider === 'gemini').length === 0 && (
                  <p className="py-4 text-center text-gray-500">No hay respuestas de Gemini</p>
                )}
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

function ResponseCard({ response, index }: { response: ResponseWithAnalysis; index: number }) {
  const analysis = response.analysis_results?.[0];

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">Prompt {index}</CardTitle>
          <Badge variant="outline">{response.response_time_ms}ms</Badge>
        </div>
        <CardDescription className="text-xs">{response.prompt_text}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-md bg-gray-50 p-3">
          <p className="text-sm text-gray-700 whitespace-pre-wrap">{response.response_text}</p>
        </div>

        {analysis && (
          <div className="grid grid-cols-2 gap-4 rounded-md border p-3 sm:grid-cols-4">
            <div className="text-center">
              <p className="text-xs text-gray-500">Mencion</p>
              <p className={`text-sm font-medium ${analysis.brand_mentioned ? 'text-green-600' : 'text-red-600'}`}>
                {analysis.brand_mentioned ? 'Si' : 'No'}
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500">Sentimiento</p>
              <p
                className={`text-sm font-medium ${
                  analysis.sentiment_label === 'positive'
                    ? 'text-green-600'
                    : analysis.sentiment_label === 'negative'
                      ? 'text-red-600'
                      : 'text-yellow-600'
                }`}
              >
                {analysis.sentiment_score.toFixed(2)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500">Prominencia</p>
              <p className="text-sm font-medium">{analysis.prominence_score.toFixed(0)}%</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500">Calidez</p>
              <p className="text-sm font-medium">{analysis.warmth_score.toFixed(0)}%</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
