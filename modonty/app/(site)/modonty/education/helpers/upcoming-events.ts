import type { CalendarEvent } from "./types";

/** The calendar's holidays and school starts from today on — staff-only dates left out; nothing until today is known. */
export function upcomingEvents(events: CalendarEvent[], today: string | null): CalendarEvent[] {
  return today ? events.filter((e) => e.kind !== "staff" && e.date >= today) : [];
}
