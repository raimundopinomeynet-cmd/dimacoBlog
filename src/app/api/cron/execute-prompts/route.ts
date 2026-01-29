import { NextRequest, NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase/server';
import { decrypt } from '@/lib/encryption';
import { executeOpenAIPrompt, analyzeWithOpenAI } from '@/lib/llm/openai';
import { executeGeminiPrompt } from '@/lib/llm/gemini';
import { getSentimentLabel } from '@/lib/utils';
import type { LLMProvider, Project } from '@/types';

// Verify the request is from Vercel Cron
function verifyCronRequest(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    console.warn('CRON_SECRET not configured');
    return false;
  }

  return authHeader === `Bearer ${cronSecret}`;
}

export async function GET(request: NextRequest) {
  // Verify this is a valid cron request
  if (!verifyCronRequest(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  console.log('Cron job started: executing prompts for all active projects');

  try {
    const supabase = createServiceRoleClient();

    // Get all active projects
    const { data: projects, error: projectsError } = await supabase
      .from('projects')
      .select('*')
      .eq('is_active', true);

    if (projectsError) {
      console.error('Error fetching projects:', projectsError);
      return NextResponse.json({ error: 'Error fetching projects' }, { status: 500 });
    }

    if (!projects || projects.length === 0) {
      console.log('No active projects found');
      return NextResponse.json({ message: 'No active projects' });
    }

    console.log(`Found ${projects.length} active projects`);

    const results: { projectId: string; status: string; error?: string }[] = [];

    for (const project of projects) {
      try {
        // Get API settings for this project's user
        const { data: settings } = await supabase
          .from('api_settings')
          .select('openai_key_encrypted, gemini_key_encrypted')
          .eq('user_id', project.user_id)
          .single();

        const openaiKey = settings?.openai_key_encrypted
          ? decrypt(settings.openai_key_encrypted)
          : null;
        const geminiKey = settings?.gemini_key_encrypted
          ? decrypt(settings.gemini_key_encrypted)
          : null;

        if (!openaiKey && !geminiKey) {
          results.push({
            projectId: project.id,
            status: 'skipped',
            error: 'No API keys configured',
          });
          continue;
        }

        // Create execution record
        const { data: execution, error: execError } = await supabase
          .from('executions')
          .insert({
            project_id: project.id,
            status: 'running',
          })
          .select()
          .single();

        if (execError || !execution) {
          results.push({
            projectId: project.id,
            status: 'failed',
            error: 'Error creating execution record',
          });
          continue;
        }

        // Execute prompts
        await executeProjectPrompts(
          supabase,
          execution.id,
          project,
          openaiKey,
          geminiKey
        );

        results.push({
          projectId: project.id,
          status: 'completed',
        });
      } catch (error) {
        console.error(`Error processing project ${project.id}:`, error);
        results.push({
          projectId: project.id,
          status: 'failed',
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    console.log('Cron job completed:', results);

    return NextResponse.json({
      message: 'Cron job completed',
      results,
    });
  } catch (error) {
    console.error('Cron job error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function executeProjectPrompts(
  supabase: ReturnType<typeof createServiceRoleClient>,
  executionId: string,
  project: Project,
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

          // Analyze response
          const analysisKey = openaiKey || geminiKey;
          if (analysisKey) {
            const analysis = await analyzeWithOpenAI(
              analysisKey,
              project.brand_name,
              response.text
            );

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
          console.error(`Error with ${provider}:`, providerError);
        }
      }
    }

    // Mark execution as completed
    await supabase
      .from('executions')
      .update({ status: 'completed' })
      .eq('id', executionId);
  } catch (error) {
    console.error('Execution error:', error);
    await supabase
      .from('executions')
      .update({
        status: 'failed',
        error_message: error instanceof Error ? error.message : 'Unknown error',
      })
      .eq('id', executionId);
    throw error;
  }
}
