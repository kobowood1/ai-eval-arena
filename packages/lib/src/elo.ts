const K = 32;

export function expectedScore(ratingA: number, ratingB: number): number {
  return 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400));
}

export function updateElo(
  ratingA: number,
  ratingB: number,
  outcome: 'A' | 'B' | 'tie',
): { newA: number; newB: number } {
  const ea = expectedScore(ratingA, ratingB);
  const scoreA = outcome === 'A' ? 1 : outcome === 'tie' ? 0.5 : 0;
  const newA = Math.round(ratingA + K * (scoreA - ea));
  const newB = Math.round(ratingB + K * (1 - scoreA - (1 - ea)));
  return { newA, newB };
}
