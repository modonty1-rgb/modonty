"use client";

import { useEffect, useState } from "react";

interface OpeningHoursSpec {
  dayOfWeek: string | string[];
  opens: string;
  closes: string;
}

interface ClientOpenNowBadgeProps {
  specs: OpeningHoursSpec[];
}

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

/** "HH:MM" → minutes since midnight, or null if malformed. */
function toMinutes(time: string): number | null {
  const match = /^(\d{1,2}):(\d{2})/.exec(time.trim());
  if (!match) return null;
  const h = Number(match[1]);
  const m = Number(match[2]);
  if (h > 23 || m > 59) return null;
  return h * 60 + m;
}

/** "HH:MM" (24h) → Arabic 12h with ص/م (e.g. "6:00 م"). */
function formatArabic12h(time: string): string {
  const mins = toMinutes(time);
  if (mins === null) return time;
  const h24 = Math.floor(mins / 60);
  const m = mins % 60;
  const suffix = h24 >= 12 ? "م" : "ص";
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${h12}:${m.toString().padStart(2, "0")} ${suffix}`;
}

type Status =
  | { kind: "open"; closes: string }
  | { kind: "closed" };

/** Decide open/closed for the supplied weekday + minute-of-day. */
function computeStatus(
  specs: OpeningHoursSpec[],
  weekday: number,
  nowMinutes: number
): Status {
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

/**
 * Open/closed pill computed CLIENT-SIDE only — renders nothing on the first
 * (SSR) paint to avoid a hydration mismatch, then fills in after mount.
 */
export function ClientOpenNowBadge({ specs }: ClientOpenNowBadgeProps) {
  const [status, setStatus] = useState<Status | null>(null);

  useEffect(() => {
    const now = new Date();
    setStatus(computeStatus(specs, now.getDay(), now.getHours() * 60 + now.getMinutes()));
  }, [specs]);

  if (status === null) {
    // Neutral, zero-CLS placeholder matching the badge footprint.
    return <span className="mb-[11px] block h-[26px]" aria-hidden />;
  }

  if (status.kind === "open") {
    return (
      <span className="mb-[11px] inline-flex items-center gap-1.5 rounded-full border border-success/30 bg-success/10 px-2.5 py-1 text-[11.5px] font-extrabold text-success">
        <span className="relative grid h-[7px] w-[7px] place-items-center">
          <span className="absolute h-[7px] w-[7px] animate-ping rounded-full bg-success/60" />
          <span className="h-[7px] w-[7px] rounded-full bg-success shadow-[0_0_0_3px_hsl(var(--success)/0.2)]" />
        </span>
        مفتوح الآن · يغلق {formatArabic12h(status.closes)}
      </span>
    );
  }

  return (
    <span className="mb-[11px] inline-flex items-center gap-1.5 rounded-full border border-border bg-muted px-2.5 py-1 text-[11.5px] font-extrabold text-muted-foreground">
      <span className="h-[7px] w-[7px] rounded-full bg-muted-foreground/50" />
      مغلق الآن
    </span>
  );
}
