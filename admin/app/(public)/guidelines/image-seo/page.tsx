import Link from "next/link";
import { Gauge, Type, AlignLeft, FileSignature, Ruler, Sparkles, AlertTriangle, ArrowLeft } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { GuidelineLayout } from "../components/guideline-layout";

// The weights below mirror dataLayer/lib/seo/media/seo-score.ts. Change one there → change it
// here in the same commit; a guideline that disagrees with the scorer teaches the wrong thing.

const CRITERIA = [
  {
    label: "النص البديل",
    weight: 50,
    icon: Type,
    who: "الكاتب",
    what: "وصف دقيق للصورة. يقرؤه بحث الصور، ويقرؤه قارئ الشاشة للكفيف.",
    rule: "بين ٥ و١٢٥ حرفاً. صف اللي في الصورة فعلاً — لا حشو كلمات مفتاحية.",
  },
  {
    label: "الوصف",
    weight: 20,
    icon: AlignLeft,
    who: "الكاتب",
    what: "شرح أطول يدخل في البيانات المنظّمة للصورة.",
    rule: "بين ٥٠ و١٦٠ حرفاً.",
  },
  {
    label: "الأبعاد",
    weight: 15,
    icon: Ruler,
    who: "النظام",
    what: "تُقرأ من الصورة عند الرفع.",
    rule: "صور المشاركة تحتاج ١٢٠٠×٦٣٠. ارفع بالمقاس الصحيح من البداية.",
  },
  {
    label: "اسم الملف",
    weight: 15,
    icon: FileSignature,
    who: "تلقائي",
    what: "الاسم اللي يظهر في الرابط ويقرؤه جوجل.",
    rule: "يُشتقّ من اسم الصورة التلقائي عند الحفظ — لا تكتبه بيدك.",
  },
] as const;

export default function ImageSeoGuidelinePage() {
  return (
    <GuidelineLayout
      title="سيو الصور"
      description="النص البديل والوصف واسم الملف — من قسم SEO Images، وكيف يتركّب رقم كل صورة"
    >
      <Card className="border-amber-500/25 bg-amber-500/[0.03]">
        <CardContent className="space-y-2 p-5">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0 text-amber-500" />
            <h2 className="text-sm font-semibold text-amber-600 dark:text-amber-400">
              الصورة بلا نص بديل توقف النشر
            </h2>
          </div>
          <p className="text-xs leading-relaxed text-muted-foreground">
            بوّابة النشر ترفض أي مقال صورته الرئيسية بلا نص بديل. فهذي ليست تحسيناً اختيارياً —
            هي شرط. وأيضاً مطلب وصول للكفيف: قارئ الشاشة ما عنده غير هذا النص.
          </p>
        </CardContent>
      </Card>

      {/* ── The four criteria ─────────────────────────────────────────────── */}
      <Card>
        <CardContent className="p-5">
          <h2 className="mb-1 flex items-center gap-2 text-sm font-semibold">
            <Gauge className="h-4 w-4 text-primary" />
            رقم الصورة — أربعة معايير على مئة
          </h2>
          <p className="mb-3 text-[11px] text-muted-foreground">
            النص البديل وحده نصف الدرجة، لأنه العنصر الوحيد اللي هو إشارة ترتيب ومطلب وصول معاً.
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            {CRITERIA.map((c) => (
              <div key={c.label} className="rounded-lg border p-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-1.5 text-xs font-bold">
                    <c.icon className="h-3.5 w-3.5 text-primary" />
                    {c.label}
                  </span>
                  <span className="font-mono text-sm font-extrabold text-primary">{c.weight}</span>
                </div>
                <p className="mt-1.5 text-[11px] leading-relaxed text-muted-foreground">{c.what}</p>
                <p className="mt-1 text-[11px] leading-relaxed">
                  <span className="font-semibold">القاعدة:</span>{" "}
                  <span className="text-muted-foreground">{c.rule}</span>
                </p>
                <span className="mt-1.5 inline-block rounded border px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground">
                  {c.who}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ── The filename, and why it is automatic ─────────────────────────── */}
      <Card>
        <CardContent className="space-y-2 p-5">
          <h2 className="flex items-center gap-2 text-sm font-semibold">
            <FileSignature className="h-4 w-4 text-teal-500" />
            اسم الملف — ليش تلقائي، ووش يصير عند الحفظ
          </h2>
          <p className="text-xs leading-relaxed text-muted-foreground">
            الاسم اللي يظهر في رابط الصورة هو اللي يقرؤه جوجل، لا الاسم اللي جاء من كاميرتك. عند
            الحفظ يُعاد تسمية الملف <b className="text-foreground">فعلياً على التخزين</b> بالاسم
            الوصفي، وتُنقل معه نسخ المقاسات الثلاث، وتُحدَّث كل الروابط المخزّنة. لهذا الحقل غير
            قابل للكتابة: النظام يضمن أن الاسم المعروض هو الاسم المخدوم بالضبط.
          </p>
          <div className="rounded-lg border bg-muted/30 p-3 font-mono text-[11px]" dir="ltr">
            screenshot-2024-a1b2c3d4e5.webp
            <br />
            ↓
            <br />
            تحسين-محركات-البحث-جدة-a1b2c3d4e5.webp
          </div>
          <p className="text-[11px] leading-relaxed text-muted-foreground">
            اللاحقة في آخر الاسم بصمة تمنع تصادم صورتين بنفس الاسم — تبقى كما هي بعد إعادة
            التسمية. والعربي مسموح في الاسم ومقصود: هو إشارة سيو حقيقية.
          </p>
        </CardContent>
      </Card>

      {/* ── Practical flow ────────────────────────────────────────────────── */}
      <Card>
        <CardContent className="p-5">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold">
            <Sparkles className="h-4 w-4 text-violet-500" />
            خطوات العمل
          </h2>
          <ol className="space-y-2 text-xs">
            {[
              "افتح «SEO Images» من القائمة الجانبية — الأقسام مرتّبة بالأسوأ أولاً.",
              "افتح العميل، ثم الصورة. تشوف تفصيل الدرجة ووش الناقص بالضبط.",
              "اكتب النص البديل والوصف. زرّ «توليد» يعطيك مسودّة من بيانات العميل — راجعها ولا تحفظها كما هي.",
              "احفظ. هنا يُعاد تسمية الملف ويُعاد توليد بيانات كل مقال وعميل يستعمل الصورة.",
            ].map((s, i) => (
              <li key={s} className="flex gap-2.5 rounded-lg border border-border/50 bg-background/60 p-3">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-violet-500/15 text-[11px] font-bold text-violet-500">
                  {i + 1}
                </span>
                <span className="leading-relaxed">{s}</span>
              </li>
            ))}
          </ol>
          <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">
            <b className="text-foreground">استثناء واحد:</b> صورة مدفونة داخل نصّ المقال لا يُعاد
            تسميتها — تغيير اسمها يكسر الرابط المكتوب داخل النص. النظام يكتشفها ويتخطّاها وحده.
          </p>
        </CardContent>
      </Card>

      <Link
        href="/guidelines/media"
        className="flex items-center justify-between rounded-xl border p-4 transition-shadow hover:shadow-md"
      >
        <span className="text-xs font-semibold">المقاسات وأماكن كل صورة</span>
        <ArrowLeft className="h-4 w-4 text-muted-foreground" />
      </Link>
    </GuidelineLayout>
  );
}
