import { NextResponse } from 'next/server';
import { and, eq } from 'drizzle-orm';
import { auth } from '../../../../auth';
import { getDb, schema } from '@arena/db';

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const db = getDb();

  const deleted = await db
    .delete(schema.modelConfigs)
    .where(and(eq(schema.modelConfigs.id, id), eq(schema.modelConfigs.userId, session.user.id)))
    .returning({ id: schema.modelConfigs.id });

  if (!deleted.length) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  return NextResponse.json({ ok: true });
}
