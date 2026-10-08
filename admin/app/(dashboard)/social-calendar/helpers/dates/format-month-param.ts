/** `(2026, 9)` → `"2026-10"` — صيغة `[month]` في الرابط. */
export function formatMonthParam(year: number, month: number): string {
  return `${year}-${String(month + 1).padStart(2, "0")}`;
}
