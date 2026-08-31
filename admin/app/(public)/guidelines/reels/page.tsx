import Link from "next/link";
import { Sparkles, CheckCircle2, Info, Link2, ArrowLeft } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { GuidelineLayout } from "../components/guideline-layout";

// Grounded in the ReelStatus enum (dataLayer/prisma/schema/schema.prisma) and the
// business-model reference §4. The feature is still under active development, so this page
// documents the APPROVAL MODEL — which is settled — and says plainly what is not.

const FLOW = [
  { status: "DRAFT", label: "مسودّة", note: "قيد الإعداد عندنا — لا أحد يشوفها." },
  { status: "PENDING_APPROVAL", label: "بانتظار الاعتماد", note: "رفعها العميل أو جهّزناها له، ولازم تمرّ على الأدمن." },
  { status: "APPROVED", label: "معتمدة", note: "عدّت المراجعة، ولسّه ما نزلت للفيد." },
  { status: "PUBLISHED", label: "منشورة", note: "حيّة في الفيد العام وصفحة المشاهدة." },
  { status: "REJECTED", label: "مرفوضة", note: "ما عدّت المراجعة — بسبب مكتوب." },
  { status: "ARCHIVED", label: "مؤرشفة", note: "خرجت من التداول ومحفوظ تاريخها." },
] as const;

export default function ReelsGuidelinePage() {
  return (
    <GuidelineLayout
      title="الريلز"
      description="فيديو قصير منسوب لشركة — تسليم في الباقة، لا محتوى مستخدمين"
    >
      <Card className="border-primary/25 bg-primary/[0.04]">
        <CardContent className="space-y-2 p-5">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 shrink-0 text-primary" />
            <h2 className="text-sm font-semibold">الفكرة في سطر</h2>
          </div>
          <p className="text-xs leading-relaxed text-muted-foreground">
            الريل عندنا ليس مقطعاً يرفعه أي مستخدم. هو <b className="text-foreground">تسليم</b>{" "}
            منسوب لشركة، مرتبط غالباً بمقال أو بخدمة لها، ولا ينزل للفيد العام إلا بعد اعتماد.
            هذا الفرق يحكم كل قرار في إنتاجه.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-5">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold">
            <CheckCircle2 className="h-4 w-4 text-teal-500" />
            رحلة الريل — ستّ حالات
          </h2>
          <div className="grid gap-2 sm:grid-cols-2">
            {FLOW.map((f) => (
              <div key={f.status} className="rounded-lg border p-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold">{f.label}</span>
                  <code className="shrink-0 rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                    {f.status}
                  </code>
                </div>
                <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">{f.note}</p>
              </div>
            ))}
          </div>
          <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">
            الاعتماد ليس خطوة شكلية: الريل يمثّل شركة أمام جمهورها، وأي خطأ فيه يُنسب لها ولنا معاً.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-2 p-5">
          <h2 className="flex items-center gap-2 text-sm font-semibold">
            <Link2 className="h-4 w-4 text-violet-500" />
            الربط شرط، لا تحسين
          </h2>
          <p className="text-xs leading-relaxed text-muted-foreground">
            كل ريل لازم يكون واضحاً لصالح مَن، ومرتبطاً بمقال أو خدمة أو صفحة الشركة. ريل جميل بلا
            وجهة يعطي مشاهدة ولا يعطي الشركة شيئاً — والباقة اشترت أثراً لا مشاهدات.
          </p>
        </CardContent>
      </Card>

      <Card className="border-dashed">
        <CardContent className="space-y-2 p-5">
          <h2 className="flex items-center gap-2 text-sm font-semibold">
            <Info className="h-4 w-4 text-muted-foreground" />
            ما لم يُحسم بعد — لا تفترضه
          </h2>
          <ul className="space-y-1.5 text-[11px] leading-relaxed text-muted-foreground">
            <li>• عدد الريلز المسموح شهرياً لكل باقة — يُقرأ من بيانات الباقات، لا من هنا.</li>
            <li>• الاسم النهائي للريلز في الواجهة العربية.</li>
            <li>• تفاصيل مسار الإنتاج والرفع — الميزة قيد التطوير وتتغيّر.</li>
          </ul>
          <p className="text-[11px] leading-relaxed text-muted-foreground">
            لو احتجت رقماً أو اسماً من هذي، اسأل — لا تكتبه من ذاكرتك في عرضٍ أو تسليم.
          </p>
        </CardContent>
      </Card>

      <Link
        href="/guidelines/media"
        className="flex items-center justify-between rounded-xl border p-4 transition-shadow hover:shadow-md"
      >
        <span className="text-xs font-semibold">معايير الصور والوسائط</span>
        <ArrowLeft className="h-4 w-4 text-muted-foreground" />
      </Link>
    </GuidelineLayout>
  );
}
