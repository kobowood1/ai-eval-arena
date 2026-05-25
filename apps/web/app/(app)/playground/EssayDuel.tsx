'use client';

import { useState } from 'react';
import { Crown, Trophy, RotateCcw, Loader2, FileText } from 'lucide-react';
import { NeoButton } from '../../../components/ui/neo-button';
import { Panel } from '../../../components/ui/panel';
import { TerminalLabel } from '../../../components/ui/terminal-label';

interface ModelConfig {
  id: string;
  label: string;
  provider: string;
  model: string;
}

interface Props {
  configs: ModelConfig[];
}

type Phase = 'setup' | 'generating' | 'reading' | 'voted';
type Vote = 'A' | 'B' | 'tie';

export function EssayDuel({ configs }: Props) {
  const [phase, setPhase] = useState<Phase>('setup');
  const [configAId, setConfigAId] = useState(configs[0]?.id ?? '');
  const [configBId, setConfigBId] = useState(configs[1]?.id ?? configs[0]?.id ?? '');
  const [prompt, setPrompt] = useState('');
  const [essayA, setEssayA] = useState('');
  const [essayB, setEssayB] = useState('');
  const [vote, setVote] = useState<Vote | null>(null);
  const [error, setError] = useState('');
  const [matchId, setMatchId] = useState('');
  const [usageA, setUsageA] = useState({ input: 0, output: 0 });
  const [usageB, setUsageB] = useState({ input: 0, output: 0 });
  const [durationMs, setDurationMs] = useState(0);

  const configA = configs.find(c => c.id === configAId);
  const configB = configs.find(c => c.id === configBId);

  async function startDuel() {
    if (!configAId || !configBId || !prompt.trim()) return;
    setPhase('generating');
    setError('');
    try {
      const res = await fetch('/api/essay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ configAId, configBId, prompt }),
      });
      if (!res.ok) throw new Error('Essay generation failed');
      const data = await res.json() as {
        essayA: string; essayB: string;
        usageA: { input: number; output: number };
        usageB: { input: number; output: number };
        durationMs: number;
      };
      setEssayA(data.essayA ?? '');
      setEssayB(data.essayB ?? '');
      setUsageA(data.usageA);
      setUsageB(data.usageB);
      setDurationMs(data.durationMs);
      setPhase('reading');
    } catch {
      setError('Generation failed. Check your API keys and try again.');
      setPhase('setup');
    }
  }

  async function castVote(v: Vote) {
    setVote(v);
    setPhase('voted');
    try {
      const res = await fetch('/api/matches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          configAId, configBId, mode: 'essay', winner: v,
          durationMs, totalTokensA: usageA.input + usageA.output,
          totalTokensB: usageB.input + usageB.output,
        }),
      });
      if (res.ok) {
        const data = await res.json() as { matchId: string };
        setMatchId(data.matchId);
      }
    } catch {
      // Match recording failure is non-fatal; user already voted
    }
  }

  function reset() {
    setPhase('setup');
    setEssayA(''); setEssayB('');
    setVote(null); setMatchId(''); setError('');
    setPrompt('');
  }

  if (configs.length < 2) {
    return (
      <Panel color="cyan">
        <div className="py-8 text-center space-y-3">
          <TerminalLabel color="pink">error://no_configs</TerminalLabel>
          <p className="font-code text-sm text-white/60">
            You need at least 2 model configs to run a duel.{' '}
            <a href="/settings" className="text-cyan-400 hover:underline">Add them in Settings →</a>
          </p>
        </div>
      </Panel>
    );
  }

  if (phase === 'setup') {
    return (
      <div className="space-y-6">
        <TerminalLabel color="lime">essay_duel.configure</TerminalLabel>

        <div className="grid grid-cols-2 gap-4">
          <Panel color="pink">
            <label className="font-code text-xs text-white/50 block mb-2">Fighter A</label>
            <select
              value={configAId}
              onChange={e => setConfigAId(e.target.value)}
              className="w-full bg-black border border-pink-500/40 px-3 py-2 font-code text-sm text-white focus:outline-none focus:border-pink-400"
            >
              {configs.map(c => (
                <option key={c.id} value={c.id}>{c.label} ({c.model})</option>
              ))}
            </select>
          </Panel>
          <Panel color="cyan">
            <label className="font-code text-xs text-white/50 block mb-2">Fighter B</label>
            <select
              value={configBId}
              onChange={e => setConfigBId(e.target.value)}
              className="w-full bg-black border border-cyan-400/40 px-3 py-2 font-code text-sm text-white focus:outline-none focus:border-cyan-300"
            >
              {configs.map(c => (
                <option key={c.id} value={c.id}>{c.label} ({c.model})</option>
              ))}
            </select>
          </Panel>
        </div>

        <Panel color="default">
          <label className="font-code text-xs text-white/50 block mb-2">Essay Prompt</label>
          <textarea
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            rows={4}
            placeholder="e.g. Argue whether large language models constitute a genuine paradigm shift in AI, or merely an incremental advance."
            className="w-full bg-transparent font-code text-sm text-white/80 focus:outline-none resize-none placeholder:text-white/20"
          />
        </Panel>

        {error && <p className="font-code text-xs text-pink-400">{error}</p>}

        <p className="font-code text-xs text-white/30">
          Both fighters receive the prompt simultaneously. Read both essays blind — model identities revealed only after you vote.
        </p>

        <NeoButton
          color="lime"
          size="lg"
          icon={<FileText className="w-4 h-4" />}
          onClick={startDuel}
          disabled={!prompt.trim() || configAId === configBId}
        >
          Begin Duel
        </NeoButton>
      </div>
    );
  }

  if (phase === 'generating') {
    return (
      <div className="space-y-6">
        <TerminalLabel color="lime">essay_duel.generating</TerminalLabel>
        <div className="grid grid-cols-2 gap-4">
          {(['A', 'B'] as const).map(side => (
            <Panel key={side} color={side === 'A' ? 'pink' : 'cyan'}>
              <div className="py-8 flex flex-col items-center gap-4">
                <Loader2 className={`w-8 h-8 animate-spin ${side === 'A' ? 'text-pink-400' : 'text-cyan-400'}`} />
                <p className="font-arcade text-xs text-white/60">Anonymous {side}</p>
                <p className="font-code text-xs text-white/30 animate-pulse">writing...</p>
              </div>
            </Panel>
          ))}
        </div>
        <p className="font-code text-xs text-white/30 text-center">Calling both models in parallel...</p>
      </div>
    );
  }

  if (phase === 'reading') {
    return (
      <div className="space-y-6">
        <TerminalLabel color="lime">essay_duel.reading — cast your vote</TerminalLabel>

        <div className="grid grid-cols-2 gap-4">
          {([
            { side: 'A' as const, essay: essayA, color: 'pink' as const },
            { side: 'B' as const, essay: essayB, color: 'cyan' as const },
          ]).map(({ side, essay, color }) => (
            <Panel key={side} color={color}>
              <div className="flex items-center justify-between mb-3">
                <span className={`font-arcade text-xs ${color === 'pink' ? 'text-pink-400' : 'text-cyan-400'}`}>
                  Anonymous {side}
                </span>
                <span className="font-code text-xs text-white/30">
                  {essay.length.toLocaleString()} chars
                </span>
              </div>
              <div className="font-code text-sm text-white/80 leading-relaxed whitespace-pre-line max-h-96 overflow-y-auto">
                {essay}
              </div>
            </Panel>
          ))}
        </div>

        <Panel color="default">
          <div className="flex flex-col items-center gap-4 py-2">
            <TerminalLabel color="lime">CAST YOUR VOTE</TerminalLabel>
            <div className="flex gap-4">
              <NeoButton color="pink" size="md" icon={<Crown className="w-4 h-4" />} onClick={() => castVote('A')}>
                A Wins
              </NeoButton>
              <NeoButton color="ghost" size="md" onClick={() => castVote('tie')}>
                Tie
              </NeoButton>
              <NeoButton color="cyan" size="md" icon={<Crown className="w-4 h-4" />} onClick={() => castVote('B')}>
                B Wins
              </NeoButton>
            </div>
          </div>
        </Panel>
      </div>
    );
  }

  // Voted phase
  const voteColor = vote === 'A' ? 'text-pink-400' : vote === 'B' ? 'text-cyan-400' : 'text-lime-400';
  const voteLabel = vote === 'A' ? 'A WINS' : vote === 'B' ? 'B WINS' : 'TIE';

  return (
    <div className="space-y-6">
      <TerminalLabel color="lime">essay_duel.result</TerminalLabel>

      <Panel color="default">
        <div className="flex flex-col items-center gap-4 py-6">
          <Trophy className={`w-12 h-12 ${voteColor}`} />
          <p className="font-code text-xs text-white/50 uppercase tracking-widest">You voted</p>
          <p className={`font-arcade text-3xl ${voteColor}`}>{voteLabel}</p>
          {matchId && (
            <p className="font-code text-xs text-white/20">match #{matchId.slice(-8)}</p>
          )}
        </div>
      </Panel>

      <div className="grid grid-cols-2 gap-4">
        {([
          { side: 'A' as const, config: configA, color: 'pink' as const, won: vote === 'A' },
          { side: 'B' as const, config: configB, color: 'cyan' as const, won: vote === 'B' },
        ]).map(({ side, config, color, won }) => (
          <Panel key={side} color={won ? color : 'default'}>
            <p className="font-code text-xs text-white/40 mb-1">Side {side} was:</p>
            <p className={`font-code text-sm font-bold ${won ? (color === 'pink' ? 'text-pink-400' : 'text-cyan-400') : 'text-white'}`}>
              {config?.label}
            </p>
            <p className="font-code text-xs text-white/30">{config?.provider} / {config?.model}</p>
          </Panel>
        ))}
      </div>

      <div className="flex gap-4 items-center">
        <NeoButton color="lime" size="md" icon={<RotateCcw className="w-4 h-4" />} onClick={reset}>
          Run Another
        </NeoButton>
        <a href="/leaderboard" className="font-code text-xs text-white/40 hover:text-cyan-400 transition">
          View Leaderboard →
        </a>
      </div>
    </div>
  );
}
