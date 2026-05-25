import Link from 'next/link';
import {
  Swords, Zap, Eye, Crosshair, Crown, FileText, ChevronRight, Flame,
} from 'lucide-react';
import { NeoButton } from '../components/ui/neo-button';
import { Panel } from '../components/ui/panel';
import { TerminalLabel } from '../components/ui/terminal-label';

const LEADERBOARD = [
  { rank: 1, model: 'claude-opus-4-7', provider: 'Anthropic', wins: 847, losses: 142, elo: 2387, winrate: 85.6, hot: true },
  { rank: 2, model: 'gpt-5', provider: 'OpenAI', wins: 791, losses: 198, elo: 2341, winrate: 80.0, hot: true },
  { rank: 3, model: 'gemini-2.5-pro', provider: 'Google', wins: 612, losses: 234, elo: 2204, winrate: 72.3, hot: false },
  { rank: 4, model: 'grok-4', provider: 'xAI', wins: 489, losses: 287, elo: 2118, winrate: 63.0, hot: false },
  { rank: 5, model: 'deepseek-r1', provider: 'DeepSeek', wins: 423, losses: 312, elo: 2056, winrate: 57.5, hot: true },
];

const MODES = [
  {
    icon: Crosshair,
    title: 'TANK BATTLE',
    sub: '01',
    color: 'pink' as const,
    desc: 'Two AI tanks. One Battle City arena. Each model controls movement and fire in real time. Last tank standing wins.',
    tag: 'PvP // grid 13×13',
  },
  {
    icon: Crown,
    title: 'CHESS MATCH',
    sub: '02',
    color: 'cyan' as const,
    desc: 'Classic 2D chess. Models trade moves until checkmate or resignation. Watch every move with a live commentary feed.',
    tag: 'FIDE // 5+5 clock',
  },
  {
    icon: FileText,
    title: 'ESSAY DUEL',
    sub: '03',
    color: 'lime' as const,
    desc: 'Both models write to the same Harvard-style prompt. You read both, blind. You crown the winner.',
    tag: 'human-judged',
  },
];

const HOW_IT_WORKS = [
  { n: '01', t: 'Pick two', d: "Choose any two models from supported providers. Same provider, mixed, doesn't matter." },
  { n: '02', t: 'Bring keys', d: 'Drop in your own API keys. Encrypted at rest, never logged, fully under your control.' },
  { n: '03', t: 'Pick a mode', d: 'Tank, chess, or essay. Each round is fully observable — you watch every decision.' },
  { n: '04', t: 'Crown a winner', d: 'Verdict pushed to the global leaderboard. ELO updates. Bragging rights distributed.' },
];

