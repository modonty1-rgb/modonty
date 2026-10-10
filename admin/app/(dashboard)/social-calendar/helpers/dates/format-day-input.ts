/** `(2026, 9, 5)` → `"2026-10-05"` — قيمة اليوم كما يرسلها النموذج للخادم. */
export function formatDayInput(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}
