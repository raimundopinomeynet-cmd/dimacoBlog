import OpenAI from 'openai';
import type { LLMResponse } from '@/types';

const MODEL = 'gpt-4o-mini';

export async function executeOpenAIPrompt(
  apiKey: string,
  prompt: string
): Promise<LLMResponse> {
  const openai = new OpenAI({ apiKey });

  const startTime = Date.now();

  const response = await openai.chat.completions.create({
    model: MODEL,
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
    max_tokens: 2000,
    temperature: 0.7,
  });

  const endTime = Date.now();
  const responseText = response.choices[0]?.message?.content || '';

  return {
    provider: 'openai',
    model: MODEL,
    text: responseText,
    responseTimeMs: endTime - startTime,
  };
}

export async function analyzeWithOpenAI(
  apiKey: string,
  brandName: string,
  responseText: string
): Promise<{
  brandMentioned: boolean;
  mentionCount: number;
  sentimentScore: number;
  prominenceScore: number;
  warmthScore: number;
  mentions: string[];
  context: string[];
  competitorsMentioned: string[];
}> {
  const openai = new OpenAI({ apiKey });

  const analysisPrompt = `Analyze the following text for brand positioning metrics for the brand "${brandName}".

Text to analyze:
"""
${responseText}
"""

Provide a JSON response with the following structure:
{
  "brandMentioned": boolean (true if the brand is mentioned),
  "mentionCount": number (count of brand mentions),
  "sentimentScore": number (-1 to 1, where -1 is very negative, 0 is neutral, 1 is very positive),
  "prominenceScore": number (0-100, how prominently featured is the brand),
  "warmthScore": number (0-100, emotional warmth/positivity toward the brand),
  "mentions": string[] (exact quotes where brand is mentioned),
  "context": string[] (context around each mention),
  "competitorsMentioned": string[] (names of competing brands if any)
}

Respond ONLY with valid JSON, no additional text.`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'user',
        content: analysisPrompt,
      },
    ],
    max_tokens: 1000,
    temperature: 0,
  });

  const content = response.choices[0]?.message?.content || '{}';

  try {
    // Extract JSON from potential markdown code blocks
    const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, content];
    const jsonStr = jsonMatch[1]?.trim() || content.trim();
    return JSON.parse(jsonStr);
  } catch {
    // Return default values if parsing fails
    return {
      brandMentioned: false,
      mentionCount: 0,
      sentimentScore: 0,
      prominenceScore: 0,
      warmthScore: 0,
      mentions: [],
      context: [],
      competitorsMentioned: [],
    };
  }
}
