import { NextResponse } from 'next/server';
import { and, eq } from 'drizzle-orm';
import { auth } from '../../../auth';
import { getDb, schema } from '@arena/db';
import { unwrapDek, decryptApiKey } from '@arena/lib/crypto';
import { call } from '@arena/providers';
import type { Provider } from '@arena/lib/types';

interface EssayRequest {
  configAId: string;
  configBId: string;
  prompt: string;
}

function b64ToUint8(b64: string): Uint8Array<ArrayBuffer> {
  const buf = Buffer.from(b64, 'base64');
  return new Uint8Array(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) as ArrayBuffer);
}

async function decryptKey(kekB64: string, config: {
  keyDekWrapped: string;
  keyDekIv: string;
  encryptedKey: string;
  keyIv: string;
}): Promise<string> {
  const kekRaw = b64ToUint8(kekB64);
  const dek = await unwrapDek(kekRaw, {
    iv: b64ToUint8(config.keyDekIv),
    data: b64ToUint8(config.keyDekWrapped),
  });
  return decryptApiKey(dek, config.keyIv, config.encryptedKey);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json() as EssayRequest;
  const { configAId, configBId, prompt } = body;
  if (!configAId || !configBId || !prompt?.trim()) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const db = getDb();

  // Load user's KEK
  const [user] = await db
    .select({ kek: schema.users.kek })
    .from(schema.users)
    .where(eq(schema.users.id, session.user.id));

  if (!user?.kek) return NextResponse.json({ error: 'User keys not set up' }, { status: 400 });

  // Load both model configs (must belong to this user)
  const [configA, configB] = await Promise.all([
    db.select().from(schema.modelConfigs).where(
      and(eq(schema.modelConfigs.id, configAId), eq(schema.modelConfigs.userId, session.user.id))
    ).then(r => r[0]),
    db.select().from(schema.modelConfigs).where(
      and(eq(schema.modelConfigs.id, configBId), eq(schema.modelConfigs.userId, session.user.id))
    ).then(r => r[0]),
  ]);

  if (!configA || !configB) {
    return NextResponse.json({ error: 'Model config not found' }, { status: 404 });
  }

  // Decrypt both API keys
  const [apiKeyA, apiKeyB] = await Promise.all([
    decryptKey(user.kek, configA),
    decryptKey(user.kek, configB),
  ]);

  const systemPrompt = 'You are competing in an essay duel. Write a compelling, well-structured essay in response to the prompt. Be concise but substantive — aim for 3–4 paragraphs. No preamble, no meta-commentary. Just the essay.';

  const startedAt = Date.now();

  // Call both models in parallel
  const [resultA, resultB] = await Promise.all([
    call({
      provider: configA.provider as Provider,
      model: configA.model,
      apiKey: apiKeyA,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt },
      ],
      maxTokens: 1024,
    }),
    call({
      provider: configB.provider as Provider,
      model: configB.model,
      apiKey: apiKeyB,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt },
      ],
      maxTokens: 1024,
    }),
  ]);

  const durationMs = Date.now() - startedAt;

  return NextResponse.json({
    essayA: resultA.text,
    essayB: resultB.text,
    usageA: resultA.usage,
    usageB: resultB.usage,
    durationMs,
  });
}
