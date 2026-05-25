import React, { useState, useEffect, useRef } from 'react';
import {
  Swords, Trophy, FileText, Settings as SettingsIcon, Eye, Plus, Key,
  ChevronRight, Crown, Cpu, Zap, Shield, ArrowLeft, Check, X, Play,
  Pause, RotateCcw, Brain, Crosshair, Award, Target, LogOut, BarChart3,
  Sparkles, Lock, User, Mail, Flame, Heart, Skull, Joystick
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════════
// CONSTANTS & MOCK DATA
// ═══════════════════════════════════════════════════════════════════

const PROVIDERS = [
  { id: 'anthropic', name: 'Anthropic', models: ['claude-opus-4-7', 'claude-opus-4-6', 'claude-sonnet-4-6', 'claude-haiku-4-5'] },
  { id: 'openai', name: 'OpenAI', models: ['gpt-5', 'gpt-5-mini', 'gpt-4o', 'o3'] },
  { id: 'google', name: 'Google', models: ['gemini-2.5-pro', 'gemini-2.5-flash', 'gemini-2.0-flash'] },
  { id: 'xai', name: 'xAI', models: ['grok-4', 'grok-3'] },
  { id: 'deepseek', name: 'DeepSeek', models: ['deepseek-r1', 'deepseek-v3'] },
  { id: 'meta', name: 'Meta', models: ['llama-4-405b', 'llama-3.3-70b'] },
];

const LEADERBOARD = [
  { rank: 1, model: 'claude-opus-4-7', provider: 'Anthropic', wins: 847, losses: 142, elo: 2387, winrate: 85.6, hot: true },
  { rank: 2, model: 'gpt-5', provider: 'OpenAI', wins: 791, losses: 198, elo: 2341, winrate: 80.0, hot: true },
  { rank: 3, model: 'gemini-2.5-pro', provider: 'Google', wins: 612, losses: 234, elo: 2204, winrate: 72.3, hot: false },
  { rank: 4, model: 'grok-4', provider: 'xAI', wins: 489, losses: 287, elo: 2118, winrate: 63.0, hot: false },
  { rank: 5, model: 'deepseek-r1', provider: 'DeepSeek', wins: 423, losses: 312, elo: 2056, winrate: 57.5, hot: true },
  { rank: 6, model: 'claude-sonnet-4-6', provider: 'Anthropic', wins: 367, losses: 281, elo: 1987, winrate: 56.6, hot: false },
  { rank: 7, model: 'gpt-5-mini', provider: 'OpenAI', wins: 298, losses: 312, elo: 1876, winrate: 48.9, hot: false },
  { rank: 8, model: 'llama-4-405b', provider: 'Meta', wins: 234, losses: 289, elo: 1812, winrate: 44.7, hot: false },
];

const ESSAY_PROMPT = "Argue whether Large Language Models constitute a paradigm shift in human knowledge work, or merely an incremental advance over prior automation. Defend your position with reference to historical precedents and economic theory.";

const ESSAY_A = `The framing of LLMs as either "paradigm shift" or "incremental advance" presents a false dichotomy. A more rigorous analysis reveals that they represent a categorical shift in the locus of cognitive labor itself — a development unprecedented in economic history.

Consider the historical sequence: the steam engine displaced muscular labor; the assembly line decomposed skilled craft into routine tasks; computation digitized clerical work. Each transition automated discrete categories of effort. Yet none of these technologies engaged in the recursive symbolic manipulation that defines knowledge work proper.

LLMs are different in kind, not degree. They participate in the production of meaning rather than merely its transmission. Where the printing press accelerated distribution of fixed text, LLMs generate novel text continuously, indexed to contextual demand. This is closer to Schumpeterian "creative destruction" applied not to industries but to epistemic processes themselves.

The economic implication follows: marginal cost of cognitive output approaches zero, while the value of taste, judgment, and verification rises asymmetrically. We are witnessing the unbundling of knowledge work into its constituent operations — generation, curation, validation — with the first becoming abundant and the latter two becoming the new bottlenecks.

This is paradigmatic. Not because LLMs are sentient, but because they reorganize the economic geography of thought.`;

const ESSAY_B = `Large Language Models represent a significant but ultimately incremental advance in the broader trajectory of automation. While their capabilities are impressive, the rhetoric of "paradigm shift" obscures more than it illuminates.

The historical record cautions against such claims. The personal computer, the internet, mobile telephony — each was hailed as paradigm-shifting, and each integrated into existing economic structures with significant but bounded effects. Productivity gains materialized over decades, not years, and labor markets adapted through reallocation rather than collapse.

LLMs fit this pattern. They automate certain forms of text generation and pattern recognition, but they do not exhibit understanding in any robust sense. They are stochastic parrots — sophisticated, useful, but ultimately interpolative rather than generative of genuinely new knowledge. The economic literature on general-purpose technologies (Bresnahan and Trajtenberg, 1995) suggests that transformative effects depend on complementary innovations and institutional adaptation, processes that unfold over generations.

Furthermore, the marginal cost argument elides the substantial fixed costs of training, infrastructure, and human oversight required to deploy LLMs reliably. The "abundance of cognition" thesis confuses output volume with epistemic value.

The honest assessment: LLMs are a powerful new tool. They are not the discontinuity their proponents claim.`;

// ═══════════════════════════════════════════════════════════════════
// CUSTOM STYLES
// ═══════════════════════════════════════════════════════════════════

const CUSTOM_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&family=VT323&family=JetBrains+Mono:wght@400;500;700&family=Space+Grotesk:wght@500;700&display=swap');
  
  .font-arcade { font-family: 'Press Start 2P', 'Courier New', monospace; letter-spacing: 0.05em; }
  .font-terminal { font-family: 'VT323', 'Courier New', monospace; }
  .font-code { font-family: 'JetBrains Mono', 'Menlo', monospace; }
  .font-display { font-family: 'Space Grotesk', sans-serif; }
  
  .glow-pink { text-shadow: 0 0 8px rgba(236, 72, 153, 0.8), 0 0 16px rgba(236, 72, 153, 0.5); }
  .glow-cyan { text-shadow: 0 0 8px rgba(34, 211, 238, 0.8), 0 0 16px rgba(34, 211, 238, 0.5); }
  .glow-lime { text-shadow: 0 0 8px rgba(163, 230, 53, 0.8), 0 0 16px rgba(163, 230, 53, 0.5); }
  
  .glow-box-pink { box-shadow: 0 0 20px rgba(236, 72, 153, 0.5), inset 0 0 20px rgba(236, 72, 153, 0.1); }
  .glow-box-cyan { box-shadow: 0 0 20px rgba(34, 211, 238, 0.5), inset 0 0 20px rgba(34, 211, 238, 0.1); }
  
  .scanlines::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0; bottom: 0;
    background: repeating-linear-gradient(
      0deg,
      rgba(0, 0, 0, 0) 0px,
      rgba(0, 0, 0, 0) 2px,
      rgba(0, 0, 0, 0.15) 3px,
      rgba(0, 0, 0, 0.15) 3px
    );
    pointer-events: none;
    z-index: 1;
  }
  
  .grid-bg {
    background-image: 
      linear-gradient(rgba(236, 72, 153, 0.05) 1px, transparent 1px),
      linear-gradient(90deg, rgba(34, 211, 238, 0.05) 1px, transparent 1px);
    background-size: 40px 40px;
  }
  
  .noise-bg {
    background-image: 
      radial-gradient(circle at 20% 30%, rgba(236, 72, 153, 0.08), transparent 40%),
      radial-gradient(circle at 80% 70%, rgba(34, 211, 238, 0.08), transparent 40%),
      radial-gradient(circle at 50% 50%, rgba(163, 230, 53, 0.04), transparent 50%);
  }
  
  @keyframes flicker {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.92; }
    52% { opacity: 1; }
    54% { opacity: 0.95; }
  }
  .flicker { animation: flicker 4s infinite; }
  
  @keyframes pulse-glow {
    0%, 100% { box-shadow: 0 0 20px rgba(236, 72, 153, 0.4); }
    50% { box-shadow: 0 0 40px rgba(236, 72, 153, 0.8), 0 0 60px rgba(236, 72, 153, 0.3); }
  }
  .pulse-glow-pink { animation: pulse-glow 2s ease-in-out infinite; }
  
  @keyframes pulse-glow-c {
    0%, 100% { box-shadow: 0 0 20px rgba(34, 211, 238, 0.4); }
    50% { box-shadow: 0 0 40px rgba(34, 211, 238, 0.8), 0 0 60px rgba(34, 211, 238, 0.3); }
  }
  .pulse-glow-cyan { animation: pulse-glow-c 2s ease-in-out infinite; }
  
  @keyframes blink { 50% { opacity: 0; } }
  .blink { animation: blink 1s step-end infinite; }
  
  @keyframes bullet-fly {
    from { transform: translateX(0); }
    to { transform: translateX(var(--dx)); }
  }
  
  @keyframes piece-move {
    0% { transform: translate(0, 0) scale(1); }
    50% { transform: translate(var(--mx, 50%), var(--my, 50%)) scale(1.15); }
    100% { transform: translate(var(--mx, 100%), var(--my, 100%)) scale(1); }
  }
  
  .clip-corner {
    clip-path: polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px);
  }
  
  .clip-arrow {
    clip-path: polygon(0 0, calc(100% - 12px) 0, 100% 50%, calc(100% - 12px) 100%, 0 100%);
  }
  
  .crt::after {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(ellipse at center, transparent 60%, rgba(0,0,0,0.4) 100%);
    pointer-events: none;
  }
