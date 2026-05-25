# Arena.ai — Product Spec

## Goal

Ship a working, hosted Arena.ai where:
- A real user signs up
- Configures two real models with real API keys
- Watches a real match play out with both APIs being called
- Sees the result on a real leaderboard

Everything else is gravy.

## Personas

- **The Curious Engineer.** Wants to know if Claude Opus is "really" better than GPT-5 at something concrete. Will spend $5 on API calls to find out.
- **The AI-Curious PM.** Doesn't have API keys. Wants to watch the demo and feel smart about model differences. Conversion target: get them to sign up and bring keys.
- **The Researcher / Vibes Pundit.** Wants to share match results on Twitter/LinkedIn. Treats the leaderboard as a source of takes.

The product wins or loses on whether matches are *fun to watch*. Optimize there.

## Build order (suggested phases)

### Phase 0 — Foundations (1–2 days)

- [ ] Init monorepo: `apps/web`, `apps/runtime`, `packages/db`, `packages/providers`, `packages/lib`
- [ ] Workspace tooling: TypeScript project references, shared `tsconfig.base.json`, root `npm run dev` that boots both apps
- [ ] Next.js 15 + Tailwind v4 + shadcn/ui base in `apps/web`
- [ ] Bare `ws` server in `apps/runtime` that echoes messages
- [ ] Drizzle + Neon Postgres in `packages/db`, first migration applied
- [ ] `packages/lib/crypto.ts` with KEK/DEK pattern, unit tests for encrypt/decrypt round-trip
- [ ] `packages/providers/index.ts` — unified `call({ provider, model, key, messages, tools })` returning normalized `{ text, toolCall, usage }`
- [ ] NextAuth v5 wired with email magic-link + Google OAuth, protected route middleware
- [ ] Port the prototype's landing page to a real Next.js route, no functional changes
- [ ] `.env.example` files for each app, `README.md` with local-dev instructions
- [ ] Deploy: web → Vercel preview, runtime → Fly.io preview, DB → Neon dev branch

**Done when:** A user can sign up, sign in, and see the landing page rendered from real components on Vercel, with the runtime service running on Fly responding to a ping.

### Phase 1 — Model configs + Essay duel (2–3 days)

Essay is the easiest mode and proves the API key flow end-to-end.

- [ ] Schema: `users`, `model_configs (user_id, label, provider, model, encrypted_key, key_iv, key_dek_wrapped)`
- [ ] Setup screen: full CRUD for two model configs
- [ ] Essay engine in `apps/web/app/api/essay/route.ts`: send prompt to both models in parallel via `packages/providers`, collect responses, return as JSON
- [ ] Essay duel UI: blind side-by-side, vote, reveal — matching the prototype exactly
- [ ] Match record written to DB with verdict
- [ ] First version of leaderboard reading from DB

**Done when:** A user can run an essay duel with their real keys, vote, and see the result on the leaderboard.

### Phase 2 — Chess (3–4 days)

Chess is medium difficulty but well-trodden. Use this phase to build the realtime infrastructure that tank will need.

- [ ] WebSocket protocol: client subscribes to `/match/:id`, runtime broadcasts JSON events
- [ ] Chess engine in `apps/runtime/src/modes/chess.ts` using `chess.js` as referee
- [ ] Per-move flow: server sends FEN to model → model returns SAN → server validates → updates board → broadcasts to client
- [ ] Time controls (5+5), illegal-move forfeit
- [ ] Frontend chess board with animated piece transitions matching the prototype
- [ ] Move log with per-move "thinking" excerpt from model
- [ ] Match events persisted to DB for replay

**Done when:** Two real models play a full chess game start to finish, observable in real time across reload.

### Phase 3 — Tank (4–6 days)

The hardest mode. Most product value.

- [ ] Tank referee: grid state, walls, bullets, HP, collision rules — fully tested with scripted players first
- [ ] Per-tick prompt protocol (see `PROTOCOLS.md`)
- [ ] Frontend canvas/DOM renderer matching the prototype
- [ ] Sprite swap when sprite files arrive
- [ ] Hit detection, win conditions, max-tick timeout
- [ ] Combat log streaming over WebSocket

**Done when:** Two real models play a full tank match with intelligible movement and shooting.

### Phase 4 — Demo mode (1–2 days)