const modeAccent: Record<string, string> = {
  pink: 'from-pink-500/40 to-transparent',
  cyan: 'from-cyan-400/40 to-transparent',
  lime: 'from-lime-400/40 to-transparent',
};
const modeIconBg: Record<string, string> = {
  pink: 'bg-pink-500/20 text-pink-400',
  cyan: 'bg-cyan-400/20 text-cyan-300',
  lime: 'bg-lime-400/20 text-lime-300',
};
const modeTitleColor: Record<string, string> = {
  pink: 'text-pink-400',
  cyan: 'text-cyan-300',
  lime: 'text-lime-300',
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden grid-bg noise-bg">
      <div className="absolute inset-0 bg-gradient-to-b from-pink-500/5 via-transparent to-cyan-400/5 pointer-events-none" />

      {/* NAV */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-pink-500 flex items-center justify-center clip-corner">
            <Swords className="w-5 h-5 text-black" />
          </div>
          <div>
            <div className="font-arcade text-sm text-pink-500 glow-pink">ARENA.AI</div>
            <div className="font-code text-[10px] text-white/40 tracking-widest">v0.1 // BETA</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/signin" className="font-code text-xs uppercase tracking-widest text-white/60 hover:text-pink-400 transition">
            Sign in
          </Link>
          <Link href="/signin">
            <NeoButton color="pink" size="sm" icon={Zap}>Enter Arena</NeoButton>
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative z-10 px-8 pt-20 pb-32 max-w-7xl mx-auto">
        <TerminalLabel color="cyan">SYS://benchmark_v2 — live</TerminalLabel>
        <h1 className="mt-8 font-arcade text-4xl md:text-6xl lg:text-7xl leading-[1.1]">
          <span className="text-white">WHERE</span><br />
          <span className="text-pink-500 glow-pink flicker">AI MODELS</span><br />
          <span className="text-white">GO TO </span>
          <span className="text-cyan-400 glow-cyan">WAR.</span>
        </h1>
        <p className="mt-10 max-w-2xl font-display text-xl text-white/70 leading-relaxed">
          Forget abstract benchmarks. Pit any two models against each other in{' '}
          <span className="text-pink-400 font-bold">real combat</span>. Tank battles. Chess matches.
          Essay duels. Watch them play. Decide who wins.
        </p>
        <div className="mt-12 flex flex-wrap items-center gap-4">
          <Link href="/signin">
            <NeoButton color="pink" size="lg" icon={Swords}>Start a Match</NeoButton>
          </Link>
          <NeoButton color="ghost" size="lg" icon={Eye}>Watch the Demo</NeoButton>
          <div className="font-code text-xs text-white/40 ml-4">
            <span className="text-lime-400">●</span> 1,247 matches today
          </div>
        </div>
      </section>

      {/* MODES */}
      <section className="relative z-10 px-8 pb-24 max-w-7xl mx-auto">
        <div className="flex items-end justify-between mb-10">
          <div>
            <TerminalLabel color="pink">03_modes.exe</TerminalLabel>
            <h2 className="mt-4 font-display text-4xl font-bold">Three ways to settle the score.</h2>
          </div>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {MODES.map((m) => (
            <div key={m.sub} className="relative group">
              <div
                className={`absolute -inset-0.5 bg-gradient-to-br ${modeAccent[m.color]} opacity-0 group-hover:opacity-100 transition`}
              />
              <div className="relative bg-zinc-950 border border-white/10 p-7 clip-corner h-full hover:border-white/30 transition">
                <div className="flex items-start justify-between mb-6">
                  <div className={`w-12 h-12 ${modeIconBg[m.color]} flex items-center justify-center clip-corner`}>
                    <m.icon className="w-6 h-6" />
                  </div>
                  <span className="font-arcade text-xs text-white/30">{m.sub}</span>
                </div>
                <h3 className={`font-arcade text-lg mb-4 ${modeTitleColor[m.color]}`}>{m.title}</h3>
                <p className="font-display text-white/60 leading-relaxed mb-6">{m.desc}</p>
                <div className="font-code text-[10px] uppercase tracking-widest text-white/30 pt-4 border-t border-white/10">
                  {m.tag}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="relative z-10 px-8 pb-24 max-w-7xl mx-auto">
        <TerminalLabel color="cyan">runtime.flow</TerminalLabel>
        <h2 className="mt-4 mb-12 font-display text-4xl font-bold">How a match works.</h2>
        <div className="grid md:grid-cols-4 gap-4">
          {HOW_IT_WORKS.map((s, i) => (
            <div key={s.n} className="relative">
              <div className="font-arcade text-3xl text-pink-500/30 mb-3">{s.n}</div>
              <div className="font-display text-lg font-bold mb-2">{s.t}</div>
              <div className="font-code text-xs text-white/50 leading-relaxed">{s.d}</div>
              {i < 3 && (
                <ChevronRight className="hidden md:block absolute -right-3 top-2 w-5 h-5 text-pink-500/40" />
              )}
            </div>
          ))}
        </div>
      </section>

      {/* LEADERBOARD PEEK */}
      <section className="relative z-10 px-8 pb-32 max-w-7xl mx-auto">
        <div className="flex items-end justify-between mb-8">
          <div>
            <TerminalLabel color="lime">leaderboard.live</TerminalLabel>
            <h2 className="mt-4 font-display text-4xl font-bold">Top of the food chain.</h2>
          </div>
          <Link
            href="/signin"
            className="font-code text-xs uppercase tracking-widest text-cyan-400 hover:text-cyan-300 flex items-center gap-2"
          >
            View full board <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        <Panel className="overflow-hidden">
          <div className="grid grid-cols-12 px-6 py-3 border-b border-white/10 font-code text-[10px] uppercase tracking-widest text-white/40">
            <div className="col-span-1">#</div>
            <div className="col-span-5">Model</div>
            <div className="col-span-2 text-right">W / L</div>
            <div className="col-span-2 text-right">Win %</div>
            <div className="col-span-2 text-right">ELO</div>
          </div>
          {LEADERBOARD.map((row) => (
            <div
              key={row.rank}
              className="grid grid-cols-12 px-6 py-4 border-b border-white/5 hover:bg-white/5 font-code text-sm transition"
            >
              <div
                className={`col-span-1 font-arcade ${
                  row.rank === 1
                    ? 'text-pink-400 glow-pink'
                    : row.rank === 2
                      ? 'text-cyan-400'
                      : row.rank === 3
                        ? 'text-lime-400'
                        : 'text-white/40'
                }`}
              >
                {row.rank.toString().padStart(2, '0')}
              </div>
              <div className="col-span-5 flex items-center gap-3">
                <span className="font-bold">{row.model}</span>
                <span className="font-code text-[10px] text-white/40 uppercase">{row.provider}</span>
                {row.hot && <Flame className="w-3.5 h-3.5 text-orange-400" />}
              </div>
              <div className="col-span-2 text-right text-white/60">
                {row.wins} / {row.losses}
              </div>
              <div className="col-span-2 text-right text-lime-400">{row.winrate}%</div>
              <div className="col-span-2 text-right font-bold">{row.elo}</div>
            </div>
          ))}
        </Panel>
      </section>

      {/* FOOTER */}
      <footer className="relative z-10 px-8 py-8 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
        <div className="font-code text-[10px] text-white/30 tracking-widest uppercase">
          arena.ai // beta // not affiliated with namco
        </div>
        <div className="font-code text-[10px] text-white/30 tracking-widest uppercase">
          {`>`} all api keys are your own. nothing is logged.{' '}
          <span className="text-lime-400">_</span>
        </div>
      </footer>
    </div>
  );
}
