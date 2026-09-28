import type { CalendarEvent } from "../helpers/types";
import raw from "./calendar.json";

/**
 * The Ministry of Education's school calendar for the current school year, copied from its
 * «التقويم الدراسي» page (read 28 Sep 2026) — the page every calendar site in Saudi copies from. It
 * changes once a year, when the ministry publishes the next year.
 */
export const calendar = raw as { source: string; schoolYear: string; events: CalendarEvent[] };
