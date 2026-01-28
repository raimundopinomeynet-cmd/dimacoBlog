import { NextRequest, NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = createServiceRoleClient();

    const { data, error } = await supabase
      .from('responses')
      .select(`
        *,
        analysis_results (
          brand_mentioned,
          mention_count,
          sentiment_score,
          sentiment_label,
          prominence_score,
          warmth_score,
          analysis_details
        )
      `)
      .eq('execution_id', id)
      .order('prompt_index', { ascending: true })
      .order('llm_provider', { ascending: true });

    if (error) {
      console.error('Error fetching responses:', error);
      return NextResponse.json({ error: 'Error fetching responses' }, { status: 500 });
    }

    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
