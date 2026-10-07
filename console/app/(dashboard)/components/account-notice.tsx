import Link from "next/link";
import { CalendarClock, Receipt, AlertCircle } from "lucide-react";
import { resolveAccountNotice } from "@/lib/subscription/resolve-account-notice";

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
  /**
   * المستحقّ نصّاً جاهزاً، كلُّ عملةٍ بمبلغها («٢٬٣٩٤ ر.س و٥٠٠ ج.م») — من `getOutstandingInvoices`.
   * كان رقماً واحداً بعملة أوّل فاتورة، فيُجمع الريالُ على الجنيه (٢٣ سبتمبر ٢٠٢٦ · خالد: مصدرٌ واحد).
   */
  unpaidTotal: string | null;
}

const TONES = {
  calm: "border-primary/25 bg-primary/[0.06] text-foreground",
  attention: "border-amber-500/30 bg-amber-500/[0.07] text-foreground",
} as const;

const ICON_TONES = {
  calm: "bg-primary/10 text-primary",
  attention: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
} as const;

const ICONS = { expired: AlertCircle, unpaid: Receipt, ending: CalendarClock } as const;
const LINKS = {
  expired: { href: "/dashboard/invoices", cta: "تفاصيل الاشتراك" },
  unpaid: { href: "/dashboard/invoices", cta: "عرض الفواتير" },
  ending: { href: "/dashboard/invoices", cta: "تفاصيل الاشتراك" },
} as const;

export function AccountNotice({ endDate, unpaidCount, unpaidTotal }: AccountNoticeProps) {
  // القاعدة في `lib/subscription/resolve-account-notice.ts` — نفسها التي يعرضها تطبيق الجوال.
  const resolved = resolveAccountNotice({ endDate, unpaidCount, unpaidTotal });
  const notice = resolved ? { ...resolved, icon: ICONS[resolved.kind], ...LINKS[resolved.kind] } : null;

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
