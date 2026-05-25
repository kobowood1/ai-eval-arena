import { auth } from '../../../auth';
import { getDb, schema } from '@arena/db';
import { eq } from 'drizzle-orm';
import { redirect } from 'next/navigation';
import { TerminalLabel } from '../../../components/ui/terminal-label';
import { EssayDuel } from './EssayDuel';

export default async function PlaygroundPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/signin');

  const configs = await getDb()
    .select({
      id: schema.modelConfigs.id,
      label: schema.modelConfigs.label,
      provider: schema.modelConfigs.provider,
      model: schema.modelConfigs.model,
    })
    .from(schema.modelConfigs)
    .where(eq(schema.modelConfigs.userId, session.user.id));

  return (
    <div className="space-y-8">
      <div>
        <TerminalLabel color="lime">mode://essay_duel</TerminalLabel>
        <h1 className="mt-3 font-arcade text-2xl text-white">Essay Duel</h1>
        <p className="mt-2 font-code text-sm text-white/50">
          Two models. One prompt. You decide who wrote better.
        </p>
      </div>
      <EssayDuel configs={configs} />
    </div>
  );
}
