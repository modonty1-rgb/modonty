import { ShieldCheck, XCircle, Stethoscope, AlertTriangle, ArrowLeft } from "lucide-react";
import Link from "next/link";

import { Card, CardContent } from "@/components/ui/card";
import { GuidelineLayout } from "../components/guideline-layout";
import { MIN_SEO_SCORE } from "@/lib/seo/assert-article-publishable";
import { HEALTH_CHECK_INFO, SEVERITY_LABEL } from "@/lib/health/article-health-types";

// Every rule on this page is READ FROM THE CODE THAT ENFORCES IT — the minimum score comes
// from `MIN_SEO_SCORE`, the checks from `HEALTH_CHECK_INFO`. A guideline that retypes the
// rules drifts from them the first time someone changes a threshold; this one cannot.

const BLOCKERS = [
  {
    title: "تاريخ النشر ناقص",
    detail: "المقال بلا تاريخ نشر — يُضاف تلقائياً لحظة النشر، وإن فشل التوليد تتوقّف العملية.",
  },
  {
    title: "فشل توليد بيانات السيو",
    detail: "قبل النشر تُولَّد الميتا والبيانات المنظّمة. لو فشل التوليد ما يكمل النشر — أعِد المحاولة.",
  },
  {
    title: `درجة السيو أقل من ${MIN_SEO_SCORE}٪`,
    detail: "الرسالة تسمّي لك البنود الناقصة بالاسم. سُدّها ثم أعِد المحاولة.",
  },
  {
    title: "الصورة الرئيسية بلا نص بديل",
    detail: "أضِف النص البديل من قسم «SEO Images» — لا يُقبل النشر بدونه.",
  },
] as const;

const SEVERITY_TONE: Record<string, string> = {
  critical: "border-red-500/30 bg-red-500/[0.04] text-red-600 dark:text-red-400",
  high: "border-amber-500/30 bg-amber-500/[0.04] text-amber-600 dark:text-amber-400",
  low: "border-border bg-muted/30 text-muted-foreground",
};

export default function PublishingGuidelinePage() {
  const checks = Object.entries(HEALTH_CHECK_INFO);

  return (
    <GuidelineLayout
      title="بوّابة النشر وصحّة المقال"
      description="وش يمنع مقالك من النشر، وكيف تعدّي — ثم وش نفحص فيه بعد ما ينشر"
    >
      {/* ── Why there is a gate at all ────────────────────────────────────── */}
      <Card className="border-primary/25 bg-primary/[0.04]">
        <CardContent className="space-y-2 p-5">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 shrink-0 text-primary" />
            <h2 className="text-sm font-semibold">ليش في بوّابة أصلاً</h2>
          </div>
          <p className="text-xs leading-relaxed text-muted-foreground">
            المقال اللي ينشر ناقصاً ما يضرّ نفسه فقط — يضرّ الشركة اللي كتبناه لها، وسمعتنا عند
            جوجل. فالبوّابة تفحص أربعة أشياء قبل ما تسمح بالنشر، وترفض بسبب مكتوب لا برسالة عامّة.
            <b className="text-foreground"> كلها بيدك</b>، ولا واحدة منها تحتاج مبرمجاً.
          </p>
        </CardContent>
      </Card>

      {/* ── The four blockers ─────────────────────────────────────────────── */}
      <Card>
        <CardContent className="p-5">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold">
            <XCircle className="h-4 w-4 text-red-500" />
            الأربعة اللي توقف النشر
          </h2>
          <ol className="space-y-2">
            {BLOCKERS.map((b, i) => (
              <li key={b.title} className="flex gap-2.5 rounded-lg border border-border/50 bg-background/60 p-3">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-500/15 text-[11px] font-bold text-red-500">
                  {i + 1}
                </span>
                <div className="min-w-0">
                  <div className="text-xs font-semibold">{b.title}</div>
                  <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">{b.detail}</p>
                </div>
              </li>
            ))}
          </ol>
          <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">
            الحدّ الأدنى للنشر <b className="text-foreground">{MIN_SEO_SCORE}٪</b>، وهو رقم مقروء من
            الكود نفسه لا مكتوب هنا يدوياً. تفصيل الدرجة وكيف ترفعها في{" "}
            <Link href="/guidelines/seo-score" className="text-primary underline underline-offset-2">
              نتيجة سيو المقال
            </Link>
            .
          </p>
        </CardContent>
      </Card>

      {/* ── Health, after publishing ──────────────────────────────────────── */}
      <Card>
        <CardContent className="p-5">
          <h2 className="mb-1 flex items-center gap-2 text-sm font-semibold">
            <Stethoscope className="h-4 w-4 text-teal-500" />
            بعد النشر — فحص صحّة المقال
          </h2>
          <p className="mb-3 text-[11px] leading-relaxed text-muted-foreground">
            النشر ليس نهاية القصّة: الصور تنكسر، والروابط تموت، ومعلومات جوجل تتقادم. صفحة «صحّة
            المقال» تفتح مقالك مثل أي زائر وتفحص هذي البنود. الحرج يعني «الزائر يشوف الخلل الآن».
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            {checks.map(([id, info]) => (
              <div key={id} className={`rounded-lg border p-3 ${SEVERITY_TONE[info.severity] ?? SEVERITY_TONE.low}`}>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-foreground">{info.label}</span>
                  <span className="shrink-0 text-[10px] font-semibold">{SEVERITY_LABEL[info.severity]}</span>
                </div>
                <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">{info.what}</p>
                <p className="mt-1 flex gap-1 text-[11px] leading-relaxed text-muted-foreground">
                  <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0" />
                  <span>{info.impact}</span>
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Link
        href="/guidelines/seo-score"
        className="flex items-center justify-between rounded-xl border p-4 transition-shadow hover:shadow-md"
      >
        <span className="text-xs font-semibold">التالي: من وين تجي درجة السيو؟</span>
        <ArrowLeft className="h-4 w-4 text-muted-foreground" />
      </Link>
    </GuidelineLayout>
  );
}
