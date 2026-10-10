/** حدّا الشهر `[start, end)` على `scheduledFor` — لاستعلام شهر واحد. */
export function monthRange(year: number, month: number): { start: Date; end: Date } {
  return { start: new Date(Date.UTC(year, month, 1)), end: new Date(Date.UTC(year, month + 1, 1)) };
}