`;

// ═══════════════════════════════════════════════════════════════════
// HELPER COMPONENTS
// ═══════════════════════════════════════════════════════════════════

const TerminalLabel = ({ children, color = 'pink' }) => {
  const colorClass = color === 'pink' ? 'text-pink-500 border-pink-500/40' : color === 'cyan' ? 'text-cyan-400 border-cyan-400/40' : 'text-lime-400 border-lime-400/40';
  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1 border ${colorClass} font-code text-[10px] uppercase tracking-widest`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current blink" />
      {children}
    </div>
  );
};

const NeoButton = ({ children, onClick, color = 'pink', size = 'md', icon: Icon, disabled }) => {
  const colors = {
    pink: 'bg-pink-500 hover:bg-pink-400 text-black border-pink-300 shadow-[0_0_20px_rgba(236,72,153,0.6)]',
    cyan: 'bg-cyan-400 hover:bg-cyan-300 text-black border-cyan-200 shadow-[0_0_20px_rgba(34,211,238,0.6)]',
    lime: 'bg-lime-400 hover:bg-lime-300 text-black border-lime-200 shadow-[0_0_20px_rgba(163,230,53,0.6)]',
    ghost: 'bg-transparent hover:bg-white/5 text-white border-white/30',
  };
  const sizes = { sm: 'px-3 py-1.5 text-xs', md: 'px-5 py-2.5 text-sm', lg: 'px-8 py-4 text-base' };
  return (
    <button onClick={onClick} disabled={disabled} className={`${colors[color]} ${sizes[size]} font-code font-bold uppercase tracking-widest border-2 transition-all duration-150 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 clip-corner`}>
      {Icon && <Icon className="w-4 h-4" />}
      {children}
    </button>
  );
};

