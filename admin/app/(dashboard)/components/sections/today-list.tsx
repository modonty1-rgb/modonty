import { cache } from "react";
import Link from "next/link";
import { ArticleStatus } from "@prisma/client";
import { CheckCircle2, ListChecks } from "lucide-react";

import { visitorActionsSummary, clientStatusCounts, articleStatusCounts } from "@/lib/dashboard/cached";
import { getAwaitingActivationTotals } from "@/lib/orders/awaiting-activation";
import { getRenewalsDue } from "@/lib/orders/renewals-due";
import { getDashboardAlerts } from "@/app/(dashboard)/actions/dashboard-actions";
import { getErrorsToFix } from "@/app/(dashboard)/actions/errors-to-fix";
import { currencyLabel } from "@modonty/shared/lib/commercial/format-money";
import { cn } from "@/lib/utils";

/**
 * «يحتاجك اليوم» — the dashboard's answer to its own title (Khalid, 30 Sep 2026: approved
 * mockup). It merges what used to be four separate blocks — the Today strip, the paid-order
 * activation card, the renewals card and the «Needs attention» chips — into ONE ranked list,
 * each row a sentence, a number and the page that fixes it.
 *
 * Every number comes from the same fetch the old block used (and the tabs below reuse the
 * cached ones), so nothing here can disagree with the detail it links to. A row appears only
 * while its number is above zero; WhatsApp is the one status row shown even at zero
 * (Khalid: «اعرضه حتى لو أصفار»).
 */

type Tier = "money" | "hot" | "warm" | "ok" | "plain";

interface Row {
  tier: Tier;
  num: React.ReactNode;
  unit: string;
  title: string;
  ctx: string;
  href: string;
  go: string;
  /** A second destination under the row — kept when two old blocks linked the same fact to two pages. */
  extra?: { href: string; label: string };
}

const RAIL: Record<Tier, string> = {
  money: "bg-red-600",
  hot: "bg-orange-500",
  warm: "bg-sky-400",
  ok: "bg-emerald-500",
  plain: "bg-muted-foreground/40",
};

const n = (v: number) => v.toLocaleString("en-US");

function money(minor: number, currency: string) {
  return `${new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(minor / 100)} ${currencyLabel(currency)}`;
}

