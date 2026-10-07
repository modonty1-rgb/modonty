import type { OpeningHoursSpec } from "./opening-hours-spec";
import { toMinutes } from "./to-minutes";

// schema.org full English day names → JS getDay() index (0 = Sunday).
const DAY_INDEX: Record<string, number> = {
  Sunday: 0,
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4,
  Friday: 5,
  Saturday: 6,
};

export type OpenStatus =
  | { kind: "open"; closes: string }
  | { kind: "closed" };

/** Decide open/closed for the supplied weekday + minute-of-day. */
export function computeOpenStatus(
  specs: OpeningHoursSpec[],
  weekday: number,
  nowMinutes: number
): OpenStatus {
  for (const spec of specs) {
    const days = Array.isArray(spec.dayOfWeek) ? spec.dayOfWeek : [spec.dayOfWeek];
    if (!days.some((d) => DAY_INDEX[d] === weekday)) continue;
    const opens = toMinutes(spec.opens);
    const closes = toMinutes(spec.closes);
    if (opens === null || closes === null) continue;
    // Same-day window (handles overnight as a simple within-range check).
    const within =
      closes > opens
        ? nowMinutes >= opens && nowMinutes < closes
        : nowMinutes >= opens || nowMinutes < closes;
    if (within) return { kind: "open", closes: spec.closes };
  }
  return { kind: "closed" };
}
