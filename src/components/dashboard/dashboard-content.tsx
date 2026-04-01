'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Eye,
  ThumbsUp,
  Star,
  Heart,
} from 'lucide-react';
import { MetricsChart } from './metrics-chart';
import { ComparisonChart } from './comparison-chart';
import type { Project } from '@/types';

interface DashboardData {
  weeklyMetrics: {
    week_start: string;
    llm_provider: string;
    appearance_rate: number;
    avg_sentiment: number;
    avg_prominence: number;
    avg_warmth: number;
    total_responses: number;
    brand_mentions: number;
  }[];
  summary: {
    openai: {
      appearance: number;
      sentiment: number;
      prominence: number;
      warmth: number;
      previousAppearance: number;
      previousSentiment: number;
      previousProminence: number;
      previousWarmth: number;
    };
    gemini: {
      appearance: number;
      sentiment: number;
      prominence: number;
      warmth: number;
      previousAppearance: number;
      previousSentiment: number;
      previousProminence: number;
      previousWarmth: number;
    };
  };
}

export function DashboardContent() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    loadProjects();
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [selectedProject]);

  const loadProjects = async () => {
    try {
      const response = await fetch('/api/projects');
      if (response.ok) {
        const projectsData = await response.json();
        setProjects(projectsData);
      }
    } catch (error) {
      console.error('Error loading projects:', error);
    }
  };

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const url = `/api/dashboard${selectedProject !== 'all' ? `?projectId=${selectedProject}` : ''}`;
      const response = await fetch(url);
      if (response.ok) {
        const dashboardData = await response.json();
        setData(dashboardData);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getChangeIndicator = (current: number, previous: number) => {
    const diff = current - previous;
    const percentChange = previous !== 0 ? ((diff / previous) * 100).toFixed(1) : current > 0 ? '100' : '0';

    if (diff > 0) {
      return (
        <span className="flex items-center text-xs text-green-600">
          <TrendingUp className="mr-1 h-3 w-3" />+{percentChange}%
        </span>
      );
    } else if (diff < 0) {
      return (
        <span className="flex items-center text-xs text-red-600">
          <TrendingDown className="mr-1 h-3 w-3" />
          {percentChange}%
        </span>
      );
    }
    return (
      <span className="flex items-center text-xs text-gray-500">
        <Minus className="mr-1 h-3 w-3" />
        Sin cambio
      </span>
    );
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-32" />
                <Skeleton className="mt-2 h-4 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-40" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  const summary = data?.summary || {
    openai: { appearance: 0, sentiment: 0, prominence: 0, warmth: 0, previousAppearance: 0, previousSentiment: 0, previousProminence: 0, previousWarmth: 0 },
    gemini: { appearance: 0, sentiment: 0, prominence: 0, warmth: 0, previousAppearance: 0, previousSentiment: 0, previousProminence: 0, previousWarmth: 0 },
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex items-center gap-4">
        <Select value={selectedProject} onValueChange={setSelectedProject}>
          <SelectTrigger className="w-[250px]">
            <SelectValue placeholder="Seleccionar proyecto" />
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

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Aparicion de marca"
          icon={Eye}
          openaiValue={`${summary.openai.appearance.toFixed(0)}%`}
          geminiValue={`${summary.gemini.appearance.toFixed(0)}%`}
          openaiChange={getChangeIndicator(summary.openai.appearance, summary.openai.previousAppearance)}
          geminiChange={getChangeIndicator(summary.gemini.appearance, summary.gemini.previousAppearance)}
        />
        <MetricCard
          title="Sentimiento"
          icon={ThumbsUp}
          openaiValue={summary.openai.sentiment.toFixed(2)}
          geminiValue={summary.gemini.sentiment.toFixed(2)}
          openaiChange={getChangeIndicator(summary.openai.sentiment, summary.openai.previousSentiment)}
          geminiChange={getChangeIndicator(summary.gemini.sentiment, summary.gemini.previousSentiment)}
        />
        <MetricCard
          title="Prominencia"
          icon={Star}
          openaiValue={`${summary.openai.prominence.toFixed(0)}%`}
          geminiValue={`${summary.gemini.prominence.toFixed(0)}%`}
          openaiChange={getChangeIndicator(summary.openai.prominence, summary.openai.previousProminence)}
          geminiChange={getChangeIndicator(summary.gemini.prominence, summary.gemini.previousProminence)}
        />
        <MetricCard
          title="Calidez"
          icon={Heart}
          openaiValue={`${summary.openai.warmth.toFixed(0)}%`}
          geminiValue={`${summary.gemini.warmth.toFixed(0)}%`}
          openaiChange={getChangeIndicator(summary.openai.warmth, summary.openai.previousWarmth)}
          geminiChange={getChangeIndicator(summary.gemini.warmth, summary.gemini.previousWarmth)}
        />
      </div>

      {/* Charts */}
      <Tabs defaultValue="appearance" className="space-y-4">
        <TabsList>
          <TabsTrigger value="appearance">Aparicion</TabsTrigger>
          <TabsTrigger value="sentiment">Sentimiento</TabsTrigger>
          <TabsTrigger value="prominence">Prominencia</TabsTrigger>
          <TabsTrigger value="warmth">Calidez</TabsTrigger>
          <TabsTrigger value="comparison">Comparativa</TabsTrigger>
        </TabsList>

        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle>Tasa de aparicion de marca</CardTitle>
              <CardDescription>
                Porcentaje de respuestas donde la marca es mencionada
              </CardDescription>
            </CardHeader>
            <CardContent>
              <MetricsChart data={data?.weeklyMetrics || []} metric="appearance_rate" />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sentiment">
          <Card>
            <CardHeader>
              <CardTitle>Evolucion del sentimiento</CardTitle>
              <CardDescription>
                Sentimiento promedio hacia la marca (-1 a 1)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <MetricsChart data={data?.weeklyMetrics || []} metric="avg_sentiment" />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="prominence">
          <Card>
            <CardHeader>
              <CardTitle>Prominencia de marca</CardTitle>
              <CardDescription>
                Nivel de prominencia de la marca en las respuestas (0-100)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <MetricsChart data={data?.weeklyMetrics || []} metric="avg_prominence" />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="warmth">
          <Card>
            <CardHeader>
              <CardTitle>Calidez hacia la marca</CardTitle>
              <CardDescription>
                Tono emocional positivo hacia la marca (0-100)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <MetricsChart data={data?.weeklyMetrics || []} metric="avg_warmth" />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="comparison">
          <Card>
            <CardHeader>
              <CardTitle>Comparativa OpenAI vs Gemini</CardTitle>
              <CardDescription>
                Comparacion de metricas entre los dos LLMs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ComparisonChart summary={summary} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface MetricCardProps {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  openaiValue: string;
  geminiValue: string;
  openaiChange: React.ReactNode;
  geminiChange: React.ReactNode;
}

function MetricCard({
  title,
  icon: Icon,
  openaiValue,
  geminiValue,
  openaiChange,
  geminiChange,
}: MetricCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-gray-500">{title}</CardTitle>
        <Icon className="h-4 w-4 text-gray-400" />
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <Badge variant="outline" className="mb-1 text-green-600 border-green-200 bg-green-50">
                OpenAI
              </Badge>
              <p className="text-2xl font-bold">{openaiValue}</p>
            </div>
            <div className="text-right">
              <Badge variant="outline" className="mb-1 text-blue-600 border-blue-200 bg-blue-50">
                Gemini
              </Badge>
              <p className="text-2xl font-bold">{geminiValue}</p>
            </div>
          </div>
          <div className="flex items-center justify-between border-t pt-2">
            {openaiChange}
            {geminiChange}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
