import { NextRequest, NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase/server';
import { subWeeks } from 'date-fns';

// Demo user ID for now - in production this would come from auth
const DEMO_USER_ID = '00000000-0000-0000-0000-000000000001';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');

    const supabase = createServiceRoleClient();

    // Get user's project IDs for filtering
    let projectIds: string[] = [];

    if (projectId && projectId !== 'all') {
      projectIds = [projectId];
    } else {
      const { data: projects } = await supabase
        .from('projects')
        .select('id')
        .eq('user_id', DEMO_USER_ID);

      projectIds = projects?.map((p) => p.id) || [];
    }

    if (projectIds.length === 0) {
      return NextResponse.json({
        weeklyMetrics: [],
        summary: {
          openai: {
            appearance: 0,
            sentiment: 0,
            prominence: 0,
            warmth: 0,
            previousAppearance: 0,
            previousSentiment: 0,
            previousProminence: 0,
            previousWarmth: 0,
          },
          gemini: {
            appearance: 0,
            sentiment: 0,
            prominence: 0,
            warmth: 0,
            previousAppearance: 0,
            previousSentiment: 0,
            previousProminence: 0,
            previousWarmth: 0,
          },
        },
      });
    }

    // Get analysis results
    const { data: analysisResults, error: analysisError } = await supabase
      .from('analysis_results')
      .select('*')
      .in('project_id', projectIds)
      .order('created_at', { ascending: false });

    if (analysisError) {
      console.error('Error fetching analysis:', analysisError);
      return NextResponse.json({ error: 'Error fetching metrics' }, { status: 500 });
    }

    // Get responses to get the llm_provider
    const responseIds = analysisResults?.map((a) => a.response_id) || [];

    let responsesMap = new Map<string, string>();

    if (responseIds.length > 0) {
      const { data: responses } = await supabase
        .from('responses')
        .select('id, llm_provider')
        .in('id', responseIds);

      responses?.forEach((r) => {
        responsesMap.set(r.id, r.llm_provider);
      });
    }

    // Combine data
    const metricsData: MetricRow[] = (analysisResults || []).map((row) => ({
      created_at: row.created_at,
      brand_mentioned: row.brand_mentioned,
      mention_count: row.mention_count,
      sentiment_score: row.sentiment_score,
      prominence_score: row.prominence_score,
      warmth_score: row.warmth_score,
      llm_provider: responsesMap.get(row.response_id) || 'unknown',
    }));

    // Process weekly metrics
    const processedWeeklyMetrics = processWeeklyMetrics(metricsData);

    // Calculate summary
    const summary = calculateSummary(metricsData);

    return NextResponse.json({
      weeklyMetrics: processedWeeklyMetrics,
      summary,
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

interface MetricRow {
  created_at: string;
  brand_mentioned: boolean;
  mention_count: number;
  sentiment_score: number;
  prominence_score: number;
  warmth_score: number;
  llm_provider: string;
}

function processWeeklyMetrics(data: MetricRow[]) {
  // Group by week and provider
  const weekMap = new Map<
    string,
    Map<
      string,
      {
        total: number;
        brandMentioned: number;
        sentimentSum: number;
        prominenceSum: number;
        warmthSum: number;
      }
    >
  >();

  data.forEach((row) => {
    const date = new Date(row.created_at);
    // Get start of week (Monday)
    const dayOfWeek = date.getDay();
    const diff = date.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    const weekStart = new Date(date.setDate(diff));
    weekStart.setHours(0, 0, 0, 0);
    const weekKey = weekStart.toISOString().split('T')[0];

    const provider = row.llm_provider || 'unknown';

    if (!weekMap.has(weekKey)) {
      weekMap.set(weekKey, new Map());
    }

    const providerMap = weekMap.get(weekKey)!;
    if (!providerMap.has(provider)) {
      providerMap.set(provider, {
        total: 0,
        brandMentioned: 0,
        sentimentSum: 0,
        prominenceSum: 0,
        warmthSum: 0,
      });
    }

    const stats = providerMap.get(provider)!;
    stats.total++;
    if (row.brand_mentioned) stats.brandMentioned++;
    stats.sentimentSum += Number(row.sentiment_score);
    stats.prominenceSum += Number(row.prominence_score);
    stats.warmthSum += Number(row.warmth_score);
  });

  // Convert to array format
  const result: {
    week_start: string;
    llm_provider: string;
    appearance_rate: number;
    avg_sentiment: number;
    avg_prominence: number;
    avg_warmth: number;
    total_responses: number;
    brand_mentions: number;
  }[] = [];

  weekMap.forEach((providerMap, weekKey) => {
    providerMap.forEach((stats, provider) => {
      result.push({
        week_start: weekKey,
        llm_provider: provider,
        appearance_rate: stats.total > 0 ? (stats.brandMentioned / stats.total) * 100 : 0,
        avg_sentiment: stats.total > 0 ? stats.sentimentSum / stats.total : 0,
        avg_prominence: stats.total > 0 ? stats.prominenceSum / stats.total : 0,
        avg_warmth: stats.total > 0 ? stats.warmthSum / stats.total : 0,
        total_responses: stats.total,
        brand_mentions: stats.brandMentioned,
      });
    });
  });

  return result.sort((a, b) => a.week_start.localeCompare(b.week_start));
}

function calculateSummary(data: MetricRow[]) {
  const now = new Date();
  const oneWeekAgo = subWeeks(now, 1);
  const twoWeeksAgo = subWeeks(now, 2);

  const currentWeek = data.filter((d) => new Date(d.created_at) >= oneWeekAgo);
  const previousWeek = data.filter(
    (d) => new Date(d.created_at) >= twoWeeksAgo && new Date(d.created_at) < oneWeekAgo
  );

  const calculateProviderStats = (subset: MetricRow[], provider: string) => {
    const filtered = subset.filter((d) => d.llm_provider === provider);
    if (filtered.length === 0) {
      return { appearance: 0, sentiment: 0, prominence: 0, warmth: 0 };
    }

    const brandMentioned = filtered.filter((d) => d.brand_mentioned).length;
    const avgSentiment =
      filtered.reduce((sum, d) => sum + Number(d.sentiment_score), 0) / filtered.length;
    const avgProminence =
      filtered.reduce((sum, d) => sum + Number(d.prominence_score), 0) / filtered.length;
    const avgWarmth =
      filtered.reduce((sum, d) => sum + Number(d.warmth_score), 0) / filtered.length;

    return {
      appearance: (brandMentioned / filtered.length) * 100,
      sentiment: avgSentiment,
      prominence: avgProminence,
      warmth: avgWarmth,
    };
  };

  const openaiCurrent = calculateProviderStats(currentWeek, 'openai');
  const openaiPrevious = calculateProviderStats(previousWeek, 'openai');
  const geminiCurrent = calculateProviderStats(currentWeek, 'gemini');
  const geminiPrevious = calculateProviderStats(previousWeek, 'gemini');

  return {
    openai: {
      ...openaiCurrent,
      previousAppearance: openaiPrevious.appearance,
      previousSentiment: openaiPrevious.sentiment,
      previousProminence: openaiPrevious.prominence,
      previousWarmth: openaiPrevious.warmth,
    },
    gemini: {
      ...geminiCurrent,
      previousAppearance: geminiPrevious.appearance,
      previousSentiment: geminiPrevious.sentiment,
      previousProminence: geminiPrevious.prominence,
      previousWarmth: geminiPrevious.warmth,
    },
  };
}
