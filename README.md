# How to hand off to Claude Code (VS Code workflow)

This folder contains everything Claude Code needs to take Arena.ai from prototype to product. You're running Claude Code locally inside VS Code — no Replit, no cloud IDE. Just your machine, git, and a deploy target you control.

## Files in this package

| File | Purpose |
|------|---------|
| `CLAUDE.md` | Project context. **Drop this at the root of your repo.** Claude Code reads it automatically on every session. |
| `SPEC.md` | Full product spec with phased build order, schema, success metrics. |
| `PROTOCOLS.md` | Exact JSON contracts for what gets sent to/from each model in each mode. |
| `ai_arena_prototype.jsx` | The visual prototype — design source of truth. Drop into `prototype/` in your repo. |
| Below | Setup steps + the kickoff prompt to paste as your first Claude Code message. |

## Step-by-step setup

### 1. Install Claude Code

Open VS Code's terminal:

```bash
npm install -g @anthropic-ai/claude-code
```

Confirm it's installed:

```bash
claude --version
```

If you don't have Node.js yet: install Node 20+ from nodejs.org first.

### 2. Authenticate

In your terminal, run:

```bash
claude
```

It will walk you through OAuth. You sign in with your Anthropic account. The CLI stores credentials in your OS keychain.

### 3. Create the repo

```bash
mkdir arena && cd arena
git init
mkdir prototype
```

Drop these files into the repo:
- `CLAUDE.md` → repo root
- `SPEC.md` → repo root
- `PROTOCOLS.md` → repo root
- `ai_arena_prototype.jsx` → `prototype/ai_arena_prototype.jsx`

Create a `.gitignore`:

```
node_modules
.next
dist
.env*
!.env.example
.DS_Store
.vscode/
*.log
```

Commit:

```bash
git add . && git commit -m "Initial handoff docs and prototype"
```

Push to GitHub if you want — not required for Claude Code to work, but you'll want it eventually for deploys.

### 4. Open in VS Code, start Claude Code

```bash
code .
```

In VS Code's integrated terminal:

```bash
claude
```

You're now in an interactive Claude Code session. The CLI sees your whole repo and reads `CLAUDE.md` automatically.

### 5. Drop in the kickoff prompt

Paste the prompt below as your first message. This bootstraps the session correctly — it forces a summary back before any code is written, which catches misunderstandings cheaply.

---

## Kickoff prompt (copy-paste this)

```
We're building Arena.ai, an AI model benchmark platform. The full context is
in CLAUDE.md, SPEC.md, and PROTOCOLS.md at the repo root. The visual
prototype is at prototype/ai_arena_prototype.jsx — that's the design source
of truth, do not modify it.

I'm developing locally in VS Code on macOS/Linux/Windows (your environment).
We deploy the Next.js app to Vercel and the WebSocket runtime to Fly.io,
with Postgres on Neon. Hosting accounts: I'll create them when we hit Phase 0
deploy step.

Read all four of those files (the three docs plus the prototype), then
summarize back to me:
1. What the product is in two sentences
2. What's already done vs. what we're building
3. What Phase 0 deliverables are, in order
4. Any questions or risks you want resolved before we start coding

Once I confirm your summary, we'll start Phase 0 step by step. Don't write
any code until I confirm.
```

---

## How to drive Claude Code well

### Work phase by phase

`SPEC.md` has 5 phases. Each has a clear "done when…" condition. After kickoff, do this:

```
Let's do Phase 0. Start with monorepo init and TypeScript setup.
Stop after that step so I can review.
```

Don't say "build everything." Don't say "start Phase 0 and Phase 1." One step at a time.

### Use planning mode for anything multi-file

For changes that touch more than two files, ask Claude Code to plan first:

```
Plan the Phase 1 essay engine. Don't write code yet. Show me the file
list, the data flow, and the test cases.
```

You review the plan, edit it, then say "go."

### Commit between phases

After each phase done condition is hit:

```
Run npm run check. If it passes, stage everything and write a commit
message summarizing what we did in Phase 0.
```

Then *you* run `git commit` and `git push`. Don't let Claude Code rack up untracked work.

### When it drifts on aesthetics

Frontend code will drift toward generic Tailwind defaults if you don't push back. When it does:

```
Stop. Look at prototype/ai_arena_prototype.jsx — the cyberpunk arcade
look (magenta/cyan/lime, Press Start 2P headers, scanlines, clip-corner
panels). Match that. Show me the diff.
```

### When it wants to install something

Push back on dependency creep:

```
Why do we need this dependency? What do we already have that could do
this job?
```

If the answer is "nothing," fine. If there's an existing tool, use that.

### When you hit a wall

Two escape hatches:

1. `/clear` — wipes the session context. Useful when conversation has gotten too long and Claude Code is confused. The repo state is preserved; just the chat history resets.
2. `/compact` — keeps a summary of context but drops the verbatim history. Halfway between continue and clear.

### Useful CLI slash commands

| Command | What it does |
|---------|--------------|
| `/clear` | Reset conversation, keep file state |
| `/compact` | Summarize and continue |
| `/help` | Show all commands |
| `/cost` | Show token usage so far this session |
| `/init` | Generate a fresh CLAUDE.md (don't run this — yours is already curated) |

## What Claude Code is great at on this project

- Scaffolding the monorepo from zero (workspaces, tsconfig refs, scripts)
- Writing the chess referee + tests (well-trodden ground, lots of training data)
- Implementing the unified provider wrapper (`packages/providers/index.ts`)
- Building the database schema and Drizzle migrations
- Wiring WebSockets between the runtime service and the Next.js client
- Porting the prototype's components into proper Next.js routes
- Writing Vitest tests for referees with adversarial cases

## What you'll need to babysit

- **Token cost discipline.** It will happily make a feature that calls an API 200 times per match. Always check the math against the cost guardrails in SPEC.md.
- **Brand voice.** Without reminders, frontend code drifts toward generic SaaS Tailwind. The cyberpunk arcade aesthetic in the prototype is the target — point at it explicitly.
- **The tank engine.** It's the most novel work. Expect to iterate the prompt and tool schema 4–5 times before it produces watchable matches. This is where the product is won or lost.
- **WebSocket details.** Keepalive pings, reconnection logic, message ordering. Easy to get wrong, easy to forget.

## A reasonable first day

Realistic plan for your first session:

1. Setup steps 1–4 above (~20 min)
2. Paste kickoff prompt, get summary back (~5 min)
3. Approve summary, do Phase 0 step 1: monorepo init (~30 min)
4. Phase 0 step 2: Next.js app scaffold + landing page port (~45 min)
5. Phase 0 step 3: runtime service skeleton (~20 min)
6. Phase 0 step 4: crypto utility + tests (~30 min)
7. Commit and stop for the day

That's about 2.5 hours of active driving. Phase 0 in one sitting if you want, but you'll do better work split over two.

## Configuration tip: a `.claude/` directory

You can drop project-specific Claude Code settings in `.claude/settings.json` at the repo root. Useful for:

- Auto-allowing certain commands (e.g. `npm run *`, `git status`) without prompting
- Setting per-project model preferences

Don't bother with this until you've done a few sessions and you know what you're tired of approving.

## When you're stuck

If a session goes off the rails:

1. `/clear` and start fresh, pointing back at `CLAUDE.md`
2. If a feature is genuinely hard, ask Claude Code to write a focused doc about *just that problem* in `docs/` first, then implement
3. If you're burning tokens and not making progress, stop. Walk away. Come back with a sharper question.

The goal is a shipped product, not a flawless session log.
