import Link from "next/link";
import { format } from "date-fns";
import {
  AlertTriangle,
  CalendarX,
  FileCheck,
  FileX,
  Inbox,
  UserX,
  type LucideIcon,
} from "lucide-react";
import { ArticleStatus } from "@prisma/client";

import {
  visitorActionsSummary,
  clientStatusCounts,
  articleStatusCounts,
} from "@/lib/dashboard/cached";
import { IBOX, type Tier } from "../dashboard-ui";

/**
 * The page's answer to its own title (contract: admin-dashboard-triage-v2-ui.html).
 * "What needs you today" used to be scattered across ~14 red numbers on two screens;
 * this strip IS the ranked answer, built from the SAME cached fetches the sections
 * below consume — so it can never disagree with them.
 *
 * The order is a fixed business rule, not a sort: money/client first, then the inbox,
 * then content. A row only appears while its number is above zero, so on a clean day
 * the strip collapses to one green line.
 */

interface TodayItem {
  tier: Extract<Tier, "hot" | "warm">;
  icon: LucideIcon;
  num: React.ReactNode;
  text: React.ReactNode;
  ctx: string;
  href: string;
  go: string;
}

const RAIL: Record<TodayItem["tier"], string> = {
  hot: "bg-red-500",
  warm: "bg-amber-500",
};
const NUM: Record<TodayItem["tier"], string> = {
  hot: "text-red-600 dark:text-red-400",
  warm: "text-amber-600 dark:text-amber-400",
};

