export function formatReadingTime(minutes?: number): string {
  if (!minutes) return "";
  if (minutes < 1) return "أقل من دقيقة";
  if (minutes === 1) return "دقيقة واحدة";
  if (minutes === 2) return "دقيقتان";
  if (minutes >= 3 && minutes <= 10) return `${minutes} دقائق`;
  return `${minutes} دقيقة`;
}

/** Server-safe: no access to current time. Use for Server Components / prerender. */
export function formatPublishDate(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("ar-SA", { year: "numeric", month: "long", day: "numeric" });
}
