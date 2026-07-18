import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

/**
 * The dashboard's shared visual language (contract: documents/mockups/
 * admin-dashboard-triage-v2-ui.html, approved 2026-07-13).
 *
 * Three tiers, one meaning everywhere on the page:
 *   hot   (red)   — costing money or a client RIGHT NOW
 *   warm  (amber) — this week's work: SEO, approvals, images
 *   ok    (green) — healthy
 *   plain         — a fact, asks nothing
 *
 * The icon box carries the tier colour so a card is recognisable before it is read —
 * that is the whole point of the icons (Khalid: «خلي التشويش البصري أسهل»).
 */

export type Tier = "hot" | "warm" | "ok" | "plain";

const TOP: Record<Tier, string> = {
  hot: "border-t-red-500",
  warm: "border-t-amber-500",
  ok: "border-t-emerald-500",
  plain: "border-t-primary",
};

const NUM: Record<Tier, string> = {
  hot: "text-red-600 dark:text-red-400",
  warm: "text-amber-600 dark:text-amber-400",
  ok: "text-emerald-600 dark:text-emerald-400",
  plain: "text-foreground",
};

export const IBOX: Record<Tier, string> = {
  hot: "bg-red-500/10 text-red-600 dark:text-red-400",
  warm: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  ok: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  plain: "bg-muted text-muted-foreground",
};

/** 4-up on desktop, 2-up below — every row of the dashboard packs to this grid. */
export const CARD_GRID = "grid grid-cols-2 gap-2.5 xl:grid-cols-4";

export function TierCard({
  href,
  tier,
  icon: Icon,
  value,
  label,
  note,
  children,
}: {
  href: string;
  tier: Tier;
  icon: LucideIcon;
  value: number;
  label: string;
  note?: string;
  children?: React.ReactNode;
}) {
  return (
    <Link href={href} className="group">
      <Card className={`h-full border-t-2 ${TOP[tier]} transition group-hover:shadow-md`}>
        <CardContent className="flex h-full flex-col p-3">
          <div className="flex items-center gap-2.5">
            <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${IBOX[tier]}`}>
              <Icon className="h-4 w-4" />
            </span>
            <span className={`text-2xl font-bold leading-none tabular-nums ${NUM[tier]}`}>
              {value.toLocaleString("en-US")}
            </span>
          </div>
          <p className="pt-2 text-[11px] font-semibold leading-tight">{label}</p>
          {note && <p className="pt-0.5 text-[10px] leading-snug text-muted-foreground">{note}</p>}
          {children}
        </CardContent>
      </Card>
    </Link>
  );
}

/**
 * The cell that fills what used to be a hole in the grid: zero-value stages live here
 * as chips instead of wasting a full card each (Khalid: «المساحات الفاضية لها حل؟»).
 */
export function Ghost({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex h-full min-h-[72px] flex-col items-start justify-center gap-1.5 rounded-xl border border-dashed p-3">
      <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground/70">{title}</p>
      {children}
    </div>
  );
}

export function ZChip({ good, children }: { good?: boolean; children: React.ReactNode }) {
  return (
    <span
      className={`rounded-full border px-2.5 py-0.5 text-[11px] tabular-nums ${
        good
          ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
          : "bg-card text-muted-foreground"
      }`}
    >
      {children}
    </span>
  );
}

export function GroupLabel({
  icon: Icon,
  hint,
  children,
}: {
  icon: LucideIcon;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <p className="mb-2 mt-4 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
      <Icon className="h-3.5 w-3.5" />
      {children}
      {hint && <span className="font-normal normal-case tracking-normal">{hint}</span>}
    </p>
  );
}