/** One computation per request, read by the header pills and by the list. */
const getToday = cache(async () => {
  const [va, clients, articles, awaiting, renewals, alerts, errors] = await Promise.all([
    visitorActionsSummary(),
    clientStatusCounts(),
    articleStatusCounts(),
    getAwaitingActivationTotals(),
    getRenewalsDue(),
    getDashboardAlerts(),
    getErrorsToFix(),
  ]);

  // ── فلوس ────────────────────────────────────────────────────────────────
  const moneyRows: Row[] = [];
  if (awaiting.count > 0) {
    moneyRows.push({
      tier: "money",
      num: n(awaiting.count),
      unit: "طلب",
      title: awaiting.count === 1 ? "طلب مدفوع ينتظر التفعيل" : "طلبات مدفوعة تنتظر التفعيل",
      ctx:
        // كل عملةٍ وحدها — لا يُجمع ريالٌ على جنيه.
        `${awaiting.byCurrency.map((c) => money(c.totalMinor, c.currency)).join(" + ")} وصلت، والخدمة ما بدأت` +
        (awaiting.oldestDays !== null && awaiting.oldestDays > 0 ? ` · أقدمها من ${n(awaiting.oldestDays)} يوم` : ""),
      href: "/orders?view=awaiting-activation",
      go: "فعّل",
    });
  }
  if (renewals.expired > 0) {
    moneyRows.push({
      tier: "money",
      num: n(renewals.expired),
      unit: "عميل",
      title: "اشتراكات انتهت ولم تُجدَّد",
      ctx:
        (renewals.soon > 0 ? `و${n(renewals.soon)} تنتهي خلال شهر · ` : "") +
        (renewals.worstDaysPast !== null ? `أقدمها مضى عليها ${n(renewals.worstDaysPast)} يوم` : "الخدمة تُقدَّم بلا مقابل"),
      href: "/orders?view=expired",
      go: "جدّد",
      // `/clients?filter=expired` (the old chip) opened the full list — /clients reads no `filter`.
      extra: { href: "/clients/segment/expired", label: "قائمة العملاء المنتهين" },
    });
  } else if (renewals.soon > 0) {
    moneyRows.push({
      tier: "money",
      num: n(renewals.soon),
      unit: "عميل",
      title: "اشتراكات تنتهي خلال شهر",
      ctx: "جدِّدها قبل أن تنقطع الخدمة",
      href: "/orders",
      go: "جدّد",
    });
  }
  if (alerts.expiringSubscriptions.length > 0) {
    moneyRows.push({
      tier: "money",
      num: n(alerts.expiringSubscriptions.length),
      unit: "عميل",
      title: "اشتراكات تنتهي خلال أسبوع",
      ctx: "اتصل بهم قبل ما ينقطع",
      href: "/clients/segment/expiring-soon",
      go: "اعرض",
    });
  }
  if (alerts.overduePayments.length > 0) {
    moneyRows.push({
      tier: "money",
      num: n(alerts.overduePayments.length),
      unit: "عميل",
      title: "فواتير متأخرة الدفع",
      ctx: "عليهم مبلغ لنا",
      href: "/clients/segment/overdue",
      go: "اعرض",
    });
  }

  // ── عاجل ────────────────────────────────────────────────────────────────
  const hotRows: Row[] = [];
  if (va.needsAction.messages > 0) {
    hotRows.push({
      tier: "hot",
      num: n(va.needsAction.messages),
      unit: "رسالة",
      title: va.needsAction.messages === 1 ? "شخص راسلك مباشرة" : `${n(va.needsAction.messages)} أشخاص راسلوك مباشرة`,
      ctx: "من صفحة التواصل في مدونتي — المرسل ينتظر ردّك",
      href: "/contact-messages",
      go: "ردّ",
    });
  }
  // صفحة الحجز تُفتح وما أحد ضغط إرسال = نموذجٌ ميّت، لا عملٌ بطيء.
  if (va.bookings.pageViews > 0 && va.bookings.attempts === 0) {
    const top = va.bookings.leaks[0];
    hotRows.push({
      tier: "hot",
      num: `${n(va.bookings.pageViews)} ← 0`,
      unit: "حجز",
      title: `مسار الحجز ميّت — ${n(va.bookings.pageViews)} فتحوا صفحة الحجز و0 ضغطوا إرسال (90 يوم)`,
      ctx: top
        ? `${n(va.bookings.leaks.length)} عملاء يتسرّب منهم الحجز — ${top.name} وحده: ${n(top.opened)} فتح و0 حجز`
        : `${n(va.bookings.leaks.length)} عملاء يتسرّب منهم الحجز`,
      href: "/analytics/leads/bookings",
      go: "افحص",
    });
  }
  const unreachable = clients.contact.none + clients.contact.unset;
  if (unreachable > 0) {
    const pct = clients.total > 0 ? Math.round((unreachable / clients.total) * 100) : 0;
    hotRows.push({
      tier: "hot",
      num: `${n(unreachable)}/${n(clients.total)}`,
      unit: "عميل",
      title: "عملاء ما يوصلهم الزائر — بلا زر تواصل يعمل",
      ctx: `${n(clients.contact.unset)} الزر ما انضبط · ${n(clients.contact.none)} بلا زر — ${pct}٪ من العملاء ما يقدروا يحوّلوا`,
      href: "/clients/segment/unreachable",
      go: "أصلح",
    });
  }
  // واتساب: الإنذار الأحمر فقط لما يُفقد كلّ شي (نقرات وصفر محفوظ) — الفرق الجزئي طبيعي.
  const wa = va.whatsapp;
  const waBroken = wa.clicks > 0 && wa.db === 0;
  const waQuiet = wa.clicks === 0 && wa.db === 0;
  const whatsappRow: Row = waBroken
    ? {
        tier: "hot",
        num: `${n(wa.clicks)} ← 0`,
        unit: "واتساب",
        title: `ليدز واتساب ما توصل — ${n(wa.clicks)} ضغطوا و0 انحفظ (90 يوم)`,
        ctx: "النقرة تُسجَّل لكن الليد ما ينحفظ — كل ليد واتساب مخفي عن الكونسول",
        href: "/analytics/leads/bookings?channel=whatsapp",
        go: "افحص",
      }
    : waQuiet
      ? {
          tier: "plain",
          num: "0",
          unit: "واتساب",
          title: "لا نشاط واتساب — 0 ضغطة، 0 ليد (90 يوم)",
          ctx: "ما أحد ضغط زر واتساب في 90 يوم",
          href: "/analytics/leads/bookings?channel=whatsapp",
          go: "اعرض",
        }
      : {
          tier: "ok",
          num: n(wa.db),
          unit: "ليد",
          title: `واتساب شغّال — ${n(wa.db)} ليد في 90 يوم`,
          ctx: `${n(wa.clicks)} ضغطة ← ${n(wa.db)} ليد وصلت`,
          href: "/analytics/leads/bookings?channel=whatsapp",
          go: "الليدز",
        };
  if (waBroken) hotRows.push(whatsappRow);

  // ── هذا الأسبوع ─────────────────────────────────────────────────────────
  const warmRows: Row[] = [];
  if (va.needsAction.bookings > 0) {
    warmRows.push({
      tier: "warm",
      num: n(va.needsAction.bookings),
      unit: "حجز",
      title: va.needsAction.bookings === 1 ? "حجز ينتظر اتصالك" : `${n(va.needsAction.bookings)} حجوزات تنتظر اتصالك`,
      ctx: "من صفحة عميل أو مقال، معه رقم — اتصل قبل ما يبرد",
      // The count is form bookings only (`channel: "form"`, get-visitor-actions) — without the
      // channel the page counted WhatsApp leads too: «1» here opened «48» there (1 Oct 2026).
      href: "/analytics/leads/bookings?status=new&channel=form",
      go: "اتصل",
    });
  }
  if (va.needsAction.comments > 0) {
    warmRows.push({
      tier: "warm",
      num: n(va.needsAction.comments),
      unit: "تعليق",
      title: "تعليقات تنتظر العميل",
      ctx: "العميل وحده يوافق أو يرد من الكونسول — الأدمن يذكّره",
      href: "/analytics/leads?type=COMMENT",
      go: "ذكّر العميل",
    });
  }
  if (va.questions.pendingAll > 0) {
    warmRows.push({
      tier: "warm",
      num: n(va.questions.pendingAll),
      unit: "سؤال",
      title: "أسئلة تنتظر العملاء",
      ctx: `${n(va.questions.pendingTeam)} جهّزها الفريق تنتظر موافقتهم · ${n(va.questions.pendingVisitor)} من زوار تنتظر جواب — العميل يتصرف من الكونسول، الأدمن يذكّر بس`,
      href: "/analytics/leads/questions",
      go: "التفاصيل",
    });
  }
  const awaitingApproval = articles[ArticleStatus.AWAITING_APPROVAL];
  if (awaitingApproval > 0) {
    warmRows.push({
      tier: "warm",
      num: n(awaitingApproval),
      unit: "مقال",
      title: "مقالات تنتظر الموافقة",
      ctx: `و${n(clients.content.awaitingApproval)} عملاء متأخرين في موافقتهم — تابعهم`,
      href: "/articles/segment/awaiting-approval",
      go: "راجع",
    });
  }
  if (clients.content.noArticles > 0) {
    warmRows.push({
      tier: "warm",
      num: n(clients.content.noArticles),
      unit: "عميل",
      title: "عملاء يدفعون وما عندهم مقال",
      ctx: "يدفعون مقابل صمت — أوّل المرشّحين للإلغاء",
      href: "/clients/segment/no-articles",
      go: "اعرض",
    });
  }

  // ── يحتاج انتباه ────────────────────────────────────────────────────────
  const noteRows: Row[] = [];
  if (alerts.clientsAtLimit.length > 0) {
    noteRows.push({
      tier: "warm",
      num: n(alerts.clientsAtLimit.length),
      unit: "عميل",
      title: "عملاء وصلوا حدّ المقالات",
      ctx: "فرصة ترقية الباقة",
      href: "/clients",
      go: "اعرض",
    });
  }
  if (!waBroken) noteRows.push(whatsappRow);

  // The pulse pills — same counting as before: hot rows «تكلّفك الآن», warm rows «هذا الأسبوع».
  const hot = hotRows.length;
  const warm = warmRows.length;
  const moneyFine = clients.needsYou.overdue + clients.needsYou.expired + clients.needsYou.expiringSoon === 0;
  const errorsTotal = errors.reduce((s, c) => s + c.items.length, 0);
  const clear = [
    { label: "أخطاء البيانات", v: errorsTotal },
    { label: "تعليقات للموافقة", v: va.comments.pending },
    { label: "أسئلة زوار", v: va.questions.unanswered },
  ].filter((c) => c.v === 0);

  const groups = [
    { key: "money", label: "فلوس", rows: moneyRows },
    { key: "hot", label: "عاجل", rows: hotRows },
    { key: "warm", label: "هذا الأسبوع", rows: warmRows },
    { key: "note", label: "يحتاج انتباه", rows: noteRows },
  ].filter((g) => g.rows.length > 0);

  return { groups, hot, warm, moneyFine, clear, moneyCount: moneyRows.length };
});

