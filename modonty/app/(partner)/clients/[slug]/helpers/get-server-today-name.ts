import { DAY_ORDER } from "./opening-hours-days";

/** Today's schema.org day name (note: this is SSR/server time, used only to highlight a row). */
export function getServerTodayName(): string {
  return DAY_ORDER[(new Date().getDay() + 1) % 7] ?? "Saturday";
}
