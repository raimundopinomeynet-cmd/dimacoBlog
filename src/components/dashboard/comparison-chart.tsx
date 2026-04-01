'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface Summary {
  openai: {
    appearance: number;
    sentiment: number;
    prominence: number;
    warmth: number;
  };
  gemini: {
    appearance: number;
    sentiment: number;
    prominence: number;
    warmth: number;
  };
}

interface ComparisonChartProps {
  summary: Summary;
}

export function ComparisonChart({ summary }: ComparisonChartProps) {
  const data = [
    {
      metric: 'Aparicion',
      OpenAI: summary.openai.appearance,
      Gemini: summary.gemini.appearance,
    },
    {
      metric: 'Sentimiento',
      // Normalize sentiment from -1,1 to 0-100 for visualization
      OpenAI: ((summary.openai.sentiment + 1) / 2) * 100,
      Gemini: ((summary.gemini.sentiment + 1) / 2) * 100,
    },
    {
      metric: 'Prominencia',
      OpenAI: summary.openai.prominence,
      Gemini: summary.gemini.prominence,
    },
    {
      metric: 'Calidez',
      OpenAI: summary.openai.warmth,
      Gemini: summary.gemini.warmth,
    },
  ];

  const hasData = data.some((d) => d.OpenAI > 0 || d.Gemini > 0);

  if (!hasData) {
    return (
      <div className="flex h-64 items-center justify-center text-gray-500">
        No hay datos disponibles. Ejecuta algunos prompts para ver la comparativa.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis
          dataKey="metric"
          tick={{ fontSize: 12 }}
          tickLine={{ stroke: '#e5e7eb' }}
          axisLine={{ stroke: '#e5e7eb' }}
        />
        <YAxis
          domain={[0, 100]}
          tick={{ fontSize: 12 }}
          tickLine={{ stroke: '#e5e7eb' }}
          axisLine={{ stroke: '#e5e7eb' }}
          tickFormatter={(value) => `${value}%`}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '6px',
            padding: '8px 12px',
          }}
          formatter={(value: number) => [`${value.toFixed(1)}%`]}
        />
        <Legend />
        <Bar
          dataKey="OpenAI"
          fill="#22c55e"
          radius={[4, 4, 0, 0]}
          maxBarSize={50}
        />
        <Bar
          dataKey="Gemini"
          fill="#3b82f6"
          radius={[4, 4, 0, 0]}
          maxBarSize={50}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
