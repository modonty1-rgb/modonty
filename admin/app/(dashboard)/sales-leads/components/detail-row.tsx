import Link from "next/link";
import { User } from "lucide-react";

/**
 * صفٌّ واحد في العمودَين الجانبيَّين — والفارغ منه يعرض **باب إصلاحه** لا شرطة.
 *
 * الشرطة `—` تقول «ناقص» ثم تقف؛ والمندوبة تقرؤها عشرين مرّة في اليوم ولا تفعل شيئاً لأن
 * الفعل يحتاج: تفتح التعديل، تدوّر على الخانة، تملأها. فصار الفراغ نفسه رابطاً إلى الشاشة
 * التي تملؤه — نفس المساحة، وضغطةٌ واحدة بدل ثلاث.
 *
 * والعمود ضيّق (٢٦٠ بكسل مقيسة) فالتسمية فوق القيمة لا جوارها: صفٌّ أفقيّ هنا يترك للقيمة
 * مئة بكسل فيلتفّ الإيميل على ثلاثة أسطر.
 */
export function DetailRow({
  icon: Icon,
  label,
  editHref,
  children,
}: {
  icon: typeof User;
  label: string;
  /** شاشة التعديل — تُفتح على الخانة الناقصة حين لا تكون هناك قيمة. */
  editHref?: string;
  /** `null` يعني «لا قيمة»، فيُرسم باب الإضافة مكانها. */
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-2 py-2">
      <Icon className="mt-[3px] size-3.5 shrink-0 text-muted-foreground" aria-hidden />
      <div className="min-w-0 flex-1">
        <div className="text-[11px] leading-none text-muted-foreground">{label}</div>
        <div className="mt-1 break-words text-[13px] leading-snug">
          {children ??
            (editHref ? (
              <Link
                href={editHref}
                className="rounded text-muted-foreground underline decoration-dotted underline-offset-4 transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background"
              >
                أضف
              </Link>
            ) : (
              <span className="text-muted-foreground">—</span>
            ))}
        </div>
      </div>
    </div>
  );
}
