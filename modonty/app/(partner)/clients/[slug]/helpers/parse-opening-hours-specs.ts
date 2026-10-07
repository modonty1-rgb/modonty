import type { OpeningHoursSpec } from "./opening-hours-spec";

/** Defensively turn the JSON value into clean OpeningHoursSpec[] (handles string/array/null). */
export function parseOpeningHoursSpecs(value: unknown): OpeningHoursSpec[] {
  let raw: unknown = value;
  if (typeof raw === "string") {
    try {
      raw = JSON.parse(raw);
    } catch {
      return [];
    }
  }
  if (!Array.isArray(raw)) return [];
  const out: OpeningHoursSpec[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const rec = item as Record<string, unknown>;
    const day = rec.dayOfWeek;
    const validDay =
      typeof day === "string" ||
      (Array.isArray(day) && day.every((d) => typeof d === "string"));
    if (!validDay) continue;
    // Treat explicit closed flag or missing times as closed.
    const closed = rec.closed === true;
    const opens = typeof rec.opens === "string" ? rec.opens : "";
    const closes = typeof rec.closes === "string" ? rec.closes : "";
    out.push({
      dayOfWeek: day as string | string[],
      opens: closed ? "" : opens,
      closes: closed ? "" : closes,
    });
  }
  return out;
}
