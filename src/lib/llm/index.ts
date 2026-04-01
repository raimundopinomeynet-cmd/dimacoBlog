export { executeOpenAIPrompt, analyzeWithOpenAI } from './openai';
export { executeGeminiPrompt, analyzeWithGemini } from './gemini';

import { executeOpenAIPrompt } from './openai';
import { executeGeminiPrompt } from './gemini';
import type { LLMProvider, LLMResponse } from '@/types';

export async function executePrompt(
  provider: LLMProvider,
  apiKey: string,
  prompt: string
): Promise<LLMResponse> {
  switch (provider) {
    case 'openai':
      return executeOpenAIPrompt(apiKey, prompt);
    case 'gemini':
      return executeGeminiPrompt(apiKey, prompt);
    default:
      throw new Error(`Unknown LLM provider: ${provider}`);
  }
}
