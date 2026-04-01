'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

interface WeeklyMetric {
  week_start: string;
  llm_provider: string;
  appearance_rate: number;
  avg_sentiment: number;
  avg_prominence: number;
  avg_warmth: number;
  total_responses: number;
  brand_mentions: number;
}

interface MetricsChartProps {
  data: WeeklyMetric[];
  metric: 'appearance_rate' | 'avg_sentiment' | 'avg_prominence' | 'avg_warmth';
}

export function MetricsChart({ data, metric }: MetricsChartProps) {
  // Transform data for the chart
  const chartData = transformDataForChart(data, metric);

  if (chartData.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-gray-500">
        No hay datos disponibles. Ejecuta algunos prompts para ver las metricas.
      </div>
    );
  }

  const getYAxisDomain = () => {
    switch (metric) {
      case 'avg_sentiment':
        return [-1, 1];
      case 'appearance_rate':
      case 'avg_prominence':
      case 'avg_warmth':
        return [0, 100];
      default:
        return [0, 'auto'];
    }
  };

  const formatYAxis = (value: number) => {
    if (metric === 'avg_sentiment') {
      return value.toFixed(1);
    }
    return `${value}%`;
  };

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis
          dataKey="week"
          tick={{ fontSize: 12 }}
          tickLine={{ stroke: '#e5e7eb' }}
          axisLine={{ stroke: '#e5e7eb' }}
        />
        <YAxis
          domain={getYAxisDomain() as [number | string, number | string]}
          tick={{ fontSize: 12 }}
          tickLine={{ stroke: '#e5e7eb' }}
          axisLine={{ stroke: '#e5e7eb' }}
          tickFormatter={formatYAxis}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '6px',
            padding: '8px 12px',
          }}
          labelStyle={{ fontWeight: 600, marginBottom: 4 }}
          formatter={(value: number, name: string) => [
            metric === 'avg_sentiment' ? value.toFixed(2) : `${value.toFixed(1)}%`,
            name,
          ]}
        />
        <Legend />
        <Line
          type="monotone"
          dataKey="openai"
          name="OpenAI"
          stroke="#22c55e"
          strokeWidth={2}
          dot={{ fill: '#22c55e', strokeWidth: 2 }}
          activeDot={{ r: 6 }}
        />
        <Line
          type="monotone"
          dataKey="gemini"
          name="Gemini"
          stroke="#3b82f6"
          strokeWidth={2}
          dot={{ fill: '#3b82f6', strokeWidth: 2 }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

function transformDataForChart(
  data: WeeklyMetric[],
  metric: 'appearance_rate' | 'avg_sentiment' | 'avg_prominence' | 'avg_warmth'
) {
  // Group by week
  const weekMap = new Map<string, { openai?: number; gemini?: number }>();

  data.forEach((item) => {
    const weekKey = item.week_start;
    if (!weekMap.has(weekKey)) {
      weekMap.set(weekKey, {});
    }
    const week = weekMap.get(weekKey)!;
    const value = Number(item[metric]);
    if (item.llm_provider === 'openai') {
      week.openai = value;
    } else if (item.llm_provider === 'gemini') {
      week.gemini = value;
    }
  });

  // Convert to array and sort by date
  return Array.from(weekMap.entries())
    .map(([weekStart, values]) => ({
      week: formatWeek(weekStart),
      weekStart,
      openai: values.openai ?? null,
      gemini: values.gemini ?? null,
    }))
    .sort((a, b) => new Date(a.weekStart).getTime() - new Date(b.weekStart).getTime());
}

function formatWeek(dateStr: string): string {
  try {
    const date = parseISO(dateStr);
    return format(date, "d 'de' MMM", { locale: es });
  } catch {
    return dateStr;
  }
}
