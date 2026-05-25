import Anthropic from '@anthropic-ai/sdk';
import type { CallParams, ModelResponse } from './types.js';

export async function callAnthropic(params: CallParams): Promise<ModelResponse> {
  const client = new Anthropic({ apiKey: params.apiKey });

  const systemMsg = params.messages.find((m) => m.role === 'system')?.content;
  const userMsgs = params.messages
    .filter((m) => m.role !== 'system')
    .map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content }));

  const tools =
    params.tools?.map((t) => ({
      name: t.name,
      description: t.description ?? '',
      input_schema: t.input_schema as Anthropic.Tool['input_schema'],
    })) ?? [];

  const response = await client.messages.create({
    model: params.model,
    max_tokens: params.maxTokens ?? 300,
    ...(systemMsg !== undefined ? { system: systemMsg } : {}),
    messages: userMsgs,
    ...(tools.length > 0 ? { tools } : {}),
  });

  let text: string | null = null;
  let toolCall: ModelResponse['toolCall'] = null;

  for (const block of response.content) {
    if (block.type === 'text') {
      text = block.text;
    } else if (block.type === 'tool_use') {
      toolCall = {
        name: block.name,
        args: block.input as Record<string, unknown>,
      };
    }
  }

  return {
    text,
    toolCall,
    usage: {
      input: response.usage.input_tokens,
      output: response.usage.output_tokens,
    },
    raw: response,
  };
}
