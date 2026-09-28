"use client";

import { SITE_LOCALE } from "@modonty/shared/lib/constants/locale";
import { fill } from "@/lib/i18n/fill";

import { formatDates } from "../../helpers/format-dates";
import type { CalendarEvent } from "../../helpers/types";
import { useRiyadhToday } from "../../helpers/use-riyadh-today";

export interface HolidayCountdownLabels {
  title: string;
  today: string;
  tomorrow: string;
  daysFew: string;
  daysMany: string;
  on: string;
  moon: string;
  after: string;
}

const N = new Intl.NumberFormat(SITE_LOCALE);
const DAY_MS = 86_400_000;
const daysBetween = (from: string, to: string) => Math.round((Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / DAY_MS);

/**
 * «كم باقي على الإجازة؟» — the next holiday or school start on the ministry's calendar and the days
 * until it, counted from today in Riyadh. The one question most readers of this page came with.
 */
export function HolidayCountdown({ events, labels: t }: { events: CalendarEvent[]; labels: HolidayCountdownLabels }) {
  const today = useRiyadhToday();
  const upcoming = today ? events.filter((e) => e.kind !== "staff" && e.date >= today) : [];
  const [next, after] = upcoming;

  return (
    <section aria-labelledby="holiday-countdown" className="rounded-lg bg-card p-5 ring-1 ring-border">
      <h2 id="holiday-countdown" className="text-lg font-bold">
        {t.title}
      </h2>
      {!today ? (
        <span aria-hidden className="mt-4 block h-24 animate-pulse rounded-lg bg-muted" />
      ) : next ? (
        <div className="mt-3">
          <p className="text-base font-semibold">{next.name}</p>
          <Remaining days={daysBetween(today, next.date)} labels={t} />
          <p className="mt-1 text-sm text-muted-foreground">{fill(t.on, formatDates(next.date, next.hijri))}</p>
          {next.moon && <p className="mt-1 text-xs text-muted-foreground">{t.moon}</p>}
          {after && (
            <p className="mt-3 border-t border-border pt-3 text-sm">
              <span className="text-muted-foreground">{t.after}: </span>
              <span className="font-semibold">{after.name}</span>
              <span className="text-muted-foreground"> · {formatDates(after.date, after.hijri).gregorian}</span>
            </p>
          )}
        </div>
      ) : null}
    </section>
  );
}

function Remaining({ days, labels: t }: { days: number; labels: HolidayCountdownLabels }) {
  if (days === 0) return <p className="mt-1 text-4xl font-bold text-primary">{t.today}</p>;
  if (days === 1) return <p className="mt-1 text-4xl font-bold text-primary">{t.tomorrow}</p>;
  return (
    <p className="mt-1 flex items-baseline gap-2">
      <span className="text-5xl font-bold tabular-nums text-primary">{N.format(days)}</span>
      <span className="text-lg font-semibold">{days <= 10 ? t.daysFew : t.daysMany}</span>
    </p>
  );
}
