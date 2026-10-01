import Link from "next/link";
import { Calendar, HelpCircle, Mail, MessageSquare, type LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

import { visitorActionsSummary } from "@/lib/dashboard/cached";
import { IBOX, type Tier } from "../dashboard-ui";
import { PanelHead } from "../panel-head";

/**
 * Visitor Actions — what people did to us, last 90 days.
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
          <p className="text-xs font-semibold leading-tight">{title}</p>

          <div>
            {lines.map((l) => (
              <div key={l.label} className="flex items-baseline gap-2 text-xs leading-5">
                <span className={`w-8 shrink-0 text-end font-bold tabular-nums ${tone(l.src)}`}>
                  {n(l.value)}
                </span>
                <span className="truncate text-muted-foreground" title={l.label}>
                  {l.label}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-auto pt-1 text-xs font-bold text-primary">التقرير الكامل ←</div>
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
    <>
      <PanelHead
        title="تصرفات الزوار"
        hint={
          <>
            آخر 90 يوم ·{" "}
            <span className="font-bold text-amber-600 dark:text-amber-400">■ GA4</span> ما شافه جوجل
            <span className="text-muted-foreground/40"> · </span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">■ القاعدة</span> ما عندنا فعلاً
          </>
        }
        right={
          <Link href="/analytics" className="flex items-baseline gap-2 text-xs text-muted-foreground hover:underline">
            <span className="text-base font-bold tabular-nums text-amber-600 dark:text-amber-400">
              {visitors.users.toLocaleString("en-US")}
            </span>
            شخص
            <span className="text-muted-foreground/40">·</span>
            <span className="font-bold tabular-nums text-amber-600 dark:text-amber-400">
              {visitors.sessions.toLocaleString("en-US")}
            </span>
            جلسة
            <span className="text-muted-foreground/40">·</span>
            <span className="font-bold tabular-nums text-red-600 dark:text-red-400">
              {Math.round(visitors.actionRate ?? 0)}%
            </span>
            تفاعلوا
            <span className="text-muted-foreground/40">·</span>
            <span className="font-bold tabular-nums text-amber-600 dark:text-amber-400">
              {visitors.aiSessions.toLocaleString("en-US")}
            </span>
            من إجابات الذكاء
            <span className="text-primary">←</span>
          </Link>
        }
      />
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 xl:grid-cols-4">
        <InfoCard
          href="/analytics/leads/bookings"
          tier={bookings.attempts === 0 && bookings.pageViews > 0 ? "hot" : "plain"}
          icon={Calendar}
          title="الحجز — وين يطيح الناس"
          headline={{ value: bookings.db, label: "حجز", src: "db" }}
          lines={[
            { value: bookings.pageViews, label: "فتحوا صفحة الحجز", src: "ga4" },
            { value: neverClicked, label: "خرجوا قبل الإرسال", src: "ga4" },
            { value: bookings.attempts, label: "ضغطوا إرسال", src: "ga4" },
            { value: triedAndFailed, label: "فشل الإرسال", src: "ga4" },
            { value: bookings.leaks.length, label: "عملاء يتسرّب منهم الحجز", src: "db" },
          ]}
        />

        <InfoCard
          href="/analytics/leads?type=MESSAGE"
          tier={messages.newCount > 0 ? "hot" : "plain"}
          icon={Mail}
          title="رسائل بلا رد"
          headline={{ value: messages.newCount, label: "بلا رد", src: "db" }}
          lines={[
            { value: messages.ga4, label: "أُرسلت · GA4", src: "ga4" },
            { value: messages.db, label: "عندنا في القاعدة", src: "db" },
            { value: messages.replied, label: "رُدّ عليها", src: "db" },
            { value: messages.guest, label: "من ضيوف", src: "db" },
            { value: messages.member, label: "من أعضاء", src: "db" },
          ]}
        />

        <InfoCard
          href="/analytics/leads?type=COMMENT"
          tier={comments.pending > 0 ? "hot" : "plain"}
          icon={MessageSquare}
          title="تعليقات للموافقة"
          headline={{ value: comments.pending, label: "للموافقة", src: "db" }}
          lines={[
            { value: comments.ga4, label: "أُرسلت · GA4", src: "ga4" },
            { value: comments.db, label: "عندنا في القاعدة", src: "db" },
            { value: comments.approved, label: "معتمدة", src: "db" },
            { value: comments.onArticles, label: "على مقالات", src: "db" },
            { value: comments.onClients, label: "على صفحات عملاء", src: "db" },
          ]}
        />

        <InfoCard
          href="/analytics/leads/questions"
          tier={questions.unanswered > 0 ? "warm" : "plain"}
          icon={HelpCircle}
          title="أسئلة بلا جواب"
          headline={{ value: questions.unanswered, label: "بلا جواب", src: "db" }}
          lines={[
            { value: questions.ga4, label: "أُرسلت · GA4", src: "ga4" },
            { value: questions.total, label: "عندنا في القاعدة", src: "db" },
            { value: questions.fromArticle, label: "على مقالات", src: "db" },
            { value: questions.fromClient, label: "على صفحات عملاء", src: "db" },
            { value: questions.oldestWaitingDays ?? 0, label: "أيام أقدم انتظار", src: "db" },
          ]}
        />
      </div>
    </>
  );
}
