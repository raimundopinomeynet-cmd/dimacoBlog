export * from './database';

// Analysis types
export interface BrandAnalysis {
  brandMentioned: boolean;
  mentionCount: number;
  sentimentScore: number; // -1 to 1
  sentimentLabel: 'positive' | 'neutral' | 'negative';
  prominenceScore: number; // 0 to 100
  warmthScore: number; // 0 to 100
  details: {
    mentions: string[];
    context: string[];
    competitorsMentioned: string[];
  };
}

// Chart data types
export interface ChartDataPoint {
  date: string;
  week: string;
  openai: number;
  gemini: number;
}

export interface MetricSummary {
  current: number;
  previous: number;
  change: number;
  changePercent: number;
}

export interface DashboardMetrics {
  brandAppearance: {
    openai: MetricSummary;
    gemini: MetricSummary;
  };
  averageSentiment: {
    openai: MetricSummary;
    gemini: MetricSummary;
  };
  averageProminence: {
    openai: MetricSummary;
    gemini: MetricSummary;
  };
  averageWarmth: {
    openai: MetricSummary;
    gemini: MetricSummary;
  };
}

// Form types
export interface ProjectFormData {
  name: string;
  brandName: string;
  industry: string;
  service: string;
  country: string;
  prompts: string[];
}

export interface ApiSettingsFormData {
  openaiKey: string;
  geminiKey: string;
}

// API response types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  success: boolean;
}

// LLM types
export type LLMProvider = 'openai' | 'gemini';

export interface LLMResponse {
  provider: LLMProvider;
  model: string;
  text: string;
  responseTimeMs: number;
}

// Filter types
export interface DashboardFilters {
  projectId: string | null;
  dateRange: {
    start: Date;
    end: Date;
  };
  llmProvider: LLMProvider | 'all';
  metric: 'appearance' | 'sentiment' | 'prominence' | 'warmth' | 'all';
}
