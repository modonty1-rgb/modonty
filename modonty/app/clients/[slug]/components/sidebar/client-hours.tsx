import { SectionCard } from "@/app/clients/[slug]/components/sections/section-card";

import { ClientOpenNowBadge } from "./client-open-now-badge";

interface ClientHoursProps {
  openingHours: unknown;
}

interface ParsedSpec {
  dayOfWeek: string | string[];
  opens: string;
  closes: string;
}

// schema.org full English day names — Saturday→Friday (Gulf week order).
const DAY_ORDER = [
  "Saturday",
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
] as const;

const DAY_LABELS_AR: Record<string, string> = {
  Saturday: "السبت",
  Sunday: "الأحد",
  Monday: "الإثنين",
  Tuesday: "الثلاثاء",
  Wednesday: "الأربعاء",
  Thursday: "الخميس",
  Friday: "الجمعة",
};

/** "HH:MM" (24h) → Arabic 12h with ص/م (e.g. "6:00 م"). */
function formatArabic12h(time: string): string {
  const match = /^(\d{1,2}):(\d{2})/.exec(time.trim());
  if (!match) return time;
  const h24 = Number(match[1]);
  const m = Number(match[2]);
  if (h24 > 23 || m > 59) return time;
  const suffix = h24 >= 12 ? "م" : "ص";
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${h12}:${m.toString().padStart(2, "0")} ${suffix}`;
}

/** Defensively turn the JSON value into clean ParsedSpec[] (handles string/array/null). */
function parseSpecs(value: unknown): ParsedSpec[] {
  let raw: unknown = value;
  if (typeof raw === "string") {
    try {
      raw = JSON.parse(raw);
    } catch {
      return [];
    }
  }
  if (!Array.isArray(raw)) return [];
  const out: ParsedSpec[] = [];
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

interface DisplayRow {
  label: string;
  time: string;
  isToday: boolean;
}

/** Map specs onto the 7-day order, group consecutive same-time days into ranges. */
function buildRows(specs: ParsedSpec[], todayName: string): DisplayRow[] {
  const byDay = new Map<string, { opens: string; closes: string }>();
  for (const spec of specs) {
    const days = Array.isArray(spec.dayOfWeek) ? spec.dayOfWeek : [spec.dayOfWeek];
    for (const d of days) {
      if (d in DAY_LABELS_AR) byDay.set(d, { opens: spec.opens, closes: spec.closes });
    }
  }
  if (byDay.size === 0) return [];

  const timeFor = (day: string): string => {
    const entry = byDay.get(day);
    if (!entry || !entry.opens || !entry.closes) return "مغلق";
    return `${formatArabic12h(entry.opens)} – ${formatArabic12h(entry.closes)}`;
  };

  // Only include days that exist in the data, preserving the Gulf week order.
  const present: string[] = DAY_ORDER.filter((d) => byDay.has(d));
  const orderOf = (day: string): number => DAY_ORDER.indexOf(day as (typeof DAY_ORDER)[number]);
  const rows: DisplayRow[] = [];
  let i = 0;
  while (i < present.length) {
    const startDay = present[i];
    const time = timeFor(startDay);
    let j = i;
    // Extend the range while the next day is contiguous AND shares the same time.
    while (
      j + 1 < present.length &&
      orderOf(present[j + 1]) === orderOf(present[j]) + 1 &&
      timeFor(present[j + 1]) === time
    ) {
      j++;
    }
    const endDay = present[j];
    const label =
      startDay === endDay
        ? DAY_LABELS_AR[startDay]
        : `${DAY_LABELS_AR[startDay]} – ${DAY_LABELS_AR[endDay]}`;
    const isToday = present.slice(i, j + 1).includes(todayName);
    rows.push({ label, time, isToday });
    i = j + 1;
  }
  return rows;
}

/** Today's schema.org day name (note: this is SSR/server time, used only to highlight a row). */
function serverTodayName(): string {
  return DAY_ORDER[(new Date().getDay() + 1) % 7] ?? "Saturday";
}

/** True when opening-hours data parses to ≥1 visible row — mirrors ClientHours's own render gate (avoids dead nav anchors). */
export function hasOpeningHours(openingHours: unknown): boolean {
  const specs = parseSpecs(openingHours);
  if (specs.length === 0) return false;
  return buildRows(specs, serverTodayName()).length > 0;
}

/** Opening hours sidebar card — hides entirely when the data is unparseable/empty. */
export function ClientHours({ openingHours }: ClientHoursProps) {
  const specs = parseSpecs(openingHours);
  if (specs.length === 0) return null;

  const rows = buildRows(specs, serverTodayName());
  if (rows.length === 0) return null;

  return (
    <SectionCard id="hours" icon="🕐" title="ساعات العمل">
      <ClientOpenNowBadge specs={specs} />
      <div className="flex flex-col gap-1.5">
        {rows.map((row, idx) => (
          <div
            key={`${row.label}-${idx}`}
            className="flex items-center justify-between border-b border-dashed border-border py-[5px] text-[12.5px] last:border-0"
          >
            <span className="text-muted-foreground">{row.label}</span>
            <span className={row.isToday ? "font-extrabold text-success" : "font-extrabold text-foreground"}>
              {row.time}
            </span>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}