/** Title, date and the pulse pills — above the platform SEO card. */
export async function TodayHeader() {
  const { hot, warm, moneyFine, clear } = await getToday();
  const today = new Intl.DateTimeFormat("ar-SA-u-ca-gregory-nu-latn", { weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(new Date());

  return (
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold leading-tight">لوحة التحكم</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">{today} — وش يحتاجك اليوم</p>
        </div>
        <div className="flex flex-wrap justify-end gap-1.5">
          {hot > 0 && <Pill tone="red">{n(hot)} تكلّفك الآن</Pill>}
          {warm > 0 && <Pill tone="amber">{n(warm)} هذا الأسبوع</Pill>}
          <Pill tone={moneyFine ? "green" : "red"}>{moneyFine ? "المال سليم" : "المال يحتاجك"}</Pill>
          {clear.length > 0 && <Pill tone="green">سليم: {clear.map((c) => `${c.label} 0`).join(" · ")}</Pill>}
        </div>
      </div>
  );
}

export async function TodayList() {
  const { groups, hot, warm, moneyCount } = await getToday();

  return (
      <section className="overflow-hidden rounded-xl border bg-card shadow-sm" aria-label="يحتاجك اليوم">
        <div className="flex items-center justify-between gap-3 border-b px-4 py-3">
          <h2 className="flex items-center gap-2 text-[15px] font-extrabold">
            <ListChecks className="size-4" aria-hidden />
            يحتاجك اليوم
          </h2>
          <span className="text-xs text-muted-foreground">مرتّبة بالتكلفة — البند يختفي لما يصير صفر</span>
        </div>
        {hot + warm + moneyCount === 0 && (
          <p className="flex items-center gap-2 border-b px-4 py-3 text-sm font-semibold text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="size-4" aria-hidden /> ما في شي يكلّفك اليوم.
          </p>
        )}
        {groups.map((g) => (
          <div key={g.key}>
            <p className="border-b bg-muted/40 px-4 py-1.5 text-xs font-bold text-muted-foreground">{g.label}</p>
            <ul>
              {g.rows.map((r) => (
                <li key={r.title} className="border-b last:border-b-0">
                  <Link
                    href={r.href}
                    className="grid grid-cols-[4px_4.5rem_1fr_auto] items-center gap-3 py-2.5 pe-4 ps-3 transition-colors hover:bg-muted/40"
                  >
                    <span className={cn("self-stretch rounded-full", RAIL[r.tier])} aria-hidden />
                    <span className="text-center text-xl font-extrabold leading-none tabular-nums">
                      {r.num}
                      <span className="mt-1 block text-xs font-medium text-muted-foreground">{r.unit}</span>
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-bold leading-snug">{r.title}</span>
                      <span className="mt-0.5 block text-xs text-muted-foreground">{r.ctx}</span>
                    </span>
                    <span
                      className={cn(
                        "rounded-lg border px-3 py-1.5 text-xs font-bold whitespace-nowrap",
                        r.tier === "money" ? "border-primary bg-primary text-primary-foreground" : "text-primary",
                      )}
                    >
                      {r.go}
                    </span>
                  </Link>
                  {r.extra && (
                    <Link href={r.extra.href} className="-mt-1 block pb-2.5 ps-[6.75rem] text-xs font-semibold text-primary hover:underline">
                      {r.extra.label} ←
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>
  );
}

function Pill({ tone, children }: { tone: "red" | "amber" | "green"; children: React.ReactNode }) {
  const cls = {
    red: "border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400",
    amber: "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400",
    green: "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  }[tone];
  return <span className={cn("rounded-full border px-3 py-1 text-xs font-bold tabular-nums", cls)}>{children}</span>;
}
