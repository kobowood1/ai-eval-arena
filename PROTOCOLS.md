# Arena.ai — Model I/O Protocols

> The exact contracts each game mode uses to talk to the AI models. The referee is authoritative; these define what the referee sends and what it accepts back.

## Universal rules

- All model calls go through `packages/providers/index.ts::call()` which normalizes across SDKs.
- Use the provider's tool-use / structured-output mechanism wherever available. Plain text parsing is the fallback, not the default.
- Hard timeout per call: **20 seconds**. After that, the move is a forfeit for the slow side.
- If a model returns malformed output: one retry with a clarifying message ("Your previous response was invalid because X. Reply only with the JSON tool call."), then forfeit.
- Token caps per call: 1500 input / 300 output for tank and chess; no cap for essay.

## Mode 1 — Tank Battle

### State sent to the model each tick

```json
{
  "tick": 12,
  "you": { "id": "A", "x": 4, "y": 5, "dir": "right", "hp": 75 },
  "enemy": { "x": 8, "y": 7, "dir": "left", "hp": 50 },
  "grid_size": 13,
  "walls": [[3,2],[3,3],[4,2]],
  "bullets": [
    { "x": 6, "y": 5, "dir": "right", "owner": "A" }
  ],
  "your_last_action": { "type": "move", "dir": "right" },
  "enemy_last_action": { "type": "fire", "dir": "left" },
  "ticks_remaining": 78
}
```

### System prompt (paraphrased — full text in `apps/runtime/src/modes/tank.ts`)

> You control tank A in a Battle City–style grid combat game. Your goal: destroy the enemy tank before they destroy you, or before time runs out. Each tick, choose ONE action: move (up/down/left/right), fire (in your current facing direction), or idle. Bullets travel one cell per tick. Walls block movement and bullets. You must respond using the `tank_action` tool. Think tactically: control corners, use walls for cover, fire only when you have line of sight.

### Tool definition

```json
{
  "name": "tank_action",
  "description": "Choose this tank's action for the current tick.",
  "input_schema": {
    "type": "object",
    "required": ["action"],
    "properties": {
      "action": { "enum": ["move", "fire", "idle"] },
      "direction": { "enum": ["up", "down", "left", "right"] },
      "reasoning": { "type": "string", "maxLength": 200 }
    }
  }
}
```

### Validation rules (referee)

- `action: "move"` requires `direction`. Move fails silently (idle) if target cell is a wall, off-grid, or occupied by enemy tank.
- `action: "fire"` ignores `direction` — bullet always travels in the tank's current facing direction. (Tank turns when it moves.)
- `reasoning` is captured into match_events for the live commentary feed.
- Malformed → one retry → forfeit if still bad.

### Win conditions

- Enemy HP ≤ 0 → you win.
- Tick budget exhausted (90 ticks) → highest HP wins; tie if equal.
- Forfeit (3 consecutive malformed responses or hard crash) → opponent wins.

## Mode 2 — Chess

### State sent to the model each turn

```json
{
  "fen": "rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq e6 0 2",
  "your_color": "white",
  "move_history_san": ["e4", "e5"],
  "your_clock_seconds": 285,
  "enemy_clock_seconds": 290,
  "in_check": false
}
```

### System prompt

> You are playing chess as the {color} pieces. Respond with your move in standard algebraic notation (SAN) using the `chess_move` tool. Examples of valid moves: "e4", "Nf3", "O-O", "Bxc6+", "Qxh7#". You may include brief reasoning. The board state is provided as FEN. Think about position, not just tactics.

### Tool definition

```json
{
  "name": "chess_move",
  "input_schema": {
    "type": "object",
    "required": ["move"],
    "properties": {
      "move": { "type": "string", "description": "SAN notation, e.g. 'Nf3' or 'e4'" },
      "reasoning": { "type": "string", "maxLength": 300 }
    }
  }
}
```

### Validation (referee = `chess.js`)

- Parse SAN. If parse fails, retry once with: "That move was invalid in this position. Legal moves are: [list of top 10 by chess.js]. Try again."
- After retry failure → forfeit.
- Illegal but parseable moves (e.g. moving into check) → forfeit immediately, no retry. The model knew the rules; it tried to cheat.

### Win conditions

- Standard chess: checkmate, resignation (model returns `move: "resign"`), stalemate, threefold, 50-move, time forfeit.
- Time control: 5 min total per side, 5-second increment.

## Mode 3 — Essay

### Single call per side

```json
{
  "messages": [
    { "role": "system", "content": "You are competing in a writing duel. Write a Harvard-style analytical essay on the given prompt. Aim for 350–500 words. Defend a clear thesis with structured argument and reference where appropriate. Your essay will be judged blind against another model." },
    { "role": "user", "content": "<prompt>" }
  ]
}
```

No tool use. Model returns plaintext. Both essays rendered side-by-side, anonymized as "A" and "B". User votes. Identity revealed after vote.

### Validation

- Trim leading/trailing whitespace.
- Reject if < 100 words or > 1500 words → retry once with explicit length guidance → forfeit if still off.
- No content moderation in v1 — prompts are author-curated and bounded. Add moderation when user-submitted prompts ship.

## Cost & timing budgets

| Mode | Max calls/side | Max tokens out/call | Hard match timeout |
|------|----------------|---------------------|--------------------|
| Tank | 90 | 300 | 5 min |
| Chess | 80 | 300 | 12 min (clock + buffer) |
| Essay | 2 (incl. retry) | unbounded ≤2k | 90 sec/side |

If a match exceeds its hard timeout, referee declares the result based on current state (HP for tank, material+position eval for chess, forfeit for essay if not generated).

## Provider quirks to handle in `packages/providers/index.ts`

- **Anthropic:** `tool_use` block in `content` array. Tool result must be sent as `tool_result` block in next user turn. Streaming differs from completion.
- **OpenAI:** `tool_calls` array on message. Tool results sent as `role: "tool"` messages with `tool_call_id`. Function calling and structured outputs are different APIs — use structured outputs for chess/tank.
- **Google Gemini:** `functionCall` in parts array. `functionResponse` for the reply. Schema syntax differs slightly from JSON Schema (no `additionalProperties`).
- **xAI/DeepSeek:** OpenAI-compatible. Use the OpenAI client with a different base URL.

The unified `call()` returns:

```typescript
type ModelResponse = {
  text: string | null;        // any text content
  toolCall: {
    name: string;
    args: Record<string, unknown>;
  } | null;
  usage: { input: number; output: number };
  raw: unknown;               // for debugging
};
```

## Match event log format

Every notable thing that happens in a match becomes a row in `match_events`:

```typescript
type MatchEvent =
  | { type: "match_start", config: { ... } }
  | { type: "thought", side: "A" | "B", text: string }
  | { type: "move", side: "A" | "B", payload: TankMove | ChessMove }
  | { type: "hit", attacker: "A" | "B", damage: number }      // tank only
  | { type: "capture", piece: string, square: string }         // chess only
  | { type: "essay_submitted", side: "A" | "B", word_count: number }
  | { type: "vote", winner: "A" | "B" | "tie" }                // essay only
  | { type: "match_end", winner: "A" | "B" | "tie" | "forfeit", reason: string };
```

This is what the WebSocket streams to the client and what's persisted for replays.
