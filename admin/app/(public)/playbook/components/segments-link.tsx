import Link from "next/link";
import { ArrowLeft, Target } from "lucide-react";

/**
 * بطاقة تشير إلى «الشرائح المستهدفة».
 *
 * الصفحة يشترك فيها المبيعات والتسويق (خالد، ١٣ سبتمبر ٢٠٢٦)، فلو نُسخ محتواها في
 * القسمين لانحرف أحدهما عن الآخر عند أوّل تعديل. البطاقة تُركّب في القسمين، والمحتوى
 * في مكان واحد.
 */
export function SegmentsLink() {
  return (
    <Link
      href="/playbook/segments"
      className="group flex items-start justify-between gap-3 rounded-lg border bg-card p-3 transition-colors hover:border-primary/40 hover:bg-primary/[0.04]"
    >
      <div className="flex items-start gap-2.5">
        <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-md bg-primary/10 text-primary">
          <Target className="h-4 w-4" />
        </span>
        <div>
          <p className="text-[14.5px] font-bold">الشرائح المستهدفة</p>
          <p className="mt-1 text-[12.5px] leading-6 text-muted-foreground">
            الشرائح بترتيب سهولة الإغلاق، والوكالات، والقطاعات المصرية التي تستهدف الخليجي، وشجرة
            قرار قبل أن تعطي المهتمّ وقتك، ونقاط الألم السبع. صفحة واحدة يقرأها البيع والتسويق معًا.
          </p>
        </div>
      </div>
      <ArrowLeft className="mt-1 h-4 w-4 shrink-0 text-primary opacity-0 transition-opacity group-hover:opacity-100" />
    </Link>
  );
}
