import Link from "next/link";
import { CalendarClock, Receipt, AlertCircle } from "lucide-react";

/**
 * The one thing the client needs to know about their account, said once and calmly.
 *
 * Tone (Khalid 2026-07-24): «أنيقة وراقية، ما فيها تهكم، ما فيها إزعاج». So: a plain
 * statement of fact and a date, never a warning tone, never a countdown that nags, and
 * never more than one notice at a time — the most consequential wins. Renders nothing
 * when the account is healthy, which is most of the time.
 *
 * Lives in the dashboard LAYOUT, so it follows the client to every page, and carries no
 * dismiss button: it disappears the moment the account is settled and not before. A
 * notice you can close is a notice that gets closed and forgotten.
 */

interface AccountNoticeProps {
  endDate: Date | null;
  unpaidCount: number;
  unpaidAmount: number;
  unpaidCurrency: string | null;
}

/** Whole days from today to `d` — negative once the date has passed. */
function daysUntil(d: Date): number {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const target = new Date(d);
  target.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - startOfToday.getTime()) / 86_400_000);
}

function arDate(d: Date): string {
  return new Intl.DateTimeFormat("ar-EG", { day: "numeric", month: "long", year: "numeric" }).format(d);
}

const TONES = {
  calm: "border-primary/25 bg-primary/[0.06] text-foreground",
  attention: "border-amber-500/30 bg-amber-500/[0.07] text-foreground",
} as const;

const ICON_TONES = {
  calm: "bg-primary/10 text-primary",
  attention: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
} as const;

export function AccountNotice({ endDate, unpaidCount, unpaidAmount, unpaidCurrency }: AccountNoticeProps) {
  const left = endDate ? daysUntil(endDate) : null;

  // Ordered by consequence: a lapsed subscription first, then money, then the reminder.
  // Only one shows — stacking notices is how a dashboard starts nagging.
  let notice: {
    tone: keyof typeof TONES;
    icon: typeof CalendarClock;
    title: string;
    body: string;
    href: string;
    cta: string;
  } | null = null;

  if (endDate && left !== null && left < 0) {
    notice = {
      tone: "attention",
      icon: AlertCircle,
      title: "انتهت مدة اشتراكك",
      body: `كانت المدة سارية حتى ${arDate(endDate)}. تجديدها يبقي صفحتك ومقالاتك تعمل كالمعتاد.`,
      href: "/dashboard/invoices",
      cta: "تفاصيل الاشتراك",
    };
  } else if (unpaidCount > 0) {
    const amount =
      unpaidCurrency && unpaidAmount > 0
        ? ` بقيمة ${new Intl.NumberFormat("en-US").format(unpaidAmount)} ${unpaidCurrency}`
        : "";
    notice = {
      tone: "attention",
      icon: Receipt,
      title: unpaidCount === 1 ? "لديك فاتورة بانتظار السداد" : `لديك ${unpaidCount} فواتير بانتظار السداد`,
      body: `الفاتورة${unpaidCount === 1 ? "" : " الإجمالية"}${amount} متاحة للاطّلاع. لو سدّدتها مؤخراً فتجاهل هذه الرسالة — قد لا يكون السداد قد سُجّل بعد.`,
      href: "/dashboard/invoices",
      cta: "عرض الفواتير",
    };
  } else if (endDate && left !== null && left <= 7) {
    notice = {
      tone: "calm",
      icon: CalendarClock,
      title: left === 0 ? "اشتراكك ينتهي اليوم" : `اشتراكك ينتهي خلال ${left === 1 ? "يوم" : `${left} أيام`}`,
      body: `المدة الحالية تنتهي في ${arDate(endDate)}. يسعدنا استمرارك معنا.`,
      href: "/dashboard/invoices",
      cta: "تفاصيل الاشتراك",
    };
  }

  if (!notice) return null;

  const Icon = notice.icon;

  return (
    <div className={`flex flex-wrap items-center gap-3 rounded-lg border px-4 py-3 ${TONES[notice.tone]}`}>
      <span
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-md ${ICON_TONES[notice.tone]}`}
      >
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold">{notice.title}</p>
        <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{notice.body}</p>
      </div>
      <Link
        href={notice.href}
        className="shrink-0 rounded-md border bg-background px-3 py-1.5 text-xs font-medium transition-colors hover:bg-muted"
      >
        {notice.cta}
      </Link>
    </div>
  );
}
