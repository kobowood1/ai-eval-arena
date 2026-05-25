import type { Provider } from '@arena/lib/types';

export interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ToolDefinition {
  name: string;
  description?: string;
  input_schema: Record<string, unknown>;
}

export interface CallParams {
  provider: Provider;
  model: string;
  apiKey: string;
  messages: Message[];
  tools?: ToolDefinition[];
  maxTokens?: number;
}

export interface ModelResponse {
  text: string | null;
  toolCall: {
    name: string;
    args: Record<string, unknown>;
  } | null;
  usage: { input: number; output: number };
  raw: unknown;
}