- [ ] Capture 6–10 high-quality matches across all three modes during dev
- [ ] Store as canned replays (sequence of state snapshots) in DB
- [ ] Demo mode UI plays them back without any API calls
- [ ] Prominent "Bring your own keys to play live" CTA at end of each demo

**Done when:** A logged-out user can hit the landing page, click Demo, and watch a tank match without signing up.

### Phase 5 — Polish (ongoing)

- [ ] ELO calibration, leaderboard filtering by mode
- [ ] Match history per user
- [ ] Shareable match URLs (public replays)
- [ ] Cost dashboard (estimated $ spent per match, computed from logged usage)
- [ ] Provider list expansion (xAI, DeepSeek, Meta)
- [ ] Mobile responsive marketing pages
- [ ] Production hardening: rate limiting, abuse signals, error tracking (Sentry)

## Database schema (initial)

```typescript
users {
  id: uuid PK
  email: varchar UNIQUE
  handle: varchar UNIQUE
  created_at: timestamp
}

accounts {            // NextAuth — managed by adapter
  ...
}

sessions {            // NextAuth — managed by adapter
  ...
}

model_configs {
  id: uuid PK
  user_id: uuid FK → users.id
  label: varchar           // "alpha" | "omega" | custom
  provider: varchar        // "anthropic" | "openai" | etc.
  model: varchar           // "claude-opus-4-7" etc.
  encrypted_key: bytea     // AES-256-GCM ciphertext
  key_iv: bytea
  key_dek_wrapped: bytea   // DEK wrapped with user's KEK
  created_at: timestamp
}

matches {
  id: uuid PK
  user_id: uuid FK → users.id
  mode: varchar            // "tank" | "chess" | "essay"
  fighter_a_config_id: uuid FK → model_configs.id
  fighter_b_config_id: uuid FK → model_configs.id
  winner: varchar          // "A" | "B" | "tie" | "timeout" | "forfeit"
  duration_ms: int
  total_tokens_a: int
  total_tokens_b: int
  estimated_cost_usd: numeric
  is_public_replay: boolean DEFAULT false
  created_at: timestamp
  finished_at: timestamp
}

match_events {
  id: uuid PK
  match_id: uuid FK → matches.id
  tick: int
  side: varchar            // "A" | "B" | "system"
  event_type: varchar      // "move" | "fire" | "thought" | "hit" | "win"
  payload: jsonb
  created_at: timestamp
}

ratings {
  id: uuid PK
  model_identifier: varchar  // "anthropic/claude-opus-4-7"
  mode: varchar              // "tank" | "chess" | "essay" | "composite"
  elo: int
  wins: int
  losses: int
  ties: int
  updated_at: timestamp
  UNIQUE (model_identifier, mode)
}
```

## Cost guardrails

| Mode | Calls/match | Tokens/call (avg) | Cost @ Opus 4.7 | Cost @ GPT-5 |
|------|-------------|-------------------|-----------------|--------------|
| Essay | 1 per side = 2 | ~2K out | ~$0.03 | ~$0.04 |
| Chess | ~40 per side = 80 | ~500 in / 50 out | ~$0.20 | ~$0.25 |
| Tank | ~60 per side = 120 | ~800 in / 30 out | ~$0.30 | ~$0.35 |

User pays for their own keys. We display estimated cost before they hit "Start." No surprise bills.

## Hosting cost estimate (early)

- **Vercel:** Hobby plan free for dev, $20/mo Pro for production (longer function timeouts, more bandwidth)
- **Fly.io:** ~$5/mo for a single shared-cpu-1x VM running the runtime
- **Neon:** Free tier through ~10K matches, then $19/mo Launch plan
- **Domain + email:** ~$15/yr for domain, ~$10/mo for transactional email (Resend free tier covers dev)

You can run the entire thing for $0 in dev and ~$30/mo when you flip to production.

## Out of scope (for v1)

- Tournaments / brackets
- Custom prompts / custom games
- Model fine-tuning
- Pay-as-you-go via Stripe (we don't hold any keys; users pay providers directly)
- Mobile app
- Multi-user spectator mode
- API key proxying — we never hold the key for billing, user always brings their own

## Success metrics

- **D7 retention:** if someone runs a match, do they come back within a week?
- **Match completion rate:** of matches started, what % finish without crashing or timing out?
- **Demo → signup conversion:** % of demo viewers who create an account
- **Cost per match (p95):** should stay under $0.50 for any mode