const Panel = ({ children, color = 'white', className = '' }) => {
  const borderColor = color === 'pink' ? 'border-pink-500/30' : color === 'cyan' ? 'border-cyan-400/30' : 'border-white/10';
  return (
    <div className={`relative bg-zinc-950/80 border ${borderColor} backdrop-blur ${className}`}>
      {children}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════
// LANDING PAGE
// ═══════════════════════════════════════════════════════════════════

const Landing = ({ onGetStarted, onDemoMode }) => {
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
          <button onClick={onDemoMode} className="font-code text-xs uppercase tracking-widest text-white/60 hover:text-cyan-400 transition">Demo</button>
          <button onClick={onGetStarted} className="font-code text-xs uppercase tracking-widest text-white/60 hover:text-pink-400 transition">Sign in</button>
          <NeoButton onClick={onGetStarted} color="pink" size="sm" icon={Zap}>Enter Arena</NeoButton>
        </div>
      </nav>
      
      {/* HERO */}
      <section className="relative z-10 px-8 pt-20 pb-32 max-w-7xl mx-auto">
        <TerminalLabel color="cyan">SYS://benchmark_v2 — live</TerminalLabel>
        <h1 className="mt-8 font-arcade text-4xl md:text-6xl lg:text-7xl leading-[1.1]">
          <span className="text-white">WHERE</span><br/>
          <span className="text-pink-500 glow-pink flicker">AI MODELS</span><br/>
          <span className="text-white">GO TO </span>
          <span className="text-cyan-400 glow-cyan">WAR.</span>
        </h1>
        <p className="mt-10 max-w-2xl font-display text-xl text-white/70 leading-relaxed">
          Forget abstract benchmarks. Pit any two models — same provider, different providers, your wildcards — against each other in <span className="text-pink-400 font-bold">real combat</span>. Tank battles. Chess matches. Essay duels. Watch them play. Decide who wins.
        </p>
        <div className="mt-12 flex flex-wrap items-center gap-4">
          <NeoButton onClick={onGetStarted} color="pink" size="lg" icon={Swords}>Start a Match</NeoButton>
          <NeoButton onClick={onDemoMode} color="ghost" size="lg" icon={Eye}>Watch the Demo</NeoButton>
          <div className="font-code text-xs text-white/40 ml-4">
            <span className="text-lime-400">●</span> 1,247 matches today
          </div>
        </div>
      </section>
      
      {/* THE THREE MODES */}
      <section className="relative z-10 px-8 pb-24 max-w-7xl mx-auto">
        <div className="flex items-end justify-between mb-10">
          <div>
            <TerminalLabel color="pink">03_modes.exe</TerminalLabel>
            <h2 className="mt-4 font-display text-4xl font-bold">Three ways to settle the score.</h2>
          </div>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { icon: Crosshair, title: 'TANK BATTLE', sub: '01', color: 'pink', desc: 'Two AI tanks. One Battle City arena. Each model controls movement and fire in real time. Last tank standing wins.', tag: 'PvP // grid 13×13' },
            { icon: Crown, title: 'CHESS MATCH', sub: '02', color: 'cyan', desc: 'Classic 2D chess. Models trade moves until checkmate or resignation. Watch every move with a live commentary feed.', tag: 'FIDE // 60s clock' },
            { icon: FileText, title: 'ESSAY DUEL', sub: '03', color: 'lime', desc: 'Both models write to the same Harvard-style prompt. You read both, blind. You crown the winner.', tag: 'human-judged' },
          ].map((m, i) => (
            <div key={i} className="relative group">
              <div className={`absolute -inset-0.5 bg-gradient-to-br ${m.color === 'pink' ? 'from-pink-500/40 to-transparent' : m.color === 'cyan' ? 'from-cyan-400/40 to-transparent' : 'from-lime-400/40 to-transparent'} opacity-0 group-hover:opacity-100 transition`} />
              <div className="relative bg-zinc-950 border border-white/10 p-7 clip-corner h-full hover:border-white/30 transition">
                <div className="flex items-start justify-between mb-6">
                  <div className={`w-12 h-12 ${m.color === 'pink' ? 'bg-pink-500/20 text-pink-400' : m.color === 'cyan' ? 'bg-cyan-400/20 text-cyan-300' : 'bg-lime-400/20 text-lime-300'} flex items-center justify-center clip-corner`}>
                    <m.icon className="w-6 h-6" />
                  </div>
                  <span className="font-arcade text-xs text-white/30">{m.sub}</span>
                </div>
                <h3 className={`font-arcade text-lg mb-4 ${m.color === 'pink' ? 'text-pink-400' : m.color === 'cyan' ? 'text-cyan-300' : 'text-lime-300'}`}>{m.title}</h3>
                <p className="font-display text-white/60 leading-relaxed mb-6">{m.desc}</p>
                <div className="font-code text-[10px] uppercase tracking-widest text-white/30 pt-4 border-t border-white/10">{m.tag}</div>
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
          {[
            { n: '01', t: 'Pick two', d: 'Choose any two models from supported providers. Same provider, mixed, doesn\'t matter.' },
            { n: '02', t: 'Bring keys', d: 'Drop in your own API keys. Encrypted at rest, never logged, fully under your control.' },
            { n: '03', t: 'Pick a mode', d: 'Tank, chess, or essay. Each round is fully observable — you watch every decision.' },
            { n: '04', t: 'Crown a winner', d: 'Verdict pushed to the global leaderboard. ELO updates. Bragging rights distributed.' },
          ].map((s, i) => (
            <div key={i} className="relative">
              <div className="font-arcade text-3xl text-pink-500/30 mb-3">{s.n}</div>
              <div className="font-display text-lg font-bold mb-2">{s.t}</div>
              <div className="font-code text-xs text-white/50 leading-relaxed">{s.d}</div>
              {i < 3 && <ChevronRight className="hidden md:block absolute -right-3 top-2 w-5 h-5 text-pink-500/40" />}
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
          <button onClick={onGetStarted} className="font-code text-xs uppercase tracking-widest text-cyan-400 hover:text-cyan-300 flex items-center gap-2">
            View full board <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        <Panel className="overflow-hidden">
          <div className="grid grid-cols-12 px-6 py-3 border-b border-white/10 font-code text-[10px] uppercase tracking-widest text-white/40">
            <div className="col-span-1">#</div>
            <div className="col-span-5">Model</div>
            <div className="col-span-2 text-right">W / L</div>
            <div className="col-span-2 text-right">Win %</div>
            <div className="col-span-2 text-right">ELO</div>
          </div>
          {LEADERBOARD.slice(0, 5).map((row) => (
            <div key={row.rank} className="grid grid-cols-12 px-6 py-4 border-b border-white/5 hover:bg-white/5 font-code text-sm transition">
              <div className={`col-span-1 font-arcade ${row.rank === 1 ? 'text-pink-400 glow-pink' : row.rank === 2 ? 'text-cyan-400' : row.rank === 3 ? 'text-lime-400' : 'text-white/40'}`}>{row.rank.toString().padStart(2, '0')}</div>
              <div className="col-span-5 flex items-center gap-3">
                <span className="font-bold">{row.model}</span>
                <span className="font-code text-[10px] text-white/40 uppercase">{row.provider}</span>
                {row.hot && <Flame className="w-3.5 h-3.5 text-orange-400" />}
              </div>
              <div className="col-span-2 text-right text-white/60">{row.wins} / {row.losses}</div>
              <div className="col-span-2 text-right text-lime-400">{row.winrate}%</div>
              <div className="col-span-2 text-right font-bold">{row.elo}</div>
            </div>
          ))}
        </Panel>
      </section>
      
      {/* FOOTER */}
      <footer className="relative z-10 px-8 py-8 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
        <div className="font-code text-[10px] text-white/30 tracking-widest uppercase">
          arena.ai // built on replit // not affiliated with namco
        </div>
        <div className="font-code text-[10px] text-white/30 tracking-widest uppercase">
          {`>`} all api keys are your own. nothing is logged. <span className="text-lime-400">_</span>
        </div>
      </footer>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════
// AUTH
// ═══════════════════════════════════════════════════════════════════

const Auth = ({ onComplete, onBack }) => {
  const [mode, setMode] = useState('signup');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [pw, setPw] = useState('');
  
  const submit = () => {
    if (!email || !pw) return;
    onComplete({ email, name: name || email.split('@')[0] });
  };
  
  return (
    <div className="min-h-screen bg-black text-white grid-bg noise-bg flex items-center justify-center p-8 relative">
      <button onClick={onBack} className="absolute top-8 left-8 flex items-center gap-2 font-code text-xs uppercase tracking-widest text-white/40 hover:text-white">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>
      
      <div className="relative w-full max-w-md">
        <div className="absolute -inset-1 bg-gradient-to-br from-pink-500/30 to-cyan-400/30 blur-xl" />
        <Panel className="relative p-10 clip-corner">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-pink-500 flex items-center justify-center clip-corner">
              <Swords className="w-5 h-5 text-black" />
            </div>
            <div className="font-arcade text-sm text-pink-500 glow-pink">ARENA.AI</div>
          </div>
          
          <div className="flex border-b border-white/10 mb-8">
            <button onClick={() => setMode('signup')} className={`flex-1 pb-3 font-code text-xs uppercase tracking-widest transition ${mode === 'signup' ? 'text-pink-400 border-b-2 border-pink-400' : 'text-white/40'}`}>
              Create account
            </button>
            <button onClick={() => setMode('signin')} className={`flex-1 pb-3 font-code text-xs uppercase tracking-widest transition ${mode === 'signin' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-white/40'}`}>
              Sign in
            </button>
          </div>
          
          <div className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label className="block font-code text-[10px] uppercase tracking-widest text-white/60 mb-2">Handle</label>
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="player_one" className="w-full bg-black/60 border border-white/20 px-4 py-3 font-code text-sm focus:outline-none focus:border-pink-500 transition" />
              </div>
            )}
            <div>
              <label className="block font-code text-[10px] uppercase tracking-widest text-white/60 mb-2">Email</label>
              <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="you@domain.com" className="w-full bg-black/60 border border-white/20 px-4 py-3 font-code text-sm focus:outline-none focus:border-pink-500 transition" />
            </div>
            <div>
              <label className="block font-code text-[10px] uppercase tracking-widest text-white/60 mb-2">Password</label>
              <input value={pw} onChange={(e) => setPw(e.target.value)} type="password" placeholder="••••••••" className="w-full bg-black/60 border border-white/20 px-4 py-3 font-code text-sm focus:outline-none focus:border-pink-500 transition" />
            </div>
          </div>
          
          <div className="mt-8">
            <NeoButton onClick={submit} color="pink" size="lg" icon={Zap}>
              {mode === 'signup' ? 'Create & Enter' : 'Sign in'}
            </NeoButton>
          </div>
          
          <div className="mt-8 pt-6 border-t border-white/10 font-code text-[10px] text-white/40 leading-relaxed">
            <Lock className="w-3 h-3 inline mr-1" /> Sessions encrypted. No tracking. API keys never leave your account.
          </div>
        </Panel>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════
// MODEL SETUP
// ═══════════════════════════════════════════════════════════════════

const ModelSetup = ({ onComplete, onBack, initial }) => {
  const [a, setA] = useState(initial?.A || { provider: 'anthropic', model: 'claude-opus-4-7', key: '' });
  const [b, setB] = useState(initial?.B || { provider: 'openai', model: 'gpt-5', key: '' });
  
  const FighterCard = ({ label, color, fighter, setFighter, side }) => {
    const colorClass = color === 'pink' ? 'pink' : 'cyan';
    const provider = PROVIDERS.find(p => p.id === fighter.provider);
    return (
      <div className="relative">
        <div className={`absolute -inset-0.5 ${color === 'pink' ? 'bg-pink-500/40' : 'bg-cyan-400/40'} blur-md`} />
        <Panel color={colorClass} className="relative p-7 clip-corner">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className={`font-code text-[10px] uppercase tracking-widest ${color === 'pink' ? 'text-pink-400' : 'text-cyan-400'}`}>Fighter {side}</div>
              <div className="font-arcade text-xl mt-1">{label}</div>
            </div>
            <div className={`w-14 h-14 ${color === 'pink' ? 'bg-pink-500' : 'bg-cyan-400'} flex items-center justify-center clip-corner`}>
              {color === 'pink' ? <Crosshair className="w-7 h-7 text-black" /> : <Target className="w-7 h-7 text-black" />}
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block font-code text-[10px] uppercase tracking-widest text-white/60 mb-2">Provider</label>
              <select value={fighter.provider} onChange={(e) => {
                const newProv = PROVIDERS.find(p => p.id === e.target.value);
                setFighter({ ...fighter, provider: e.target.value, model: newProv.models[0] });
              }} className="w-full bg-black border border-white/20 px-4 py-3 font-code text-sm focus:outline-none focus:border-white/50 transition">
                {PROVIDERS.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block font-code text-[10px] uppercase tracking-widest text-white/60 mb-2">Model</label>
              <select value={fighter.model} onChange={(e) => setFighter({ ...fighter, model: e.target.value })} className="w-full bg-black border border-white/20 px-4 py-3 font-code text-sm focus:outline-none focus:border-white/50 transition">
                {provider.models.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className="block font-code text-[10px] uppercase tracking-widest text-white/60 mb-2 flex items-center gap-2">
                <Key className="w-3 h-3" /> API Key
              </label>
              <input type="password" value={fighter.key} onChange={(e) => setFighter({ ...fighter, key: e.target.value })} placeholder="sk-..." className="w-full bg-black border border-white/20 px-4 py-3 font-code text-sm focus:outline-none focus:border-white/50 transition" />
            </div>
          </div>
        </Panel>
      </div>
    );
  };
  
  const ready = a.provider && a.model && a.key && b.provider && b.model && b.key;
  
  return (
    <div className="min-h-screen bg-black text-white grid-bg noise-bg p-8">
      <button onClick={onBack} className="flex items-center gap-2 font-code text-xs uppercase tracking-widest text-white/40 hover:text-white mb-8">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>
      
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <TerminalLabel color="pink">configure_match.exe</TerminalLabel>
          <h1 className="mt-6 font-arcade text-3xl md:text-4xl">SET YOUR FIGHTERS</h1>
          <p className="mt-4 font-display text-white/60 text-lg">Two models. Two keys. One arena.</p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <FighterCard label="ALPHA" color="pink" fighter={a} setFighter={setA} side="A" />
          <FighterCard label="OMEGA" color="cyan" fighter={b} setFighter={setB} side="B" />
        </div>
        
        <Panel className="p-5 clip-corner mb-8">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-lime-400 flex-shrink-0 mt-0.5" />
            <div className="font-code text-xs text-white/70 leading-relaxed">
              <span className="text-lime-400 font-bold">SECURITY //</span> Keys encrypted with AES-256 at rest, decrypted only inside ephemeral request handlers. Never written to logs, never shared with model providers beyond the call itself. Rotate any time from Settings.
            </div>
          </div>
        </Panel>
        
        <div className="flex justify-center">
          <NeoButton onClick={() => onComplete({ A: a, B: b })} color="pink" size="lg" icon={Swords} disabled={!ready}>
            {ready ? 'Lock In & Continue' : 'Fill all fields to continue'}
          </NeoButton>
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════
// SHELL (sidebar nav for logged-in screens)
// ═══════════════════════════════════════════════════════════════════

const Shell = ({ user, currentScreen, onNav, isDemo, children }) => {
  const navItems = [
    { id: 'hub', label: 'Playground', icon: Joystick },
    { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
    { id: 'settings', label: 'Settings', icon: SettingsIcon },
  ];
  return (
    <div className="min-h-screen bg-black text-white flex">
      <aside className="w-60 border-r border-white/10 bg-zinc-950 flex flex-col">
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-pink-500 flex items-center justify-center clip-corner">
              <Swords className="w-5 h-5 text-black" />
            </div>
            <div>
              <div className="font-arcade text-xs text-pink-500 glow-pink">ARENA</div>
              <div className="font-code text-[9px] text-white/40 tracking-widest">v0.1</div>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-3">
          {navItems.map(item => (
            <button key={item.id} onClick={() => onNav(item.id)} className={`w-full flex items-center gap-3 px-3 py-2.5 mb-1 font-code text-xs uppercase tracking-widest transition ${currentScreen === item.id || (currentScreen === 'tank' && item.id === 'hub') || (currentScreen === 'chess' && item.id === 'hub') || (currentScreen === 'essay' && item.id === 'hub') ? 'bg-pink-500/10 text-pink-400 border-l-2 border-pink-500' : 'text-white/50 hover:text-white hover:bg-white/5 border-l-2 border-transparent'}`}>
              <item.icon className="w-4 h-4" />
              {item.label}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 bg-cyan-400/20 border border-cyan-400/40 flex items-center justify-center font-arcade text-[10px] text-cyan-400">
              {(user?.name || 'U')[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-code text-xs truncate">{user?.name || 'guest'}</div>
              <div className="font-code text-[9px] text-white/40 truncate">{isDemo ? 'demo mode' : user?.email}</div>
            </div>
          </div>
          <button onClick={() => onNav('logout')} className="w-full flex items-center gap-2 px-3 py-2 text-white/40 hover:text-white font-code text-[10px] uppercase tracking-widest">
            <LogOut className="w-3 h-3" /> Sign out
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════
// PLAYGROUND HUB
// ═══════════════════════════════════════════════════════════════════

const PlaygroundHub = ({ models, onPick, isDemo }) => {
  const modes = [
    { id: 'tank', icon: Crosshair, title: 'Battle City Tank', sub: 'PvP combat', color: 'pink', desc: 'Real-time grid combat. Each AI controls a tank, navigates walls, fires shells. Last tank running wins the match.', diff: 'spatial // tactical' },
    { id: 'chess', icon: Crown, title: 'Chess Match', sub: 'Classical', color: 'cyan', desc: 'Models trade FEN states and respond with algebraic moves. Watch the full game with live evaluation bar.', diff: 'symbolic // long horizon' },
    { id: 'essay', icon: FileText, title: 'Essay Duel', sub: 'Human-judged', color: 'lime', desc: 'Both models write to a Harvard-style prompt. You read both blind, then crown your winner.', diff: 'rhetorical // qualitative' },
  ];
  
  return (
    <div className="p-10 grid-bg noise-bg min-h-screen">
      <div className="max-w-6xl mx-auto">
        <TerminalLabel color="pink">playground.exec</TerminalLabel>
        <h1 className="mt-6 font-arcade text-3xl md:text-4xl mb-2">CHOOSE YOUR BATTLEFIELD</h1>
        <p className="font-display text-white/60 text-lg mb-10">Three modes. Both fighters loaded. Pick your poison.</p>
        
        <Panel className="p-5 mb-8 clip-corner flex flex-wrap items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-pink-500 pulse-glow-pink rounded-full" />
            <div>
              <div className="font-code text-[10px] uppercase tracking-widest text-pink-400">Fighter A</div>
              <div className="font-code text-sm font-bold">{models?.A?.model || 'demo: claude-opus-4-7'}</div>
            </div>
          </div>
          <div className="font-arcade text-2xl text-white/30">VS</div>
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-cyan-400 pulse-glow-cyan rounded-full" />
            <div>
              <div className="font-code text-[10px] uppercase tracking-widest text-cyan-400">Fighter B</div>
              <div className="font-code text-sm font-bold">{models?.B?.model || 'demo: gpt-5'}</div>
            </div>
          </div>
          {isDemo && <div className="ml-auto px-3 py-1 bg-lime-400/10 border border-lime-400/40 font-code text-[10px] uppercase tracking-widest text-lime-400">demo mode</div>}
        </Panel>
        
        <div className="grid md:grid-cols-3 gap-6">
          {modes.map(m => (
            <button key={m.id} onClick={() => onPick(m.id)} className="text-left group">
              <Panel color={m.color} className={`p-7 clip-corner h-full hover:bg-zinc-900 transition ${m.color === 'pink' ? 'hover:border-pink-500/60' : m.color === 'cyan' ? 'hover:border-cyan-400/60' : 'hover:border-lime-400/60'}`}>
                <div className={`w-14 h-14 ${m.color === 'pink' ? 'bg-pink-500/20 text-pink-400' : m.color === 'cyan' ? 'bg-cyan-400/20 text-cyan-300' : 'bg-lime-400/20 text-lime-300'} flex items-center justify-center clip-corner mb-6`}>
                  <m.icon className="w-7 h-7" />
                </div>
                <div className={`font-code text-[10px] uppercase tracking-widest mb-1 ${m.color === 'pink' ? 'text-pink-400' : m.color === 'cyan' ? 'text-cyan-300' : 'text-lime-300'}`}>{m.sub}</div>
                <h3 className="font-display text-2xl font-bold mb-3">{m.title}</h3>
                <p className="font-code text-xs text-white/60 leading-relaxed mb-6">{m.desc}</p>
                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                  <span className="font-code text-[10px] uppercase tracking-widest text-white/40">{m.diff}</span>
                  <ChevronRight className={`w-5 h-5 ${m.color === 'pink' ? 'text-pink-400' : m.color === 'cyan' ? 'text-cyan-300' : 'text-lime-300'} group-hover:translate-x-1 transition`} />
                </div>
              </Panel>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════
// TANK BATTLE
// ═══════════════════════════════════════════════════════════════════

const GRID = 13;
const CELL = 32;

const buildWalls = () => {
  const walls = new Set();
  // border-ish walls (decorative)
  // some scattered brick clusters
  const blocks = [
    [3, 2], [3, 3], [4, 2], [4, 3],
    [9, 2], [9, 3], [8, 2], [8, 3],
    [6, 5], [6, 6], [6, 7], [5, 6], [7, 6],
    [3, 9], [3, 10], [4, 9], [4, 10],
    [9, 9], [9, 10], [8, 9], [8, 10],
    [1, 6], [11, 6],
  ];
  blocks.forEach(([x, y]) => walls.add(`${x},${y}`));
  return walls;
};

const TankBattle = ({ models, onBack, isDemo }) => {
  const [running, setRunning] = useState(false);
  const [tickCount, setTickCount] = useState(0);
  const [tankA, setTankA] = useState({ x: 1, y: 1, dir: 'right', hp: 100 });
  const [tankB, setTankB] = useState({ x: 11, y: 11, dir: 'left', hp: 100 });
  const [bullets, setBullets] = useState([]);
  const [logs, setLogs] = useState([{ side: 'sys', text: 'Match initialized. Ready.' }]);
  const [winner, setWinner] = useState(null);
  const walls = useRef(buildWalls()).current;
  
  const reset = () => {
    setRunning(false);
    setTickCount(0);
    setTankA({ x: 1, y: 1, dir: 'right', hp: 100 });
    setTankB({ x: 11, y: 11, dir: 'left', hp: 100 });
    setBullets([]);
    setLogs([{ side: 'sys', text: 'Match reset.' }]);
    setWinner(null);
  };
  
  // Game loop
  useEffect(() => {
    if (!running || winner) return;
    const id = setInterval(() => {
      setTickCount(t => t + 1);
    }, 350);
    return () => clearInterval(id);
  }, [running, winner]);
  
  useEffect(() => {
    if (tickCount === 0 || winner) return;
    
    // Move bullets
    setBullets(prev => {
      const moved = prev.map(b => {
        const nx = b.dir === 'right' ? b.x + 1 : b.dir === 'left' ? b.x - 1 : b.x;
        const ny = b.dir === 'down' ? b.y + 1 : b.dir === 'up' ? b.y - 1 : b.y;
        return { ...b, x: nx, y: ny };
      }).filter(b => b.x >= 0 && b.x < GRID && b.y >= 0 && b.y < GRID && !walls.has(`${b.x},${b.y}`));
      return moved;
    });
    
    // AI movement (scripted look-intelligent behavior)
    const moveTank = (tank, target, isA) => {
      const dx = target.x - tank.x;
      const dy = target.y - tank.y;
      const choices = [];
      if (Math.abs(dx) > Math.abs(dy)) {
        if (dx > 0) choices.push('right');
        else choices.push('left');
        if (dy > 0) choices.push('down');
        else if (dy < 0) choices.push('up');
      } else {
        if (dy > 0) choices.push('down');
        else if (dy < 0) choices.push('up');
        if (dx > 0) choices.push('right');
        else choices.push('left');
      }
      // randomness for unpredictability
      if (Math.random() < 0.35) choices.unshift(['up', 'down', 'left', 'right'][Math.floor(Math.random() * 4)]);
      
      for (const dir of choices) {
        const nx = tank.x + (dir === 'right' ? 1 : dir === 'left' ? -1 : 0);
        const ny = tank.y + (dir === 'down' ? 1 : dir === 'up' ? -1 : 0);
        if (nx < 0 || nx >= GRID || ny < 0 || ny >= GRID) continue;
        if (walls.has(`${nx},${ny}`)) continue;
        // don't collide with other tank
        const other = isA ? target : target;
        if (nx === other.x && ny === other.y) continue;
        return { ...tank, x: nx, y: ny, dir };
      }
      return { ...tank, dir: choices[0] };
    };
    
    let newA = moveTank(tankA, tankB, true);
    let newB = moveTank(tankB, tankA, false);
    
    // Decide if tanks fire (line of sight)
    const newBullets = [];
    const hasLOS = (shooter, target) => {
      if (shooter.x !== target.x && shooter.y !== target.y) return false;
      if (shooter.x === target.x) {
        const min = Math.min(shooter.y, target.y);
        const max = Math.max(shooter.y, target.y);
        for (let y = min + 1; y < max; y++) {
          if (walls.has(`${shooter.x},${y}`)) return false;
        }
        return true;
      }
      const min = Math.min(shooter.x, target.x);
      const max = Math.max(shooter.x, target.x);
      for (let x = min + 1; x < max; x++) {
        if (walls.has(`${x},${shooter.y}`)) return false;
      }
      return true;
    };
    
    if (hasLOS(newA, newB) && Math.random() < 0.7) {
      const dir = newB.x > newA.x ? 'right' : newB.x < newA.x ? 'left' : newB.y > newA.y ? 'down' : 'up';
      newA = { ...newA, dir };
      newBullets.push({ id: Math.random(), x: newA.x, y: newA.y, dir, owner: 'A' });
      setLogs(l => [{ side: 'A', text: `[A] Fire! Dir: ${dir.toUpperCase()}` }, ...l].slice(0, 8));
    }
    if (hasLOS(newB, newA) && Math.random() < 0.7) {
      const dir = newA.x > newB.x ? 'right' : newA.x < newB.x ? 'left' : newA.y > newB.y ? 'down' : 'up';
      newB = { ...newB, dir };
      newBullets.push({ id: Math.random(), x: newB.x, y: newB.y, dir, owner: 'B' });
      setLogs(l => [{ side: 'B', text: `[B] Fire! Dir: ${dir.toUpperCase()}` }, ...l].slice(0, 8));
    }
    
    setTankA(newA);
    setTankB(newB);
    
    // Check for hits
    setBullets(prev => {
      const all = [...prev, ...newBullets];
      const survivors = [];
      let hpA = newA.hp;
      let hpB = newB.hp;
      for (const b of all) {
        if (b.owner === 'A' && b.x === newB.x && b.y === newB.y) {
          hpB -= 25;
          setLogs(l => [{ side: 'A', text: `[A] HIT! B at (${b.x},${b.y}) -25 HP` }, ...l].slice(0, 8));
        } else if (b.owner === 'B' && b.x === newA.x && b.y === newA.y) {
          hpA -= 25;
          setLogs(l => [{ side: 'B', text: `[B] HIT! A at (${b.x},${b.y}) -25 HP` }, ...l].slice(0, 8));
        } else {
          survivors.push(b);
        }
      }
      if (hpA !== newA.hp) setTankA(t => ({ ...t, hp: Math.max(0, hpA) }));
      if (hpB !== newB.hp) setTankB(t => ({ ...t, hp: Math.max(0, hpB) }));
      if (hpA <= 0) {
        setWinner('B');
        setRunning(false);
        setLogs(l => [{ side: 'sys', text: '>>> MATCH OVER. B WINS. <<<' }, ...l]);
      } else if (hpB <= 0) {
        setWinner('A');
        setRunning(false);
        setLogs(l => [{ side: 'sys', text: '>>> MATCH OVER. A WINS. <<<' }, ...l]);
      }
      return survivors;
    });
  }, [tickCount]);
  
  const Tank = ({ tank, color, label }) => {
    const dirRot = { up: 0, right: 90, down: 180, left: 270 }[tank.dir];
    return (
      <div className="absolute transition-all duration-300" style={{ left: tank.x * CELL, top: tank.y * CELL, width: CELL, height: CELL, transform: `rotate(${dirRot}deg)` }}>
        <div className={`w-full h-full ${color === 'pink' ? 'bg-pink-500' : 'bg-cyan-400'} relative`} style={{ clipPath: 'polygon(20% 100%, 0 100%, 0 30%, 30% 30%, 30% 0, 70% 0, 70% 30%, 100% 30%, 100% 100%, 80% 100%, 80% 50%, 20% 50%)' }}>
          <div className="absolute inset-2 bg-black/40" />
        </div>
      </div>
    );
  };
  
  const player_A_name = isDemo ? 'claude-opus-4-7' : (models?.A?.model || 'Fighter A');
  const player_B_name = isDemo ? 'gpt-5' : (models?.B?.model || 'Fighter B');
  
  return (
    <div className="p-8 min-h-screen grid-bg noise-bg">
      <button onClick={onBack} className="flex items-center gap-2 font-code text-xs uppercase tracking-widest text-white/40 hover:text-white mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to playground
      </button>
      
      <div className="max-w-6xl mx-auto">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <TerminalLabel color="pink">tank_battle.run</TerminalLabel>
            <h1 className="mt-4 font-arcade text-2xl md:text-3xl">BATTLE CITY :: ROUND 01</h1>
          </div>
          <div className="flex gap-3">
            <NeoButton onClick={reset} color="ghost" size="sm" icon={RotateCcw}>Reset</NeoButton>
            <NeoButton onClick={() => setRunning(r => !r)} color={running ? 'cyan' : 'pink'} size="md" icon={running ? Pause : Play} disabled={!!winner}>
              {running ? 'Pause' : winner ? 'Match Ended' : 'Start Match'}
            </NeoButton>
          </div>
        </div>
        
        <div className="grid lg:grid-cols-[1fr_320px] gap-6">
          {/* Battle arena */}
          <div>
            {/* Combatants bar */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              {[
                { tank: tankA, name: player_A_name, color: 'pink', label: 'A', alive: tankA.hp > 0 },
                { tank: tankB, name: player_B_name, color: 'cyan', label: 'B', alive: tankB.hp > 0 },
              ].map(p => (
                <Panel key={p.label} color={p.color} className="p-4 clip-corner">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 ${p.color === 'pink' ? 'bg-pink-500' : 'bg-cyan-400'} flex items-center justify-center clip-corner font-arcade text-black text-sm`}>{p.label}</div>
                      <div>
                        <div className="font-code text-sm font-bold">{p.name}</div>
                        <div className="font-code text-[10px] text-white/40">tank.controller</div>
                      </div>
                    </div>
                    {!p.alive && <Skull className="w-5 h-5 text-red-500" />}
                  </div>
                  <div className="h-2 bg-black/60 overflow-hidden">
                    <div className={`h-full ${p.color === 'pink' ? 'bg-pink-500' : 'bg-cyan-400'} transition-all`} style={{ width: `${p.tank.hp}%` }} />
                  </div>
                  <div className="flex justify-between font-code text-[10px] mt-1.5 text-white/60">
                    <span>HP {p.tank.hp}/100</span>
                    <span>POS ({p.tank.x},{p.tank.y})</span>
                  </div>
                </Panel>
              ))}
            </div>
            
            {/* The grid */}
            <div className="relative bg-black border-2 border-zinc-800 p-3 inline-block">
              <div className="relative scanlines crt" style={{ width: GRID * CELL, height: GRID * CELL }}>
                {/* grid background */}
                <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)', backgroundSize: `${CELL}px ${CELL}px` }} />
                
                {/* walls */}
                {Array.from(walls).map(w => {
                  const [x, y] = w.split(',').map(Number);
                  return (
                    <div key={w} className="absolute bg-orange-700 border border-orange-900" style={{ left: x * CELL, top: y * CELL, width: CELL, height: CELL, backgroundImage: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.3) 0 4px, transparent 4px 8px), repeating-linear-gradient(90deg, rgba(0,0,0,0.3) 0 8px, transparent 8px 16px)' }} />
                  );
                })}
                
                {/* tanks */}
                {tankA.hp > 0 && <Tank tank={tankA} color="pink" />}
                {tankB.hp > 0 && <Tank tank={tankB} color="cyan" />}
                
                {/* bullets */}
                {bullets.map(b => (
                  <div key={b.id} className={`absolute w-2 h-2 ${b.owner === 'A' ? 'bg-pink-300' : 'bg-cyan-200'} rounded-full transition-all duration-300`} style={{ left: b.x * CELL + CELL/2 - 4, top: b.y * CELL + CELL/2 - 4, boxShadow: `0 0 10px ${b.owner === 'A' ? '#ec4899' : '#22d3ee'}` }} />
                ))}
                
                {/* winner overlay */}
                {winner && (
                  <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-20 backdrop-blur-sm">
                    <div className="text-center">
                      <Trophy className={`w-20 h-20 mx-auto mb-4 ${winner === 'A' ? 'text-pink-400' : 'text-cyan-400'}`} />
                      <div className={`font-arcade text-3xl ${winner === 'A' ? 'text-pink-400 glow-pink' : 'text-cyan-400 glow-cyan'} mb-2`}>{winner === 'A' ? player_A_name : player_B_name}</div>
                      <div className="font-arcade text-sm text-white/60">WINS</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Live combat log */}
          <div>
            <Panel className="p-5 clip-corner h-full">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-white/10">
                <Brain className="w-4 h-4 text-lime-400" />
                <div className="font-code text-xs uppercase tracking-widest text-lime-400">combat.log</div>
                <div className="ml-auto font-code text-[10px] text-white/40">tick {tickCount}</div>
              </div>
              <div className="space-y-2 font-code text-xs">
                {logs.map((l, i) => (
                  <div key={i} className={`leading-relaxed ${l.side === 'A' ? 'text-pink-400' : l.side === 'B' ? 'text-cyan-400' : 'text-lime-400'}`}>
                    <span className="text-white/30 mr-2">{(logs.length - i).toString().padStart(3, '0')}</span>
                    {l.text}
                  </div>
                ))}
              </div>
              {!running && !winner && (
                <div className="mt-6 pt-4 border-t border-white/10 font-code text-[10px] text-white/40 leading-relaxed">
                  Press START. Each model receives the grid state, walls, and enemy position, then decides: move (4 dirs) or fire. Decisions logged here in real time.
                </div>
              )}
            </Panel>
          </div>
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════
// CHESS MATCH
// ═══════════════════════════════════════════════════════════════════

const initialBoard = () => [
  ['♜','♞','♝','♛','♚','♝','♞','♜'],
  ['♟','♟','♟','♟','♟','♟','♟','♟'],
  ['','','','','','','',''],
  ['','','','','','','',''],
  ['','','','','','','',''],
  ['','','','','','','',''],
  ['♙','♙','♙','♙','♙','♙','♙','♙'],
  ['♖','♘','♗','♕','♔','♗','♘','♖'],
];

// Scripted Italian Game leading to a tactical finish
const CHESS_SCRIPT = [
  { from: [6,4], to: [4,4], notation: 'e4', side: 'A', think: 'Open center. King\'s pawn.' },
  { from: [1,4], to: [3,4], notation: 'e5', side: 'B', think: 'Symmetric response. Classical.' },
  { from: [7,6], to: [5,5], notation: 'Nf3', side: 'A', think: 'Develop knight, attack e5.' },
  { from: [0,1], to: [2,2], notation: 'Nc6', side: 'B', think: 'Defend pawn. Develop.' },
  { from: [7,5], to: [4,2], notation: 'Bc4', side: 'A', think: 'Italian Game. Aim at f7.' },
  { from: [0,5], to: [3,2], notation: 'Bc5', side: 'B', think: 'Giuoco Piano accepted.' },
  { from: [6,3], to: [5,3], notation: 'd3', side: 'A', think: 'Solid. Prepare castling.' },
  { from: [0,6], to: [2,5], notation: 'Nf6', side: 'B', think: 'Develop kingside.' },
  { from: [5,5], to: [3,4], notation: 'Nxe5', side: 'A', think: 'TACTICAL: knight sac for tempo.' },
  { from: [2,2], to: [3,4], notation: 'Nxe5', side: 'B', think: 'Forced recapture.' },
  { from: [6,3], to: [4,3], notation: 'd4', side: 'A', think: 'Central break! Fork.' },
  { from: [3,2], to: [2,3], notation: 'Bd6', side: 'B', think: 'Retreat to safety.' },
  { from: [4,3], to: [3,4], notation: 'dxe5', side: 'A', think: 'Restore material. Strong center.' },
  { from: [2,3], to: [3,2], notation: 'Bxe5', side: 'B', think: 'Recapture pawn.' },
  { from: [6,5], to: [5,5], notation: 'f4', side: 'A', think: 'Aggressive. Push back the bishop.' },
  { from: [3,2], to: [2,3], notation: 'Bd6', side: 'B', think: 'Retreat again. Position deteriorating.' },
  { from: [4,4], to: [3,4], notation: 'e5', side: 'A', think: 'Pawn storm! Threatens fork.' },
  { from: [2,3], to: [3,2], notation: 'Be7', side: 'B', think: 'Defensive shuffling.' },
  { from: [5,5], to: [4,5], notation: 'f5', side: 'A', think: 'Cramped. Squeeze tighter.' },
  { from: [3,4], to: [4,5], notation: 'exf5', side: 'B', think: 'Take! Wait — was that a trap?' },
  { from: [4,2], to: [1,5], notation: 'Bxf7+', side: 'A', think: '!! SACRIFICE. Force king out.' },
];

const ChessMatch = ({ models, onBack, isDemo }) => {
  const [board, setBoard] = useState(initialBoard);
  const [moveIdx, setMoveIdx] = useState(0);
  const [running, setRunning] = useState(false);
  const [history, setHistory] = useState([]);
  const [thinking, setThinking] = useState({ side: null, text: '' });
  
  const player_A_name = isDemo ? 'claude-opus-4-7' : (models?.A?.model || 'Fighter A');
  const player_B_name = isDemo ? 'gpt-5' : (models?.B?.model || 'Fighter B');
  
  useEffect(() => {
    if (!running) return;
    if (moveIdx >= CHESS_SCRIPT.length) {
      setRunning(false);
      setThinking({ side: null, text: 'Match concluded. Position complex; engines disagree on evaluation.' });
      return;
    }
    const m = CHESS_SCRIPT[moveIdx];
    setThinking({ side: m.side, text: m.think });
    const t = setTimeout(() => {
      setBoard(prev => {
        const next = prev.map(row => [...row]);
        const piece = next[m.from[0]][m.from[1]];
        next[m.from[0]][m.from[1]] = '';
        next[m.to[0]][m.to[1]] = piece;
        return next;
      });
      setHistory(h => [{ ...m, num: moveIdx + 1 }, ...h]);
      setMoveIdx(i => i + 1);
    }, 1800);
    return () => clearTimeout(t);
  }, [running, moveIdx]);
  
  const reset = () => {
    setBoard(initialBoard());
    setMoveIdx(0);
    setRunning(false);
    setHistory([]);
    setThinking({ side: null, text: '' });
  };
  
  return (
    <div className="p-8 min-h-screen grid-bg noise-bg">
      <button onClick={onBack} className="flex items-center gap-2 font-code text-xs uppercase tracking-widest text-white/40 hover:text-white mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to playground
      </button>
      
      <div className="max-w-6xl mx-auto">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <TerminalLabel color="cyan">chess_match.run</TerminalLabel>
            <h1 className="mt-4 font-arcade text-2xl md:text-3xl">CHESS :: ITALIAN GAME</h1>
          </div>
          <div className="flex gap-3">
            <NeoButton onClick={reset} color="ghost" size="sm" icon={RotateCcw}>Reset</NeoButton>
            <NeoButton onClick={() => setRunning(r => !r)} color={running ? 'pink' : 'cyan'} size="md" icon={running ? Pause : Play}>
              {running ? 'Pause' : 'Start Match'}
            </NeoButton>
          </div>
        </div>
        
        <div className="grid lg:grid-cols-[1fr_320px] gap-6">
          <div>
            {/* Players */}
            <Panel color="pink" className="p-3 mb-2 clip-corner flex items-center gap-3">
              <div className="w-9 h-9 bg-pink-500 flex items-center justify-center clip-corner font-arcade text-black text-xs">W</div>
              <div className="flex-1">
                <div className="font-code text-sm font-bold">{player_A_name}</div>
                <div className="font-code text-[10px] text-white/40">white pieces</div>
              </div>
              {thinking.side === 'A' && <div className="font-code text-[10px] text-pink-400 animate-pulse">thinking...</div>}
            </Panel>
            
            {/* Board */}
            <div className="inline-block bg-black border-2 border-zinc-800 p-3">
              <div className="grid grid-cols-8 gap-0 relative">
                {board.map((row, ri) => row.map((piece, ci) => {
                  const isLight = (ri + ci) % 2 === 0;
                  return (
                    <div key={`${ri}-${ci}`} className={`w-12 h-12 flex items-center justify-center text-3xl transition-all duration-700 ${isLight ? 'bg-zinc-700' : 'bg-zinc-900'}`}>
                      <span className={piece && '♔♕♖♗♘♙'.includes(piece) ? 'text-white' : 'text-zinc-300'}>{piece}</span>
                    </div>
                  );
                }))}
              </div>
            </div>
            
            {/* Players */}
            <Panel color="cyan" className="p-3 mt-2 clip-corner flex items-center gap-3">
              <div className="w-9 h-9 bg-cyan-400 flex items-center justify-center clip-corner font-arcade text-black text-xs">B</div>
              <div className="flex-1">
                <div className="font-code text-sm font-bold">{player_B_name}</div>
                <div className="font-code text-[10px] text-white/40">black pieces</div>
              </div>
              {thinking.side === 'B' && <div className="font-code text-[10px] text-cyan-400 animate-pulse">thinking...</div>}
            </Panel>
          </div>
          
          {/* Right: thinking + move log */}
          <div className="space-y-4">
            <Panel className="p-5 clip-corner">
              <div className="flex items-center gap-2 mb-3 pb-2 border-b border-white/10">
                <Brain className="w-4 h-4 text-lime-400" />
                <div className="font-code text-xs uppercase tracking-widest text-lime-400">commentary</div>
              </div>
              {thinking.text ? (
                <div className={`font-code text-xs leading-relaxed ${thinking.side === 'A' ? 'text-pink-300' : thinking.side === 'B' ? 'text-cyan-300' : 'text-white/70'}`}>
                  {thinking.side && <span className="font-bold mr-1">[{thinking.side}]</span>}
                  {thinking.text}
                </div>
              ) : (
                <div className="font-code text-xs text-white/40 leading-relaxed">Press START to begin. Each model is sent the FEN, opponent's last move, and time remaining.</div>
              )}
            </Panel>
            
            <Panel className="p-5 clip-corner">
              <div className="flex items-center gap-2 mb-3 pb-2 border-b border-white/10">
                <BarChart3 className="w-4 h-4 text-cyan-400" />
                <div className="font-code text-xs uppercase tracking-widest text-cyan-400">move log</div>
              </div>
              <div className="space-y-1.5 font-code text-xs max-h-80 overflow-auto">
                {history.length === 0 ? (
                  <div className="text-white/30">awaiting first move...</div>
                ) : history.map((m) => (
                  <div key={m.num} className="flex items-center gap-2">
                    <span className="text-white/30 w-6">{m.num}.</span>
                    <span className={`font-bold ${m.side === 'A' ? 'text-pink-400' : 'text-cyan-400'}`}>{m.notation}</span>
                  </div>
                ))}
              </div>
            </Panel>
          </div>
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════
// ESSAY CONTEST
// ═══════════════════════════════════════════════════════════════════

const EssayContest = ({ models, onBack, isDemo }) => {
  const [phase, setPhase] = useState('intro'); // intro, generating, reading, voted
  const [vote, setVote] = useState(null);
  const [progressA, setProgressA] = useState(0);
  const [progressB, setProgressB] = useState(0);
  
  const player_A_name = isDemo ? 'claude-opus-4-7' : (models?.A?.model || 'Fighter A');
  const player_B_name = isDemo ? 'gpt-5' : (models?.B?.model || 'Fighter B');
  
  useEffect(() => {
    if (phase !== 'generating') return;
    const id = setInterval(() => {
      setProgressA(p => Math.min(100, p + Math.random() * 8));
      setProgressB(p => Math.min(100, p + Math.random() * 7));
    }, 250);
    return () => clearInterval(id);
  }, [phase]);
  
  useEffect(() => {
    if (phase === 'generating' && progressA >= 100 && progressB >= 100) {
      const t = setTimeout(() => setPhase('reading'), 500);
      return () => clearTimeout(t);
    }
  }, [progressA, progressB, phase]);
  
  return (
    <div className="p-8 min-h-screen grid-bg noise-bg">
      <button onClick={onBack} className="flex items-center gap-2 font-code text-xs uppercase tracking-widest text-white/40 hover:text-white mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to playground
      </button>
      
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <TerminalLabel color="lime">essay_duel.run</TerminalLabel>
          <h1 className="mt-4 font-arcade text-2xl md:text-3xl">ESSAY DUEL :: HARVARD STYLE</h1>
        </div>
        
        <Panel className="p-6 mb-6 clip-corner">
          <div className="font-code text-[10px] uppercase tracking-widest text-lime-400 mb-2">prompt</div>
          <div className="font-display text-lg text-white/90 leading-relaxed italic">"{ESSAY_PROMPT}"</div>
        </Panel>
        
        {phase === 'intro' && (
          <div className="text-center py-12">
            <p className="font-display text-white/60 text-lg mb-8 max-w-2xl mx-auto">Both fighters will receive the prompt simultaneously. You'll read both essays <span className="text-lime-400 font-bold">blind</span> — model identities revealed only after you vote.</p>
            <NeoButton onClick={() => setPhase('generating')} color="lime" size="lg" icon={FileText}>Begin Duel</NeoButton>
          </div>
        )}
        
        {phase === 'generating' && (
          <div className="grid md:grid-cols-2 gap-6">
            {[
              { name: 'Anonymous A', color: 'pink', progress: progressA },
              { name: 'Anonymous B', color: 'cyan', progress: progressB },
            ].map((p, i) => (
              <Panel key={i} color={p.color} className="p-8 clip-corner text-center">
                <div className={`w-16 h-16 mx-auto mb-4 ${p.color === 'pink' ? 'bg-pink-500/20' : 'bg-cyan-400/20'} flex items-center justify-center clip-corner`}>
                  <Cpu className={`w-8 h-8 ${p.color === 'pink' ? 'text-pink-400 animate-pulse' : 'text-cyan-400 animate-pulse'}`} />
                </div>
                <div className="font-arcade text-sm mb-6">{p.name}</div>
                <div className="h-2 bg-black/60 mb-2 overflow-hidden">
                  <div className={`h-full ${p.color === 'pink' ? 'bg-pink-500' : 'bg-cyan-400'} transition-all`} style={{ width: `${p.progress}%` }} />
                </div>
                <div className="font-code text-[10px] text-white/60">writing... {Math.round(p.progress)}%</div>
              </Panel>
            ))}
          </div>
        )}
        
        {phase === 'reading' && (
          <>
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              {[
                { letter: 'A', name: 'Anonymous A', color: 'pink', text: ESSAY_A },
                { letter: 'B', name: 'Anonymous B', color: 'cyan', text: ESSAY_B },
              ].map(p => (
                <Panel key={p.letter} color={p.color} className="p-6 clip-corner">
                  <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
                    <div className={`w-10 h-10 ${p.color === 'pink' ? 'bg-pink-500' : 'bg-cyan-400'} flex items-center justify-center clip-corner font-arcade text-black`}>{p.letter}</div>
                    <div className="font-code text-[10px] uppercase tracking-widest text-white/40">{p.text.length} chars</div>
                  </div>
                  <div className="font-display text-sm text-white/85 leading-relaxed whitespace-pre-line">{p.text}</div>
                </Panel>
              ))}
            </div>
            <Panel className="p-6 clip-corner text-center">
              <div className="font-arcade text-sm text-lime-400 mb-4 glow-lime">CAST YOUR VOTE</div>
              <div className="flex justify-center gap-4 flex-wrap">
                <NeoButton onClick={() => { setVote('A'); setPhase('voted'); }} color="pink" size="lg" icon={Crown}>A wins</NeoButton>
                <NeoButton onClick={() => { setVote('tie'); setPhase('voted'); }} color="ghost" size="lg">Tie</NeoButton>
                <NeoButton onClick={() => { setVote('B'); setPhase('voted'); }} color="cyan" size="lg" icon={Crown}>B wins</NeoButton>
              </div>
            </Panel>
          </>
        )}
        
        {phase === 'voted' && (
          <Panel className="p-12 clip-corner text-center">
            <Trophy className={`w-20 h-20 mx-auto mb-4 ${vote === 'A' ? 'text-pink-400' : vote === 'B' ? 'text-cyan-400' : 'text-lime-400'}`} />
            <div className="font-arcade text-xs text-white/40 mb-2">YOU VOTED</div>
            <div className={`font-arcade text-2xl mb-8 ${vote === 'A' ? 'text-pink-400 glow-pink' : vote === 'B' ? 'text-cyan-400 glow-cyan' : 'text-lime-400 glow-lime'}`}>
              {vote === 'A' ? 'ANONYMOUS A' : vote === 'B' ? 'ANONYMOUS B' : 'TIE'}
            </div>
            <div className="font-code text-xs text-white/60 uppercase tracking-widest mb-6">Identities revealed:</div>
            <div className="grid md:grid-cols-2 gap-4 mb-8 max-w-2xl mx-auto">
              <div className={`p-4 ${vote === 'A' ? 'bg-pink-500/10 border-pink-500/40' : 'bg-zinc-900 border-white/10'} border clip-corner`}>
                <div className="font-code text-[10px] text-pink-400 uppercase tracking-widest mb-1">A was</div>
                <div className="font-code font-bold">{player_A_name}</div>
              </div>
              <div className={`p-4 ${vote === 'B' ? 'bg-cyan-400/10 border-cyan-400/40' : 'bg-zinc-900 border-white/10'} border clip-corner`}>
                <div className="font-code text-[10px] text-cyan-400 uppercase tracking-widest mb-1">B was</div>
                <div className="font-code font-bold">{player_B_name}</div>
              </div>
            </div>
            <NeoButton onClick={() => { setPhase('intro'); setVote(null); setProgressA(0); setProgressB(0); }} color="lime" size="md" icon={RotateCcw}>Run Another</NeoButton>
          </Panel>
        )}
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════
// LEADERBOARD
// ═══════════════════════════════════════════════════════════════════

const Leaderboard = ({ onBack }) => {
  const [filter, setFilter] = useState('all');
  const filters = [
    { id: 'all', label: 'All Modes' },
    { id: 'tank', label: 'Tank' },
    { id: 'chess', label: 'Chess' },
    { id: 'essay', label: 'Essay' },
  ];
  
  return (
    <div className="p-8 min-h-screen grid-bg noise-bg">
      <div className="max-w-6xl mx-auto">
        <TerminalLabel color="lime">leaderboard.global</TerminalLabel>
        <h1 className="mt-4 font-arcade text-2xl md:text-3xl mb-2">UNIVERSAL RANKINGS</h1>
        <p className="font-display text-white/60 text-lg mb-8">Every match. Every model. Every win counted.</p>
        
        <div className="flex flex-wrap gap-2 mb-6">
          {filters.map(f => (
            <button key={f.id} onClick={() => setFilter(f.id)} className={`px-4 py-2 font-code text-xs uppercase tracking-widest border transition ${filter === f.id ? 'bg-pink-500 text-black border-pink-500' : 'border-white/20 text-white/60 hover:text-white hover:border-white/40'}`}>
              {f.label}
            </button>
          ))}
        </div>
        
        <Panel className="overflow-hidden">
          <div className="grid grid-cols-12 px-6 py-4 border-b border-white/10 font-code text-[10px] uppercase tracking-widest text-white/40">
            <div className="col-span-1">Rank</div>
            <div className="col-span-4">Model</div>
            <div className="col-span-2">Provider</div>
            <div className="col-span-1 text-right">W</div>
            <div className="col-span-1 text-right">L</div>
            <div className="col-span-1 text-right">Win %</div>
            <div className="col-span-2 text-right">ELO Rating</div>
          </div>
          {LEADERBOARD.map((row) => {
            const accent = row.rank === 1 ? 'pink' : row.rank === 2 ? 'cyan' : row.rank === 3 ? 'lime' : null;
            return (
              <div key={row.rank} className={`grid grid-cols-12 px-6 py-4 border-b border-white/5 hover:bg-white/5 font-code text-sm transition ${accent ? `bg-${accent}-500/5` : ''}`} style={accent === 'pink' ? { background: 'rgba(236,72,153,0.04)' } : accent === 'cyan' ? { background: 'rgba(34,211,238,0.04)' } : accent === 'lime' ? { background: 'rgba(163,230,53,0.04)' } : {}}>
                <div className={`col-span-1 font-arcade flex items-center gap-2 ${accent === 'pink' ? 'text-pink-400 glow-pink' : accent === 'cyan' ? 'text-cyan-400' : accent === 'lime' ? 'text-lime-400' : 'text-white/40'}`}>
                  {row.rank === 1 && <Crown className="w-4 h-4" />}
                  {row.rank.toString().padStart(2, '0')}
                </div>
                <div className="col-span-4 flex items-center gap-3">
                  <span className="font-bold">{row.model}</span>
                  {row.hot && <Flame className="w-3.5 h-3.5 text-orange-400" />}
                </div>
                <div className="col-span-2 text-white/60 uppercase text-[10px] tracking-widest pt-0.5">{row.provider}</div>
                <div className="col-span-1 text-right text-lime-400">{row.wins}</div>
                <div className="col-span-1 text-right text-red-400/80">{row.losses}</div>
                <div className="col-span-1 text-right">{row.winrate}%</div>
                <div className="col-span-2 text-right font-bold">{row.elo}</div>
              </div>
            );
          })}
        </Panel>
        
        <div className="mt-6 font-code text-[10px] text-white/40 uppercase tracking-widest">
          <span className="text-lime-400">●</span> Updated in real time. ELO computed across all modes with mode-weighted K-factor.
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════
// SETTINGS
// ═══════════════════════════════════════════════════════════════════

const Settings = ({ user, models, onUpdate }) => {
  return (
    <div className="p-8 min-h-screen grid-bg noise-bg">
      <div className="max-w-3xl mx-auto">
        <TerminalLabel color="cyan">settings.cfg</TerminalLabel>
        <h1 className="mt-4 font-arcade text-2xl md:text-3xl mb-8">SETTINGS</h1>
        
        <Panel className="p-6 mb-6 clip-corner">
          <div className="font-code text-xs uppercase tracking-widest text-cyan-400 mb-4">account</div>
          <div className="space-y-3 font-code text-sm">
            <div className="flex justify-between"><span className="text-white/50">Handle</span><span>{user?.name || 'guest'}</span></div>
            <div className="flex justify-between"><span className="text-white/50">Email</span><span>{user?.email || '—'}</span></div>
            <div className="flex justify-between"><span className="text-white/50">Plan</span><span className="text-lime-400">free // unlimited demo</span></div>
          </div>
        </Panel>
        
        <Panel className="p-6 mb-6 clip-corner">
          <div className="flex items-center justify-between mb-4">
            <div className="font-code text-xs uppercase tracking-widest text-pink-400">configured fighters</div>
            <NeoButton onClick={onUpdate} color="ghost" size="sm" icon={Plus}>Reconfigure</NeoButton>
          </div>
          <div className="grid md:grid-cols-2 gap-3">
            {[
              { label: 'Fighter A', m: models?.A, color: 'pink' },
              { label: 'Fighter B', m: models?.B, color: 'cyan' },
            ].map((f, i) => (
              <div key={i} className={`p-4 border ${f.color === 'pink' ? 'border-pink-500/30' : 'border-cyan-400/30'} clip-corner`}>
                <div className={`font-code text-[10px] uppercase tracking-widest ${f.color === 'pink' ? 'text-pink-400' : 'text-cyan-400'} mb-2`}>{f.label}</div>
                <div className="font-code text-sm font-bold mb-1">{f.m?.model || 'not configured'}</div>
                <div className="font-code text-[10px] text-white/40">{f.m?.provider || '—'} · key: {f.m?.key ? '••••' + f.m.key.slice(-4) : 'none'}</div>
              </div>
            ))}
          </div>
        </Panel>
        
        <Panel className="p-6 clip-corner">
          <div className="font-code text-xs uppercase tracking-widest text-lime-400 mb-4">data & privacy</div>
          <div className="space-y-3 font-code text-xs text-white/70 leading-relaxed">
            <div className="flex items-start gap-2"><Check className="w-4 h-4 text-lime-400 flex-shrink-0 mt-0.5" />API keys encrypted at rest with AES-256.</div>
            <div className="flex items-start gap-2"><Check className="w-4 h-4 text-lime-400 flex-shrink-0 mt-0.5" />Match transcripts retained 30 days, then purged unless pinned.</div>
            <div className="flex items-start gap-2"><Check className="w-4 h-4 text-lime-400 flex-shrink-0 mt-0.5" />Leaderboard contributions are anonymous by default.</div>
            <div className="flex items-start gap-2"><Check className="w-4 h-4 text-lime-400 flex-shrink-0 mt-0.5" />Export or delete all your data any time.</div>
          </div>
        </Panel>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════
// ROOT APP
// ═══════════════════════════════════════════════════════════════════

export default function App() {
  const [screen, setScreen] = useState('landing');
  const [user, setUser] = useState(null);
  const [models, setModels] = useState(null);
  const [isDemo, setIsDemo] = useState(false);
  
  const handleNav = (target) => {
    if (target === 'logout') {
      setUser(null);
      setModels(null);
      setIsDemo(false);
      setScreen('landing');
      return;
    }
    setScreen(target);
  };
  
  const handleAuthComplete = (u) => {
    setUser(u);
    setScreen('setup');
  };
  
  const handleSetupComplete = (m) => {
    setModels(m);
    setScreen('hub');
  };
  
  const handleDemo = () => {
    setIsDemo(true);
    setUser({ name: 'guest', email: 'demo@arena.ai' });
    setScreen('hub');
  };
  
  const isLoggedInScreen = ['hub', 'tank', 'chess', 'essay', 'leaderboard', 'settings'].includes(screen);
  
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CUSTOM_CSS }} />
      
      {screen === 'landing' && <Landing onGetStarted={() => setScreen('auth')} onDemoMode={handleDemo} />}
      {screen === 'auth' && <Auth onComplete={handleAuthComplete} onBack={() => setScreen('landing')} />}
      {screen === 'setup' && <ModelSetup onComplete={handleSetupComplete} onBack={() => setScreen('landing')} initial={models} />}
      
      {isLoggedInScreen && (
        <Shell user={user} currentScreen={screen} onNav={handleNav} isDemo={isDemo}>
          {screen === 'hub' && <PlaygroundHub models={models} isDemo={isDemo} onPick={setScreen} />}
          {screen === 'tank' && <TankBattle models={models} isDemo={isDemo} onBack={() => setScreen('hub')} />}
          {screen === 'chess' && <ChessMatch models={models} isDemo={isDemo} onBack={() => setScreen('hub')} />}
          {screen === 'essay' && <EssayContest models={models} isDemo={isDemo} onBack={() => setScreen('hub')} />}
          {screen === 'leaderboard' && <Leaderboard onBack={() => setScreen('hub')} />}
          {screen === 'settings' && <Settings user={user} models={models} onUpdate={() => setScreen('setup')} />}
        </Shell>
      )}
    </>
  );
}
