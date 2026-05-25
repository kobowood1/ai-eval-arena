import { getDb, schema } from '@arena/db';
import { desc, eq } from 'drizzle-orm';
import { TerminalLabel } from '../../../components/ui/terminal-label';
import { Panel } from '../../../components/ui/panel';

const MODE_TABS = ['essay', 'chess', 'tank', 'composite'] as const;
type Mode = typeof MODE_TABS[number];

export default async function LeaderboardPage({
  searchParams,
}: {
  searchParams: Promise<{ mode?: string }>;
}) {
  const { mode: modeParam } = await searchParams;
  const mode: Mode = MODE_TABS.includes(modeParam as Mode) ? (modeParam as Mode) : 'essay';

  const ratings = await getDb()
    .select()
    .from(schema.ratings)
    .where(eq(schema.ratings.mode, mode))
    .orderBy(desc(schema.ratings.elo))
    .limit(50);

  return (
    <div className="space-y-8">
      <div>
        <TerminalLabel color="cyan">sys://leaderboard</TerminalLabel>
        <h1 className="mt-3 font-arcade text-2xl text-white">Leaderboard</h1>
      </div>

      {/* Mode tabs */}
      <div className="flex gap-2">
        {MODE_TABS.map(m => (
          <a
            key={m}
            href={`/leaderboard?mode=${m}`}
            className={`font-code text-xs uppercase tracking-widest px-4 py-2 border transition ${
              m === mode
                ? 'border-cyan-400 text-cyan-400 bg-cyan-400/10'
                : 'border-white/20 text-white/40 hover:border-white/40 hover:text-white/60'
            }`}
          >
            {m}
          </a>
        ))}
      </div>

      {ratings.length === 0 ? (
        <Panel color="cyan">
          <p className="font-code text-sm text-white/40 text-center py-8">
            No matches recorded yet for {mode} mode.{' '}
            <a href="/playground" className="text-cyan-400 hover:underline">Run a duel →</a>
          </p>
        </Panel>
      ) : (
        <Panel color="default">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="font-code text-xs text-white/40 text-left pb-3 w-12">#</th>
                <th className="font-code text-xs text-white/40 text-left pb-3">Model</th>
                <th className="font-code text-xs text-white/40 text-right pb-3 w-20">ELO</th>
                <th className="font-code text-xs text-white/40 text-right pb-3 w-16">W</th>
                <th className="font-code text-xs text-white/40 text-right pb-3 w-16">L</th>
                <th className="font-code text-xs text-white/40 text-right pb-3 w-16">T</th>
              </tr>
            </thead>
            <tbody>
              {ratings.map((r, i) => {
                const isTop = i === 0;
                return (
                  <tr key={r.id} className="border-b border-white/5 hover:bg-white/2 transition">
                    <td className="font-code text-xs text-white/30 py-3">{i + 1}</td>
                    <td className="py-3">
                      <span className={`font-code text-sm ${isTop ? 'text-cyan-400' : 'text-white'}`}>
                        {r.modelIdentifier}
                      </span>
                    </td>
                    <td className={`font-arcade text-sm text-right py-3 ${isTop ? 'text-cyan-400 glow-cyan' : 'text-white'}`}>
                      {r.elo}
                    </td>
                    <td className="font-code text-xs text-lime-400 text-right py-3">{r.wins}</td>
                    <td className="font-code text-xs text-pink-400 text-right py-3">{r.losses}</td>
                    <td className="font-code text-xs text-white/40 text-right py-3">{r.ties}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Panel>
      )}
    </div>
  );
}