export async function TodayStrip() {
  const [va, clients, articles] = await Promise.all([
    visitorActionsSummary(),
    clientStatusCounts(),
    articleStatusCounts(),
  ]);

  const items: TodayItem[] = [];

  // 1 · The funnel. Opens with zero submit attempts is a dead form, not slow business.
  if (va.bookings.pageViews > 0 && va.bookings.attempts === 0) {
    const top = va.bookings.leaks[0];
    items.push({
      tier: "hot",
      icon: CalendarX,
      num: (
        <>
          {va.bookings.pageViews} <small className="text-xs font-semibold text-muted-foreground">→ 0</small>
        </>
      ),
      text: (
        <>
          <b>The booking funnel is dead.</b> {va.bookings.pageViews} opened the book page, 0 pressed
          submit (90d).
        </>
      ),
      ctx: top
        ? `${va.bookings.leaks.length} clients leaking — ${top.name} alone: ${top.opened} opens, 0 bookings`
        : `${va.bookings.leaks.length} clients leaking`,
      href: "/analytics/leads/bookings",
      go: "investigate",
    });
  }

  // 2 · Unreachable clients — NONE plus the missing-field ones.
  const unreachable = clients.contact.none + clients.contact.unset;
  if (unreachable > 0) {
    const pct = clients.total > 0 ? Math.round((unreachable / clients.total) * 100) : 0;
    items.push({
      tier: "hot",
      icon: UserX,
      num: (
        <>
          {unreachable}
          <small className="text-xs font-semibold text-muted-foreground">/{clients.total}</small>
        </>
      ),
      text: (
        <>
          <b>{unreachable} clients are unreachable.</b> No working contact button on their page.
        </>
      ),
      ctx: `${clients.contact.unset} CTA never set · ${clients.contact.none} no button — ${pct}% of the book cannot convert`,
      href: "/clients/segment/unreachable",
      go: "fix CTAs",
    });
  }

  // 3 · The inbox — everything a visitor did that still waits for a human.
  if (va.needsAction.total > 0) {
    const oldest = va.questions.oldestWaitingDays;
    items.push({
      tier: "hot",
      icon: Inbox,
      num: va.needsAction.total,
      text: (
        <>
          <b>{va.needsAction.total} visitor actions are waiting on you.</b>
        </>
      ),
      ctx: `${va.needsAction.messages} messages · ${va.needsAction.comments} comments · ${va.needsAction.bookings} bookings to call · ${va.needsAction.questions} question${va.needsAction.questions === 1 ? "" : "s"}${oldest ? ` (oldest ${oldest} days)` : ""}`,
      href: "/analytics/leads?status=new",
      go: "clear inbox",
    });
  }

  // 4 · Approvals — ours and theirs.
  const awaiting = articles[ArticleStatus.AWAITING_APPROVAL];
  if (awaiting > 0) {
    items.push({
      tier: "warm",
      icon: FileCheck,
      num: awaiting,
      text: (
        <>
          <b>
            {awaiting} article{awaiting === 1 ? " waits" : "s wait"} for approval.
          </b>
        </>
      ),
      ctx: `plus ${clients.content.awaitingApproval} clients sitting on their own sign-off — chase them`,
      href: "/articles/segment/awaiting-approval",
      go: "review",
    });
  }

  // 5 · Paying for silence.
  if (clients.content.noArticles > 0) {
    items.push({
      tier: "warm",
      icon: FileX,
      num: clients.content.noArticles,
      text: (
        <>
          <b>{clients.content.noArticles} clients are paying with zero articles.</b>
        </>
      ),
      ctx: "paying for silence — the next churn list",
      href: "/clients/segment/no-articles",
      go: "see who",
    });
  }

  const hot = items.filter((i) => i.tier === "hot").length;
  const warm = items.filter((i) => i.tier === "warm").length;
  const moneyFine =
    clients.needsYou.overdue + clients.needsYou.expired + clients.needsYou.expiringSoon === 0;

  return (
    <div>
      {/* Page head + the pulse — the whole page in three pills. */}
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold leading-tight">Dashboard</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {format(new Date(), "EEEE, MMM d, yyyy")} — what needs you today
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {hot > 0 && (
            <span className="rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1 text-[11px] font-bold text-red-600 dark:text-red-400">
              <span className="text-[13px] tabular-nums">{hot}</span> costing you now
            </span>
          )}
          {warm > 0 && (
            <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-[11px] font-bold text-amber-600 dark:text-amber-400">
              <span className="text-[13px] tabular-nums">{warm}</span> this week
            </span>
          )}
          <span
            className={`rounded-full border px-3 py-1 text-[11px] font-bold ${
              moneyFine
                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                : "border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400"
            }`}
          >
            {moneyFine ? "money is fine" : "money needs you"}
          </span>
        </div>
      </div>

      {/* The ranked strip. */}
      <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b px-4 py-2.5">
          <span className="flex items-center gap-2 text-[13px] font-extrabold">
            <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
            Today — start here
          </span>
          <span className="text-[10.5px] text-muted-foreground">
            ranked by cost
            <span className="mx-1.5 inline-block h-1.5 w-1.5 rounded-full bg-red-500" />
            money / client
            <span className="mx-1.5 inline-block h-1.5 w-1.5 rounded-full bg-amber-500" />
            this week
          </span>
        </div>

        {items.length === 0 ? (
          <p className="px-4 py-4 text-sm font-semibold text-emerald-600 dark:text-emerald-400">
            ✓ Nothing is costing you today.
          </p>
        ) : (
          items.map((item, i) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="relative grid grid-cols-[1.75rem_2.25rem_6.5rem_1fr] items-center gap-3 border-b px-4 py-2.5 transition last:border-b-0 hover:bg-muted/40 md:grid-cols-[1.75rem_2.25rem_6.5rem_1fr_auto]"
              >
                <span className={`absolute inset-y-0 start-0 w-0.5 ${RAIL[item.tier]}`} />
                <span className="justify-self-center text-xs font-extrabold text-muted-foreground/60">
                  {i + 1}
                </span>
                <span
                  className={`flex h-[30px] w-[30px] items-center justify-center rounded-lg ${IBOX[item.tier]}`}
                >
                  <Icon className="h-4 w-4" />
                </span>
                <span className={`text-xl font-extrabold leading-none tabular-nums ${NUM[item.tier]}`}>
                  {item.num}
                </span>
                <span className="text-[13px] leading-snug">
                  {item.text}
                  <span className="mt-0.5 block text-[11px] text-muted-foreground">{item.ctx}</span>
                </span>
                <span className="hidden text-[11.5px] font-bold text-primary md:block">
                  {item.go} →
                </span>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
