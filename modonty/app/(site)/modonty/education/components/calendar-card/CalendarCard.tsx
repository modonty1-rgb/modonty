"use client";

import { formatDates } from "../../helpers/format-dates";
import type { CalendarEvent } from "../../helpers/types";
import { useRiyadhToday } from "../../helpers/use-riyadh-today";

export interface CalendarCardLabels {
  title: string;
  note: string;
  staffNote: string;
}

/**
 * The rest of the school year from the ministry's calendar. Dates already gone drop out once the
 * browser knows today — the first rows were August's, which no one opening the page needs.
 */
export function CalendarCard({ events, labels: t }: { events: CalendarEvent[]; labels: CalendarCardLabels }) {
  const today = useRiyadhToday();
  const shown = today ? events.filter((e) => e.date >= today) : events;
  return (
    <section aria-labelledby="school-calendar" className="rounded-lg bg-card p-5 ring-1 ring-border">
      <h2 id="school-calendar" className="text-lg font-bold">
        {t.title}
      </h2>
      <p className="mt-0.5 text-xs text-muted-foreground">{t.note}</p>
      <ol className="mt-2 divide-y divide-border">
        {shown.map((e) => {
          const d = formatDates(e.date, e.hijri);
          return (
            <li key={`${e.date}-${e.name}`} className="py-2 text-sm">
              <p className={`leading-snug ${e.kind === "staff" ? "" : "font-bold"}`}>{e.name}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {d.gregorian} · {d.hijri} هـ{e.kind === "staff" && ` · ${t.staffNote}`}
              </p>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
