import OpenAI from 'openai';
import type { CallParams, ModelResponse } from './types.js';

export async function callOpenAI(params: CallParams): Promise<ModelResponse> {
  const client = new OpenAI({ apiKey: params.apiKey });

  const messages: OpenAI.ChatCompletionMessageParam[] = params.messages.map((m) => ({
    role: m.role,
    content: m.content,
  }));

  const tools: OpenAI.ChatCompletionTool[] | undefined = params.tools?.map((t) => ({
    type: 'function' as const,
    function: {
      name: t.name,
      description: t.description ?? '',
      parameters: t.input_schema,
    },
  }));

  const response = await client.chat.completions.create({
    model: params.model,
    max_tokens: params.maxTokens ?? 300,
    messages,
    ...(tools && tools.length > 0 ? { tools, tool_choice: 'auto' } : {}),
  });

  const choice = response.choices[0];
  if (!choice) throw new Error('OpenAI returned no choices');

  const msg = choice.message;
  let text: string | null = msg.content ?? null;
  let toolCall: ModelResponse['toolCall'] = null;

  if (msg.tool_calls && msg.tool_calls.length > 0) {
    const tc = msg.tool_calls[0];
    if (tc) {
      toolCall = {
        name: tc.function.name,
        args: JSON.parse(tc.function.arguments) as Record<string, unknown>,
      };
      text = null;
    }
  }

  return {
    text,
    toolCall,
    usage: {
      input: response.usage?.prompt_tokens ?? 0,
      output: response.usage?.completion_tokens ?? 0,
    },
    raw: response,
  };
}
