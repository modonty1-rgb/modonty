import Link from "next/link";
import type { SocialPostStatus } from "@prisma/client";

import { cn } from "@/lib/utils";

import { STATUS_BADGE, STATUS_DOT, STATUS_LABEL } from "../helpers/social-labels";

/**
 * شارة الحالة — نقطة ملوّنة + الاسم. بـ`href` تصير رابطاً (في الجدول تفتح صفحة الإنتاج أو
 * النشر حسب الحالة، كالقديم `CalendarTable.tsx:183-188`).
 */
export function StatusBadge({
  status,
  href,
  className,
  dot = true,
}: {
  status: SocialPostStatus;
  href?: string;
  className?: string;
  /** القديم يرسم النقطة في الجدول فقط؛ الأرشيف والمعرض شارة نصّ بلا نقطة. */
  dot?: boolean;
}) {
  const cls = cn(
    "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-0.5 text-[10px] font-semibold",
    STATUS_BADGE[status],
    href && "transition-opacity hover:opacity-75",
    className,
  );
  const inner = (
    <>
      {dot && <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", STATUS_DOT[status])} />}
      {STATUS_LABEL[status]}
    </>
  );
  return href ? (
    <Link href={href} className={cls}>
      {inner}
    </Link>
  ) : (
    <span className={cls}>{inner}</span>
  );
}
