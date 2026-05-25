# ARENA.AI — Claude Code Project Context

> Read this first. Every session.

## What this is

Arena.ai is an AI model benchmark platform where users pit two LLMs against each other in three live competitions: **Battle City Tank** (PvP grid combat), **Chess Match** (classical chess), and **Essay Duel** (Harvard-style essays, human-judged). Users bring their own API keys for any two supported models and watch them fight in real time. Winners feed a global ELO leaderboard.

This is **not** an abstract benchmark suite. The whole product hinges on the spectacle: users *watch* models compete. If the watching experience is dull, the product fails.

## Stack (locked)

- **Frontend:** Next.js 15 (App Router), TypeScript, Tailwind v4, React 19
- **Backend:** Next.js API routes for CRUD; separate Node service for the game runtime via WebSockets
- **DB:** Postgres via Neon serverless driver, Drizzle ORM
- **Auth:** NextAuth v5 with email magic-link + Google OAuth
- **Realtime:** native `ws` library on Node (NOT Socket.IO — keep deps lean)
- **AI SDKs:** `@anthropic-ai/sdk`, `openai`, `@google/genai`, plus `chess.js` for board logic
- **Hosting target:** Vercel for the Next.js app, Fly.io (or Railway) for the WebSocket runtime, Neon for Postgres

## Why this hosting split

The Next.js app is read-heavy CRUD — Vercel is the obvious fit. The runtime is long-lived WebSocket connections plus stateful match objects in memory — that needs a real Node process, not serverless. Fly.io and Railway both give you that for ~$5/mo. Neon is serverless Postgres with a free tier that's enough for development.

You can collapse all of this onto a single VPS (Hetzner, DigitalOcean) later for cost. For now, this split is the lowest-friction path to a deployed product.

## Non-negotiables

1. **API keys are sacred.** Encrypt at rest with per-user derived keys (KEK/DEK pattern, not a single shared master key). Never log key material. Decrypt only inside the request handler that uses the key, then drop it from memory.
2. **The referee is the source of truth.** Models propose moves. The server validates and applies. Never trust a model to track game state — they will hallucinate.
3. **Token budgets matter.** Each tank tick costs 2 API calls. A 60-tick match = 120 calls. Cap tick rate at 2/sec, max 90 ticks per match, hard timeout at 3 min.
4. **Mode-separated ELO.** Don't pool tank/chess/essay into one rating. Compute three ELOs, then a weighted composite for the leaderboard headline number.
5. **Demo mode runs without API keys.** Replays canned matches from the DB. Critical for the landing page conversion funnel.
6. **Brand voice is "cyberpunk arcade."** Dark backgrounds, magenta/cyan/lime accents, Press Start 2P / VT323 / JetBrains Mono fonts. Don't drift toward generic SaaS.

## Repo layout

This is a monorepo with two deployable units. Use npm workspaces (or pnpm if you prefer) — keep it simple, no Turborepo unless we hit a real need.

```
arena/
├── apps/
│   ├── web/                          # Next.js app → Vercel
│   │   ├── app/
│   │   │   ├── (marketing)/          # Landing
│   │   │   ├── (auth)/               # Sign in / up
│   │   │   ├── (app)/                # Logged-in shell
│   │   │   │   ├── playground/
│   │   │   │   ├── leaderboard/
│   │   │   │   └── settings/
│   │   │   └── api/                  # REST endpoints
│   │   ├── components/
│   │   │   ├── arena/                # TankCanvas, ChessBoard, EssayCompare
│   │   │   ├── ui/                   # Buttons, panels, etc.
│   │   │   └── shell/
│   │   ├── public/
│   │   │   └── sprites/              # Tank sprites
│   │   └── package.json
│   └── runtime/                      # Node WebSocket service → Fly.io
│       ├── src/
│       │   ├── server.ts             # ws server entry
│       │   ├── modes/
│       │   │   ├── tank.ts
│       │   │   ├── chess.ts
│       │   │   └── essay.ts
│       │   └── referee/
│       ├── Dockerfile
│       └── package.json
├── packages/
│   ├── db/                           # Drizzle schema + client (shared)
│   │   ├── schema.ts
│   │   ├── client.ts
│   │   └── package.json
│   ├── providers/                    # Unified AI SDK wrapper (shared)
│   │   ├── anthropic.ts
│   │   ├── openai.ts
│   │   ├── google.ts
│   │   ├── index.ts                  # call() unified interface
│   │   └── package.json
│   └── lib/                          # crypto, elo, types (shared)
│       ├── crypto.ts
│       ├── elo.ts
│       ├── types.ts
│       └── package.json
├── CLAUDE.md                         # ← this file
├── SPEC.md                           # Full product spec
├── PROTOCOLS.md                      # Model I/O contracts per mode
├── package.json                      # workspace root
└── tsconfig.base.json
```

