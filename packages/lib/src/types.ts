export type Provider = 'anthropic' | 'openai' | 'google' | 'xai' | 'deepseek' | 'meta';

export type Mode = 'tank' | 'chess' | 'essay';

export type Side = 'A' | 'B';

export type MatchWinner = 'A' | 'B' | 'tie' | 'timeout' | 'forfeit';

export type MatchEvent =
  | { type: 'match_start'; config: Record<string, unknown> }
  | { type: 'thought'; side: Side; text: string }
  | { type: 'move'; side: Side; payload: Record<string, unknown> }
  | { type: 'hit'; attacker: Side; damage: number }
  | { type: 'capture'; piece: string; square: string }
  | { type: 'essay_submitted'; side: Side; word_count: number }
  | { type: 'vote'; winner: Side | 'tie' }
  | { type: 'match_end'; winner: MatchWinner; reason: string };

export interface ModelConfig {
  id: string;
  userId: string;
  label: string;
  provider: Provider;
  model: string;
}
