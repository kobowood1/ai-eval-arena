import { callAnthropic } from './anthropic.js';
import { callOpenAI } from './openai.js';
import type { CallParams, ModelResponse } from './types.js';

export type { CallParams, ModelResponse, Message, ToolDefinition } from './types.js';

const CALL_TIMEOUT_MS = 20_000;

export async function call(params: CallParams): Promise<ModelResponse> {
  const timeout = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error(`Provider call timed out after ${CALL_TIMEOUT_MS}ms`)), CALL_TIMEOUT_MS),
  );

  const request = (async () => {
    switch (params.provider) {
      case 'anthropic':
        return callAnthropic(params);
      case 'openai':
        return callOpenAI(params);
      case 'google':
      case 'xai':
      case 'deepseek':
      case 'meta':
        throw new Error(`Provider "${params.provider}" is not yet implemented`);
    }
  })();

  return Promise.race([request, timeout]);
}
