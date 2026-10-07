"use client";

import { useEffect, useState } from "react";
import type { OpeningHoursSpec } from "../../helpers/opening-hours-spec";
import { computeOpenStatus, type OpenStatus } from "../../helpers/compute-open-status";
import { formatArabic12h } from "../../helpers/format-arabic-12h";

interface ClientOpenNowBadgeProps {
  specs: OpeningHoursSpec[];
}

/**
 * Open/closed pill computed CLIENT-SIDE only — renders nothing on the first
 * (SSR) paint to avoid a hydration mismatch, then fills in after mount.
 */
export function ClientOpenNowBadge({ specs }: ClientOpenNowBadgeProps) {
  const [status, setStatus] = useState<OpenStatus | null>(null);

  useEffect(() => {
    const now = new Date();
    setStatus(computeOpenStatus(specs, now.getDay(), now.getHours() * 60 + now.getMinutes()));
  }, [specs]);

  if (status === null) {
    // Neutral, zero-CLS placeholder matching the badge footprint.
    return <span className="mb-[11px] block h-[26px]" aria-hidden />;
  }

  if (status.kind === "open") {
    return (
      <span className="mb-[11px] inline-flex items-center gap-1.5 rounded-full border border-success/30 bg-success/10 px-2.5 py-1 text-xs font-extrabold text-success">
        <span className="relative grid h-[7px] w-[7px] place-items-center">
          <span className="absolute h-[7px] w-[7px] animate-ping rounded-full bg-success/60" />
          <span className="h-[7px] w-[7px] rounded-full bg-success shadow-[0_0_0_3px_hsl(var(--success)/0.2)]" />
        </span>
        مفتوح الآن · يغلق {formatArabic12h(status.closes)}
      </span>
    );
  }

  return (
    <span className="mb-[11px] inline-flex items-center gap-1.5 rounded-full border border-border bg-muted px-2.5 py-1 text-xs font-extrabold text-muted-foreground">
      <span className="h-[7px] w-[7px] rounded-full bg-muted-foreground/50" />
      مغلق الآن
    </span>
  );
}
