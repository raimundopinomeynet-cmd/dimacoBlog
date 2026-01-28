import { NextRequest, NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase/server';
import { decrypt } from '@/lib/encryption';
import { executeOpenAIPrompt, analyzeWithOpenAI } from '@/lib/llm/openai';
import { executeGeminiPrompt } from '@/lib/llm/gemini';
import { getSentimentLabel } from '@/lib/utils';
import type { LLMProvider } from '@/types';

// Demo user ID for now - in production this would come from auth
const DEMO_USER_ID = '00000000-0000-0000-0000-000000000001';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { projectId } = body;

    if (!projectId) {
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });
    }

    const supabase = createServiceRoleClient();

    // Get project
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .eq('user_id', DEMO_USER_ID)
      .single();

    if (projectError || !project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Get API keys
    const { data: settings, error: settingsError } = await supabase
      .from('api_settings')
      .select('openai_key_encrypted, gemini_key_encrypted')
      .eq('user_id', DEMO_USER_ID)
      .single();

    if (settingsError || !settings) {
      return NextResponse.json({ error: 'API keys not configured' }, { status: 400 });
    }

    const openaiKey = settings.openai_key_encrypted
      ? decrypt(settings.openai_key_encrypted)
      : null;
    const geminiKey = settings.gemini_key_encrypted
      ? decrypt(settings.gemini_key_encrypted)
      : null;

    if (!openaiKey && !geminiKey) {
      return NextResponse.json(
        { error: 'At least one API key must be configured' },
        { status: 400 }
      );
    }

    // Create execution record
    const { data: execution, error: execError } = await supabase
      .from('executions')
      .insert({
        project_id: projectId,
        status: 'running',
      })
      .select()
      .single();

    if (execError || !execution) {
      console.error('Error creating execution:', execError);
      return NextResponse.json({ error: 'Error creating execution' }, { status: 500 });
    }

    // Execute prompts in background
    executePromptsInBackground(
      supabase,
      execution.id,
      project,
      openaiKey,
      geminiKey
    );

    return NextResponse.json({
      success: true,
      executionId: execution.id,
      message: 'Execution started',
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function executePromptsInBackground(
  supabase: ReturnType<typeof createServiceRoleClient>,
  executionId: string,
  project: {
    id: string;
    brand_name: string;
    prompts: string[];
  },
  openaiKey: string | null,
  geminiKey: string | null
) {
  try {
    const providers: { provider: LLMProvider; key: string }[] = [];
    if (openaiKey) providers.push({ provider: 'openai', key: openaiKey });
    if (geminiKey) providers.push({ provider: 'gemini', key: geminiKey });

    for (let promptIndex = 0; promptIndex < project.prompts.length; promptIndex++) {
      const promptText = project.prompts[promptIndex];

      for (const { provider, key } of providers) {
        try {
          // Execute prompt
          let response;
          if (provider === 'openai') {
            response = await executeOpenAIPrompt(key, promptText);
          } else {
            response = await executeGeminiPrompt(key, promptText);
          }

          // Store response
          const { data: responseRecord, error: responseError } = await supabase
            .from('responses')
            .insert({
              execution_id: executionId,
              project_id: project.id,
              prompt_index: promptIndex,
              prompt_text: promptText,
              llm_provider: provider,
              llm_model: response.model,
              response_text: response.text,
              response_time_ms: response.responseTimeMs,
            })
            .select()
            .single();

          if (responseError || !responseRecord) {
            console.error('Error storing response:', responseError);
            continue;
          }

          // Analyze response (use OpenAI for analysis if available)
          const analysisKey = openaiKey || geminiKey;
          if (analysisKey) {
            const analysis = await analyzeWithOpenAI(
              openaiKey || geminiKey!,
              project.brand_name,
              response.text
            );

            // Store analysis
            await supabase.from('analysis_results').insert({
              response_id: responseRecord.id,
              project_id: project.id,
              execution_id: executionId,
              brand_mentioned: analysis.brandMentioned,
              mention_count: analysis.mentionCount,
              sentiment_score: analysis.sentimentScore,
              sentiment_label: getSentimentLabel(analysis.sentimentScore),
              prominence_score: analysis.prominenceScore,
              warmth_score: analysis.warmthScore,
              analysis_details: {
                mentions: analysis.mentions,
                context: analysis.context,
                competitorsMentioned: analysis.competitorsMentioned,
              },
            });
          }
        } catch (providerError) {
          console.error(`Error executing prompt with ${provider}:`, providerError);
        }
      }
    }

    // Mark execution as completed
    await supabase
      .from('executions')
      .update({ status: 'completed' })
      .eq('id', executionId);
  } catch (error) {
    console.error('Background execution error:', error);

    // Mark execution as failed
    await supabase
      .from('executions')
      .update({
        status: 'failed',
        error_message: error instanceof Error ? error.message : 'Unknown error',
      })
      .eq('id', executionId);
  }
}
