import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { auth } from '../../../auth';
import { getDb, schema } from '@arena/db';
import { generateKey, exportKey, importKey, encrypt, encryptApiKey } from '@arena/lib/crypto';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const db = getDb();
  const configs = await db
    .select({
      id: schema.modelConfigs.id,
      label: schema.modelConfigs.label,
      provider: schema.modelConfigs.provider,
      model: schema.modelConfigs.model,
      createdAt: schema.modelConfigs.createdAt,
    })
    .from(schema.modelConfigs)
    .where(eq(schema.modelConfigs.userId, session.user.id));

  return NextResponse.json(configs);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json() as { label?: string; provider?: string; model?: string; apiKey?: string };
  const { label, provider, model, apiKey } = body;
  if (!label || !provider || !model || !apiKey) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const db = getDb();
  const [user] = await db
    .select({ kek: schema.users.kek })
    .from(schema.users)
    .where(eq(schema.users.id, session.user.id));

  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  // Lazily generate KEK if missing (shouldn't happen post-createUser event, but defensive)
  let kekB64 = user.kek;
  if (!kekB64) {
    const kek = await generateKey();
    const kekRaw = await exportKey(kek);
    kekB64 = Buffer.from(kekRaw).toString('base64');
    await db.update(schema.users).set({ kek: kekB64 }).where(eq(schema.users.id, session.user.id));
  }

  // Load user's KEK
  const kekBuf = Buffer.from(kekB64, 'base64');
  const kekRaw = new Uint8Array(kekBuf.buffer.slice(kekBuf.byteOffset, kekBuf.byteOffset + kekBuf.byteLength) as ArrayBuffer);
  const kek = await importKey(kekRaw);

  // Generate a fresh DEK for this config, wrap it with the KEK
  const dek = await generateKey();
  const dekRaw = await exportKey(dek);
  const wrappedDek = await encrypt(kek, dekRaw);

  // Encrypt the API key with the DEK
  const { iv: keyIv, ciphertext: encryptedKey } = await encryptApiKey(dek, apiKey);

  const [config] = await db
    .insert(schema.modelConfigs)
    .values({
      userId: session.user.id,
      label,
      provider,
      model,
      encryptedKey,
      keyIv,
      keyDekWrapped: Buffer.from(wrappedDek.data).toString('base64'),
      keyDekIv: Buffer.from(wrappedDek.iv).toString('base64'),
    })
    .returning({
      id: schema.modelConfigs.id,
      label: schema.modelConfigs.label,
      provider: schema.modelConfigs.provider,
      model: schema.modelConfigs.model,
      createdAt: schema.modelConfigs.createdAt,
    });

  return NextResponse.json(config, { status: 201 });
}
