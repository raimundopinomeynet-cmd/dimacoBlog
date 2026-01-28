import { GoogleGenerativeAI } from '@google/generative-ai';
import type { LLMResponse } from '@/types';

const MODEL = 'gemini-1.5-flash';

export async function executeGeminiPrompt(
  apiKey: string,
  prompt: string
): Promise<LLMResponse> {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: MODEL });

  const startTime = Date.now();

  const result = await model.generateContent(prompt);
  const response = result.response;
  const text = response.text();

  const endTime = Date.now();

  return {
    provider: 'gemini',
    model: MODEL,
    text,
    responseTimeMs: endTime - startTime,
  };
}

export async function analyzeWithGemini(
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
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

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

  const result = await model.generateContent(analysisPrompt);
  const content = result.response.text();

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
