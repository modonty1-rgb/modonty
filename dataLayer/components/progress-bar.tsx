"use client";

import { cx } from "../lib/cx";

export type ProgressTone = "primary" | "emerald" | "amber" | "red";

const TRACK: Record<ProgressTone, string> = {
  primary: "bg-primary/15",
  emerald: "bg-emerald-500/15",
  amber: "bg-amber-500/15",
  red: "bg-red-500/15",
};

const FILL: Record<ProgressTone, string> = {
  primary: "bg-primary",
  emerald: "bg-emerald-500",
  amber: "bg-amber-500",
  red: "bg-red-500",
};

interface Props {
  /** 0–100. Pass `null` for work whose length is unknown — draws a moving stripe instead. */
  value: number | null;
  tone?: ProgressTone;
  className?: string;
  label?: string;
}

/**
 * One bar for both cases a real upload has: a measured phase (bytes on the wire) and an
 * unmeasured one (the server writing the row). Faking the second as a percentage is the
 * usual lie — the indeterminate stripe says "still working" without inventing a number.
 */
export function ProgressBar({ value, tone = "primary", className, label }: Props) {
  const determinate = value !== null;
  const pct = determinate ? Math.min(100, Math.max(0, value)) : 0;

  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={determinate ? pct : undefined}
      className={cx("relative h-1.5 w-full overflow-hidden rounded-full", TRACK[tone], className)}
    >
      {determinate ? (
        <div
          className={cx("h-full rounded-full transition-[width] duration-200 ease-out", FILL[tone])}
          style={{ width: `${pct}%` }}
        />
      ) : (
        <div
          className={cx("h-full w-1/3 rounded-full", FILL[tone])}
          style={{ animation: "modonty-ui-slide 1.1s ease-in-out infinite" }}
        />
      )}
      {/* Scoped here on purpose: the package ships no stylesheet, so a consumer app never
          has to remember to import one for the animation to exist. */}
      <style>{`@keyframes modonty-ui-slide{0%{transform:translateX(-100%)}100%{transform:translateX(300%)}}`}</style>
    </div>
  );
}
