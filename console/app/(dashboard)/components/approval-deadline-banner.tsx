import Link from "next/link";
import { IconClock, IconChevronLeft } from "@modonty/shared/lib/icons";
import { ApprovalCountdown } from "./approval-countdown";

/**
 * بانر «مقالك بانتظار موافقتك» — يظهر ما دام عند العميل مقالٌ واحدٌ على الأقل بانتظار قراره.
 *
 * بعض العملاء يتأخّرون في الردّ فيتعطّل جدول النشر (خالد ١٥ أكتوبر ٢٠٢٦). البانر رسالةٌ فقط:
 * بعد ٥ أيام **فريق مدونتي** يعتمد المقال بنفسه — لا يوجد ولا يُراد اعتمادٌ تلقائيّ في النظام.
 * لا يُغلق: يختفي وحده حين لا يبقى مقالٌ ينتظر.
 */
function pendingLabel(n: number): string {
  if (n === 1) return "مقالٌ واحد بانتظار موافقتك";
  if (n === 2) return "مقالان بانتظار موافقتك";
  if (n <= 10) return `${n} مقالات بانتظار موافقتك`;
  return `${n} مقالاً بانتظار موافقتك`;
}

const APPROVAL_WINDOW_MS = 5 * 24 * 60 * 60 * 1000;

export function ApprovalDeadlineBanner({
  pendingCount,
  oldestPendingAt,
}: {
  pendingCount: number;
  /** The longest-waiting article — its deadline is the one the countdown shows. */
  oldestPendingAt: Date | null;
}) {
  if (pendingCount <= 0) return null;
  const deadline = oldestPendingAt ? new Date(oldestPendingAt.getTime() + APPROVAL_WINDOW_MS).toISOString() : null;

  return (
    <section
      aria-label="مقالات بانتظار موافقتك"
      className="flex flex-wrap items-start gap-3 rounded-lg border border-amber-300/70 bg-amber-50 px-3 py-3 sm:flex-nowrap sm:items-center sm:gap-4 sm:px-4 dark:border-amber-500/30 dark:bg-amber-500/10"
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm ring-1 ring-amber-300/60 dark:bg-amber-500/15 dark:ring-amber-500/30">
        <IconClock className="h-5 w-5" />
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm font-semibold text-amber-950 dark:text-amber-100">{pendingLabel(pendingCount)}</p>
          <span className="rounded-full bg-amber-700 px-2.5 py-0.5 text-xs font-bold text-white dark:bg-amber-500 dark:text-amber-950">
            مهلة الرد ٥&nbsp;أيام
          </span>
        </div>
        <p className="mt-1 text-xs leading-relaxed text-amber-900/85 dark:text-amber-100/80">
          نلتزم بجدول نشرٍ منتظم لأن انتظام النشر من أهم ما يبني ظهورك في جوجل، وتأخّر الموافقة يؤخّر
          الجدول كله. إذا لم تصلنا موافقتك أو ملاحظاتك{" "}
          <strong className="font-bold text-amber-950 dark:text-amber-100">خلال ٥&nbsp;أيام من وصول المقال</strong>،
          سيعتمده فريق مدونتي حفاظاً على انتظام النشر، دون أدنى مسؤولية على الموقع.
        </p>
      </div>

      {deadline && (
        <div className="shrink-0">
          <ApprovalCountdown deadline={deadline} />
        </div>
      )}

      <Link
        href="/dashboard/articles"
        className="inline-flex w-full shrink-0 items-center justify-center gap-1.5 rounded-md bg-amber-700 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-amber-800 sm:w-auto dark:bg-amber-500 dark:text-amber-950 dark:hover:bg-amber-400"
      >
        راجع المقال الآن
        <IconChevronLeft className="h-4 w-4" />
      </Link>
    </section>
  );
}
