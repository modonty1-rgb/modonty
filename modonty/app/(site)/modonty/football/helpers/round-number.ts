/** «Regular Season - 8» → 8. Null when the round is not a numbered league round. */
export function roundNumber(round: string | null): number | null {
  const n = round?.match(/Regular Season - (\d+)/)?.[1];
  return n ? Number(n) : null;
}
