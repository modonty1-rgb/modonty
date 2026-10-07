/** "HH:MM" (24h) → Arabic 12h with ص/م (e.g. "6:00 م"). */
export function formatArabic12h(time: string): string {
  const match = /^(\d{1,2}):(\d{2})/.exec(time.trim());
  if (!match) return time;
  const h24 = Number(match[1]);
  const m = Number(match[2]);
  if (h24 > 23 || m > 59) return time;
  const suffix = h24 >= 12 ? "م" : "ص";
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${h12}:${m.toString().padStart(2, "0")} ${suffix}`;
}
