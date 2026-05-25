import { NextResponse } from 'next/server';
import { eq, and } from 'drizzle-orm';
import { auth } from '../../../auth';
import { getDb, schema } from '@arena/db';
import { updateElo } from '@arena/lib/elo';
import type { MatchWinner } from '@arena/lib/types';

interface MatchRequest {
  configAId: string;
  configBId: string;
  mode: 'essay' | 'chess' | 'tank';
  winner: MatchWinner;
  durationMs: number;
  totalTokensA: number;
  totalTokensB: number;
  estimatedCostUsd?: number;
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json() as MatchRequest;
  const { configAId, configBId, mode, winner, durationMs, totalTokensA, totalTokensB, estimatedCostUsd } = body;

  if (!configAId || !configBId || !mode || !winner) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const db = getDb();

  // Verify configs belong to this user
  const [configA, configB] = await Promise.all([
    db.select({ provider: schema.modelConfigs.provider, model: schema.modelConfigs.model })
      .from(schema.modelConfigs)
      .where(and(eq(schema.modelConfigs.id, configAId), eq(schema.modelConfigs.userId, session.user.id)))
      .then(r => r[0]),
    db.select({ provider: schema.modelConfigs.provider, model: schema.modelConfigs.model })
      .from(schema.modelConfigs)
      .where(and(eq(schema.modelConfigs.id, configBId), eq(schema.modelConfigs.userId, session.user.id)))
      .then(r => r[0]),
  ]);

  if (!configA || !configB) {
    return NextResponse.json({ error: 'Model config not found' }, { status: 404 });
  }

  // Write match record
  const [match] = await db
    .insert(schema.matches)
    .values({
      userId: session.user.id,
      mode,
      fighterAConfigId: configAId,
      fighterBConfigId: configBId,
      winner,
      durationMs,
      totalTokensA,
      totalTokensB,
      estimatedCostUsd: estimatedCostUsd?.toFixed(6),
      finishedAt: new Date(),
    })
    .returning({ id: schema.matches.id });

  // Update ELO ratings for both fighters
  const identifierA = `${configA.provider}/${configA.model}`;
  const identifierB = `${configB.provider}/${configB.model}`;

  const getOrCreateRating = async (modelIdentifier: string) => {
    const existing = await db
      .select({ id: schema.ratings.id, elo: schema.ratings.elo, wins: schema.ratings.wins, losses: schema.ratings.losses, ties: schema.ratings.ties })
      .from(schema.ratings)
      .where(and(eq(schema.ratings.modelIdentifier, modelIdentifier), eq(schema.ratings.mode, mode)))
      .then(r => r[0]);

    if (existing) return existing;

    const [created] = await db
      .insert(schema.ratings)
      .values({ modelIdentifier, mode, elo: 1500, wins: 0, losses: 0, ties: 0 })
      .returning({ id: schema.ratings.id, elo: schema.ratings.elo, wins: schema.ratings.wins, losses: schema.ratings.losses, ties: schema.ratings.ties });
    return created!;
  };

  const [ratingA, ratingB] = await Promise.all([
    getOrCreateRating(identifierA),
    getOrCreateRating(identifierB),
  ]);

  const outcome = winner === 'A' ? 'A' : winner === 'B' ? 'B' : 'tie';
  const { newA, newB } = updateElo(ratingA.elo, ratingB.elo, outcome as 'A' | 'B' | 'tie');

  await Promise.all([
    db.update(schema.ratings).set({
      elo: newA,
      wins: outcome === 'A' ? ratingA.wins + 1 : ratingA.wins,
      losses: outcome === 'B' ? ratingA.losses + 1 : ratingA.losses,
      ties: outcome === 'tie' ? ratingA.ties + 1 : ratingA.ties,
      updatedAt: new Date(),
    }).where(eq(schema.ratings.id, ratingA.id)),
    db.update(schema.ratings).set({
      elo: newB,
      wins: outcome === 'B' ? ratingB.wins + 1 : ratingB.wins,
      losses: outcome === 'A' ? ratingB.losses + 1 : ratingB.losses,
      ties: outcome === 'tie' ? ratingB.ties + 1 : ratingB.ties,
      updatedAt: new Date(),
    }).where(eq(schema.ratings.id, ratingB.id)),
  ]);

  return NextResponse.json({ matchId: match!.id }, { status: 201 });
}
