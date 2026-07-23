import Link from "next/link";
import { Activity, Calendar, HelpCircle, Mail, MessageSquare, type LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

import { visitorActionsSummary } from "@/lib/dashboard/cached";
import { IBOX, SummaryChip, type Tier } from "../dashboard-ui";
import { CollapsibleSection } from "../collapsible-section";

/**
 * Visitor Actions — what people did to us, last 90 days
 * (contract: admin-dashboard-triage-v2-ui.html).
 *
 * The old "Needs action" summary card is gone: the Today strip above the sections IS
 * that summary now, and repeating the same four numbers side by side was double
 * counting on one row. What remains is the breakdown — four cards, one per channel.
 *
 * Colour is the source, declared once in the heading and obeyed in every row:
 *   amber   → GA4 (what Google saw)
 *   emerald → our database (what we actually have)
 */

type Source = "ga4" | "db";

const tone = (src: Source) =>
  src === "db" ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400";

interface Line {
  value: number;
  label: string;
  src: Source;
}

function InfoCard({
  href,
  tier,
  icon: Icon,
  title,
  headline,
  lines,
}: {
  href: string;
  tier: Tier;
  icon: LucideIcon;
  title: string;
  headline: Line;
  lines: Line[];
}) {
  const n = (v: number) => v.toLocaleString("en-US");
  const top = tier === "hot" ? "border-t-red-500" : tier === "warm" ? "border-t-amber-500" : "border-t-primary";
  return (
    <Link href={href} className="group">
      <Card className={`h-full border-t-2 ${top} transition group-hover:shadow-md`}>
        <CardContent className="flex h-full flex-col gap-1.5 p-3">
          <div className="flex items-center gap-2.5">
            <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${IBOX[tier]}`}>
              <Icon className="h-4 w-4" />
            </span>
            <span className={`text-2xl font-bold leading-none tabular-nums ${tone(headline.src)}`}>
              {n(headline.value)}
            </span>
          </div>
          <p className="text-[11px] font-semibold leading-tight">{title}</p>

          <div>
            {lines.map((l) => (
              <div key={l.label} className="flex items-baseline gap-2 text-[11px] leading-5">
                <span className={`w-8 shrink-0 text-end font-bold tabular-nums ${tone(l.src)}`}>
                  {n(l.value)}
                </span>
                <span className="truncate text-muted-foreground" title={l.label}>
                  {l.label}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-auto pt-1 text-[11px] font-bold text-primary">full report →</div>
        </CardContent>
      </Card>
    </Link>
  );
}

export async function VisitorActionsBreakdown() {
  const { bookings, questions, messages, comments, visitors } = await visitorActionsSummary();

  // Both drop-offs are differences — they only mean something once GA4 has seen
  // booking_attempt. Until then the middle of the funnel reads 0.
  const neverClicked = Math.max(0, bookings.pageViews - bookings.attempts);
  const triedAndFailed = Math.max(0, bookings.attempts - bookings.db);

  return (
    <CollapsibleSection
      iconNode={<Activity className="h-4 w-4 text-muted-foreground" />}
      title="Visitor actions"
        subtitle={
          <>
            last 90 days ·{" "}
            <span className="font-bold text-amber-600 dark:text-amber-400">■ GA4</span> what Google saw
            <span className="text-muted-foreground/40"> · </span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">■ Database</span> what we
            actually have
          </>
        }
        storageKey="dashVisitorOpen"
        summary={
          <>
            <SummaryChip
              icon={Calendar}
              value={bookings.db}
              tier={bookings.attempts === 0 && bookings.pageViews > 0 ? "hot" : "plain"}
            />
            <SummaryChip icon={Mail} value={messages.newCount} tier={messages.newCount > 0 ? "hot" : "plain"} />
            <SummaryChip icon={MessageSquare} value={comments.pending} tier={comments.pending > 0 ? "hot" : "plain"} />
            <SummaryChip icon={HelpCircle} value={questions.unanswered} tier={questions.unanswered > 0 ? "warm" : "plain"} />
          </>
        }
        right={
          <Link
            href="/analytics"
            className="flex items-baseline gap-2 text-xs text-muted-foreground hover:underline"
          >
            <span className="text-base font-bold tabular-nums text-amber-600 dark:text-amber-400">
              {visitors.users.toLocaleString("en-US")}
            </span>
            people
            <span className="text-muted-foreground/40">·</span>
            <span className="font-bold tabular-nums text-amber-600 dark:text-amber-400">
              {visitors.sessions.toLocaleString("en-US")}
            </span>
            sessions
            <span className="text-muted-foreground/40">·</span>
            <span className="font-bold tabular-nums text-red-600 dark:text-red-400">
              {Math.round(visitors.actionRate ?? 0)}%
            </span>
            took action
            <span className="text-muted-foreground/40">·</span>
            {/* The GEO signal — first measured 2026-07-14. Amber = GA4, like the rest of the line. */}
            <span className="font-bold tabular-nums text-amber-600 dark:text-amber-400">
              {visitors.aiSessions.toLocaleString("en-US")}
            </span>
            from AI answers
            <span className="text-primary">→</span>
          </Link>
        }
      >
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 xl:grid-cols-4">
        <InfoCard
          href="/analytics/leads/bookings"
          tier={bookings.attempts === 0 && bookings.pageViews > 0 ? "hot" : "plain"}
          icon={Calendar}
          title="Bookings — where people fall out"
          headline={{ value: bookings.db, label: "booked", src: "db" }}
          lines={[
            { value: bookings.pageViews, label: "opened book page", src: "ga4" },
            { value: neverClicked, label: "left before submit", src: "ga4" },
            { value: bookings.attempts, label: "pressed submit", src: "ga4" },
            { value: triedAndFailed, label: "submit failed", src: "ga4" },
            { value: bookings.leaks.length, label: "clients leaking", src: "db" },
          ]}
        />

        <InfoCard
          href="/analytics/leads?type=MESSAGE"
          tier={messages.newCount > 0 ? "hot" : "plain"}
          icon={Mail}
          title="Messages unread"
          headline={{ value: messages.newCount, label: "unread", src: "db" }}
          lines={[
            { value: messages.ga4, label: "submitted · GA4", src: "ga4" },
            { value: messages.db, label: "we hold", src: "db" },
            { value: messages.replied, label: "replied", src: "db" },
            { value: messages.guest, label: "from guests", src: "db" },
            { value: messages.member, label: "from members", src: "db" },
          ]}
        />

        <InfoCard
          href="/analytics/leads?type=COMMENT"
          tier={comments.pending > 0 ? "hot" : "plain"}
          icon={MessageSquare}
          title="Comments to approve"
          headline={{ value: comments.pending, label: "to approve", src: "db" }}
          lines={[
            { value: comments.ga4, label: "submitted · GA4", src: "ga4" },
            { value: comments.db, label: "we hold", src: "db" },
            { value: comments.approved, label: "approved", src: "db" },
            { value: comments.onArticles, label: "on articles", src: "db" },
            { value: comments.onClients, label: "on client pages", src: "db" },
          ]}
        />

        <InfoCard
          href="/analytics/leads/questions"
          tier={questions.unanswered > 0 ? "warm" : "plain"}
          icon={HelpCircle}
          title="Question unanswered"
          headline={{ value: questions.unanswered, label: "unanswered", src: "db" }}
          lines={[
            { value: questions.ga4, label: "submitted · GA4", src: "ga4" },
            { value: questions.total, label: "we hold", src: "db" },
            { value: questions.fromArticle, label: "on articles", src: "db" },
            { value: questions.fromClient, label: "on client pages", src: "db" },
            { value: questions.oldestWaitingDays ?? 0, label: "days oldest waited", src: "db" },
          ]}
        />
      </div>
    </CollapsibleSection>
  );
}
