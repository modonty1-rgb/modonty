import Link from "next/link";
import { ChevronRight } from "lucide-react";

import { DeptNav } from "./dept-nav";

/**
 * ترويسة مستند واحدة يستعملها دليل الفريق والـPlaybook معًا.
 * رُقّيت من `guidelines/components/guideline-layout` لمّا انتقلت صفحات إلى الـPlaybook
 * واحتاجت الشكل نفسه — فصارت لها مستهلكان في مسارين، وهذا شرط الترقية.
 */
export function DocLayout({
  title,
  /** لم يعد يُرسم — يبقى في التوقيع لأن الصفحات الخمس والعشرين تمرّره، وحذفه منها كلّها تغييرٌ بلا مقابل. */
  description: _description,
  parentHref = "/playbook",
  parentLabel = "دليل الفريق",
  children,
}: {
  title: string;
  description: string;
  parentHref?: string;
  parentLabel?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-[1200px] space-y-4 px-6 py-5" dir="rtl">
      {/*
        كانت الترويسة بطاقةً مستقلّة تحمل العنوان والوصف، فيظهر اسم الصفحة ثلاث مرّات:
        في الشريط الجانبي، وفي مسار التنقّل، وفيها. حُذفت بأمر خالد (١٣ سبتمبر ٢٠٢٦)،
        وصار العنوان هو آخر حلقة في المسار — مكانٌ واحد، وبلا علبةٍ فارغة فوق المحتوى.
      */}
      <h1 className="flex items-center gap-2 text-[13px] font-normal text-muted-foreground">
        <Link href={parentHref} className="flex items-center gap-1 transition-colors hover:text-foreground">
          <ChevronRight className="h-3.5 w-3.5" />
          {parentLabel}
        </Link>
        <ChevronRight className="h-3 w-3 opacity-40" />
        <span className="font-bold text-foreground">{title}</span>
      </h1>

      {/* صفحات القسم — يرسم نفسه داخل الأقسام وحدها، ولا شيء في صفحات الأساس. */}
      <DeptNav />

      {children}
    </div>
  );
}