## How to think about new features

- **Always ship the referee first.** Mode logic without AI is a normal game. Mode logic *with* AI is a normal game where one or both players are the AI. Build the referee + a "human player" or "scripted player" first, prove it works, then plug in API calls.
- **Stream don't poll.** Match state goes over WebSocket as JSON patches. The frontend never calls `/api/match/123/state`. If you find yourself doing that, stop.
- **Cost guard before features.** Every new mode or capability gets a token-budget estimate before code. If a feature would cost >$0.10 per match at p50, redesign it.
- **Mobile is later.** Desktop-first. Responsive only for the marketing pages. The arenas are 1024px+ minimum.
- **Shared code goes in `packages/`.** App code goes in `apps/`. If you're tempted to duplicate a type or util across `apps/web` and `apps/runtime`, hoist it into `packages/lib` instead.

## Working in VS Code with Claude Code

- Two terminals: `npm run dev --workspace web` and `npm run dev --workspace runtime`. Both must be running together. Or use a single `npm run dev` script at the root that runs them concurrently with `concurrently`.
- Tests live next to source as `*.test.ts`. Run with `npm test` (uses Vitest). New referees must have referee tests with adversarial / illegal-move cases.
- Migrations: `npm run db:generate` then `npm run db:migrate`. Don't hand-edit migration files.
- Before opening a PR, run `npm run check` (tsc + eslint + tests across all workspaces).
- Secrets in `.env.local` files (one per app) for dev, hosting platform's secret store for prod. Never commit either. The repo has a `.env.example` per app.
- If you're about to add a new dependency, check if we already have something that does the job. Lean deps.
- Don't install anything global. Everything goes through workspace `package.json` files.

## What's already done (as of handoff)

- Visual prototype in `prototype/ai_arena_prototype.jsx` — single-file React, mock data, demo animations for tank and chess. **This is your design source of truth.** Match its aesthetic and IA exactly. The components are already organized close to how they should be split when broken apart into `apps/web/components/`.
- This document, plus `SPEC.md` and `PROTOCOLS.md`.

## What's not done

Everything else. See `SPEC.md` for the build order I'd suggest.

## Things that will trip you up

- WebSocket connections behind any reverse proxy (Cloudflare, Vercel, Fly's edge) need keepalive pings every ~25s or they get culled. Build that in from day one.
- Anthropic and OpenAI return tool-use blocks differently. The unified `call()` wrapper in `packages/providers/index.ts` exists so the rest of the codebase doesn't care.
- `chess.js` notation parsing rejects ambiguous moves silently — always pass full SAN, not casual notation, when feeding model output back to validation.
- Don't use `localStorage` for API keys, ever, even in dev. Server-only.
- Vercel functions have a 10s timeout on the Hobby plan, 60s on Pro. The runtime workspace exists *because* of this — long matches must not run inside Vercel functions.
- Neon's free tier sleeps the database after 5 min of inactivity. First request after sleep takes ~2s to wake. Plan for this in your loading states.

## How to drive Claude Code on this project

- Work phase by phase from `SPEC.md`. Don't ask for "everything." Ask for "Phase 0."
- Reference `PROTOCOLS.md` by section name when implementing referees: "Implement the tank referee following PROTOCOLS.md Section 'Mode 1.'"
- Review and commit between phases. Don't let work pile up uncommitted.
- The prototype file is frozen reference. Don't modify it.
- Use Claude Code's planning mode for anything spanning more than two files.
