"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  XCircle,
  Search,
  ChevronLeft,
  Image as ImageIcon,
  BookOpen,
} from "lucide-react";
import { GuidelineLayout } from "../components/guideline-layout";

const glossary = [
  { term: "Slug", arabic: "آخر الرابط", example: "modonty.com/articles/THIS", path: "تعديل المقال › Basic › الرابط" },
  { term: "SEO Title", arabic: "عنوان جوجل", example: "العنوان الأزرق في نتيجة البحث", path: "تعديل المقال › SEO › SEO Title" },
  { term: "SEO Description", arabic: "وصف جوجل", example: "النص تحت العنوان في نتيجة البحث", path: "تعديل المقال › SEO › SEO Description" },
  { term: "OG Image", arabic: "صورة المشاركة", example: "الصورة اللي تظهر على WhatsApp/X/LinkedIn", path: "تعديل المقال › Media › الصورة الرئيسية" },
  { term: "Schema / JSON-LD", arabic: "بيانات للنظام", example: "كود يقرأه جوجل ويفهم منه معلومات إضافية", path: "تلقائي — لا تتدخّل" },
  { term: "Rich Result", arabic: "البطاقة الموسَّعة", example: "نتيجة جوجل اللي فيها صورة الكاتب + التاريخ + اسم المؤسسة", path: "تلقائي من Schema" },
] as const;

export default function SeoVisualPage() {
  return (
    <GuidelineLayout
      title="معاينة البحث والمشاركة"
      description="كيف يظهر مقالك في نتائج جوجل وعند مشاركته على WhatsApp / X / LinkedIn — تتبّع كل عنصر لمصدره في الأدمن"
    >

      {/* ── Glossary: مصطلحات ستراها في الصفحة ──────────────────────────── */}
      <Card className="border-sky-500/25 bg-sky-500/[0.03]">
        <CardContent className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <BookOpen className="h-4 w-4 text-sky-400 shrink-0" />
            <h2 className="text-sm font-semibold text-sky-400">قاموس مصطلحات الصفحة — راجع هذا قبل ما تكمل</h2>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed mb-4">
            صفحة الـ SEO فيها مصطلحات إنجليزية تقنية، لكن كلها بسيطة لو فهمت معناها. هذه أهم 6:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {glossary.map((g) => (
              <div key={g.term} className="rounded-lg border border-border/50 bg-background/60 p-3 space-y-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <code className="text-xs font-mono font-bold text-sky-400 bg-sky-500/[0.08] border border-sky-500/20 rounded px-1.5 py-0.5">{g.term}</code>
                  <span className="text-sm font-bold">= {g.arabic}</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{g.example}</p>
                <p className="text-[11px] text-emerald-400/90 leading-relaxed">📍 {g.path}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ── Stop 1: SERP Mockup ──────────────────────────────────────────── */}
      <Card>
        <CardContent className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-6 h-6 rounded-full bg-sky-500/20 border border-sky-500/40 flex items-center justify-center text-xs font-bold text-sky-400 shrink-0">١</span>
            <span className="text-sm font-semibold">نتيجة البحث في جوجل — هذا ما يظهر لكل شخص يبحث</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">

            {/* Google SERP Mockup */}
            <div className="rounded-xl border border-border/60 bg-background overflow-hidden shadow-sm">
              {/* Google bar */}
              <div className="px-4 py-2.5 bg-muted/40 border-b border-border/40 flex items-center gap-3">
                <span className="text-sm font-bold tracking-tight select-none">
                  <span className="text-blue-500">G</span>
                  <span className="text-red-500">o</span>
                  <span className="text-yellow-500">o</span>
                  <span className="text-blue-500">g</span>
                  <span className="text-green-500">l</span>
                  <span className="text-red-500">e</span>
                </span>
                <div className="flex-1 flex items-center gap-2 bg-background rounded-full border border-border/80 px-3 py-1">
                  <Search className="h-3 w-3 text-muted-foreground shrink-0" />
                  <span className="text-[11px] text-muted-foreground">رعاية ما بعد العملية الجراحية</span>
                </div>
              </div>

              {/* Result card */}
              <div className="p-5 space-y-2">
                {/* ① Breadcrumb / Slug */}
                <div className="border-s-2 border-sky-500 ps-3 flex items-center gap-1.5">
                  <div className="w-4 h-4 rounded-full bg-sky-500/10 border border-sky-500/30 flex items-center justify-center shrink-0">
                    <span className="text-[7px] font-bold text-sky-400">M</span>
                  </div>
                  <span className="text-[11px]">
                    <span className="text-emerald-500">modonty.com</span>
                    <span className="text-muted-foreground"> › عيادات-بلسم › </span>
                    <span className="text-emerald-500">رعاية-ما-بعد-العملية</span>
                  </span>
                </div>

                {/* ② SEO Title */}
                <div className="border-s-2 border-violet-500 ps-3">
                  <p className="text-[15px] font-normal text-blue-500 leading-snug cursor-pointer hover:underline">
                    رعاية ما بعد العملية الجراحية | عيادات بلسم الطبية
                  </p>
                </div>

                {/* ③ Meta Description */}
                <div className="border-s-2 border-amber-500 ps-3">
                  <p className="text-[12px] text-muted-foreground leading-relaxed">
                    دليل شامل لرعاية ما بعد العملية — تعليمات التغذية، الأدوية، وعلامات التعافي الطبيعي. من فريق عيادات بلسم الطبية المتخصص. احجز استشارة مجانية اليوم.
                  </p>
                </div>
              </div>
            </div>

            {/* Annotation cards */}
            <div className="space-y-3">
              <div className="rounded-lg border border-s-4 border-sky-500/30 border-s-sky-500 bg-sky-500/[0.04] p-3">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="w-5 h-5 rounded-full bg-sky-500/20 border border-sky-500/40 flex items-center justify-center text-xs font-bold text-sky-400 shrink-0">①</span>
                  <span className="text-xs font-bold text-sky-400">آخر الرابط (Slug) — يظهر بالأخضر فوق نتيجة جوجل</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed ps-7">
                  هذا الجزء من الرابط — جوجل يقرأه عشان يفهم موضوع الصفحة. النظام يكتبه تلقائياً من عنوان المقال، لكن راجعه قبل النشر.
                </p>
                <div className="mt-2 ps-7 flex items-center gap-1.5 flex-wrap">
                  <span className="text-[11px] text-muted-foreground">📍 المسار:</span>
                  <code className="text-[11px] bg-muted border border-border rounded px-1.5 py-0.5">تعديل المقال › Basic › الرابط</code>
                </div>
              </div>

              <div className="rounded-lg border border-s-4 border-violet-500/30 border-s-violet-500 bg-violet-500/[0.04] p-3">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="w-5 h-5 rounded-full bg-violet-500/20 border border-violet-500/40 flex items-center justify-center text-xs font-bold text-violet-400 shrink-0">②</span>
                  <span className="text-xs font-bold text-violet-400">عنوان جوجل (SEO Title) — العنوان الأزرق الكبير</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed ps-7">
                  أول شيء يقرأه الزائر في نتيجة البحث. يختلف عن عنوان المقال داخل الموقع — هذا مكتوب خصيصاً لجوجل. 50-60 حرف مثالي، الكلمة المفتاحية في البداية.
                </p>
                <div className="mt-2 ps-7 flex items-center gap-1.5 flex-wrap">
                  <span className="text-[11px] text-muted-foreground">📍 المسار:</span>
                  <code className="text-[11px] bg-muted border border-border rounded px-1.5 py-0.5">تعديل المقال › SEO › SEO Title</code>
                </div>
              </div>

              <div className="rounded-lg border border-s-4 border-amber-500/30 border-s-amber-500 bg-amber-500/[0.04] p-3">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="w-5 h-5 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-xs font-bold text-amber-400 shrink-0">③</span>
                  <span className="text-xs font-bold text-amber-400">وصف جوجل (Meta Description) — النص الرمادي تحت العنوان</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed ps-7">
                  هذا النص يقنع الزائر بالنقر أو يتجاهل الرابط. 140-160 حرف. إذا تركته فارغاً — جوجل يكتب هو ما يراه مناسباً، وغالباً ما يكون مقنعاً.
                </p>
                <div className="mt-2 ps-7 flex items-center gap-1.5 flex-wrap">
                  <span className="text-[11px] text-muted-foreground">📍 المسار:</span>
                  <code className="text-[11px] bg-muted border border-border rounded px-1.5 py-0.5">تعديل المقال › SEO › SEO Description</code>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Stop 2: Rich Result / JSON-LD ───────────────────────────────── */}
      <Card>
        <CardContent className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-6 h-6 rounded-full bg-sky-500/20 border border-sky-500/40 flex items-center justify-center text-xs font-bold text-sky-400 shrink-0">٢</span>
            <span className="text-sm font-semibold">البطاقة الموسَّعة — معلومات إضافية يكتبها النظام تلقائياً</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">

            {/* Rich Result Mockup */}
            <div className="rounded-xl border border-border/60 bg-background overflow-hidden shadow-sm">
              <div className="px-4 py-2 bg-muted/30 border-b border-border/30 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span className="text-xs text-muted-foreground">نتيجة موسَّعة — Rich Result</span>
              </div>
              <div className="p-5 space-y-2.5">
                {/* Breadcrumb */}
                <div className="flex items-center gap-1 text-xs text-emerald-500">
                  <span>Modonty</span>
                  <span className="text-muted-foreground">›</span>
                  <span>مقالات</span>
                  <span className="text-muted-foreground">›</span>
                  <span>الرعاية الصحية</span>
                </div>
                {/* Title */}
                <p className="text-[14px] font-normal text-blue-500 leading-snug cursor-pointer hover:underline">
                  رعاية ما بعد العملية الجراحية | عيادات بلسم الطبية
                </p>
                {/* Author + Date row */}
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <div className="w-4 h-4 rounded-full bg-violet-500/20 border border-violet-500/30 flex items-center justify-center shrink-0">
                      <span className="text-[7px] font-bold text-violet-400">أ</span>
                    </div>
                    <span>أحمد خالد</span>
                  </div>
                  <span className="text-border">·</span>
                  <span>٨ أبريل ٢٠٢٥</span>
                  <span className="text-border">·</span>
                  <span>٥ دقائق للقراءة</span>
                </div>
                {/* Description */}
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  دليل شامل لرعاية ما بعد العملية — تعليمات التغذية، الأدوية، وعلامات التعافي الطبيعي...
                </p>
                {/* Organization badge */}
                <div className="pt-1 border-t border-border/30 flex items-center gap-1.5">
                  <div className="w-3.5 h-3.5 rounded bg-sky-500/10 border border-sky-500/20 flex items-center justify-center">
                    <span className="text-[6px] font-bold text-sky-400">B</span>
                  </div>
                  <span className="text-[11px] text-muted-foreground">عيادات بلسم الطبية — المؤسسة</span>
                </div>
              </div>
            </div>

            {/* Source annotations */}
            <div>
              <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
                كل عنصر في هذه البطاقة يكتبه النظام تلقائياً — بدون أي تدخّل منك. مصادر البيانات:
              </p>
              <div className="space-y-2">
                {[
                  { element: "تسلسل المسار (Modonty › مقالات › ...)", source: "الإعدادات + رابط الفئة", color: "text-emerald-400", bg: "bg-emerald-500/[0.05] border-emerald-500/20" },
                  { element: "العنوان الأزرق الكبير", source: "تعديل المقال › SEO › SEO Title", color: "text-blue-400", bg: "bg-blue-500/[0.05] border-blue-500/20" },
                  { element: "اسم الكاتب وصورته", source: "تعديل الكاتب › الاسم + الصورة", color: "text-violet-400", bg: "bg-violet-500/[0.05] border-violet-500/20" },
                  { element: "تاريخ النشر", source: "تلقائي — وقت ضغطك على نشر", color: "text-sky-400", bg: "bg-sky-500/[0.05] border-sky-500/20" },
                  { element: "وقت القراءة التقديري", source: "تلقائي — يحتسبه النظام من طول المقال", color: "text-cyan-400", bg: "bg-cyan-500/[0.05] border-cyan-500/20" },
                  { element: "اسم المؤسسة (عيادات بلسم)", source: "بيانات العميل › الاسم", color: "text-amber-400", bg: "bg-amber-500/[0.05] border-amber-500/20" },
                ].map((row, i) => (
                  <div key={i} className={`rounded-lg border px-3 py-2 flex items-center justify-between gap-3 flex-wrap ${row.bg}`}>
                    <span className={`text-xs font-medium leading-snug ${row.color}`}>{row.element}</span>
                    <code className="text-[11px] bg-background/80 border border-border rounded px-1.5 py-0.5 shrink-0">{row.source}</code>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
                ✦ النظام يكتب هذي المعلومات بلغة خاصة يفهمها جوجل (تُسمّى <code className="text-[11px] bg-muted border border-border rounded px-1 py-0.5">Schema</code> أو <code className="text-[11px] bg-muted border border-border rounded px-1 py-0.5">JSON-LD</code>). أنت <strong className="text-emerald-400">لا تحتاج تتدخّل</strong> — فقط تأكّد إن بيانات الكاتب والعميل والمقال مكتملة.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Stop 3: Before vs After ──────────────────────────────────────── */}
      <Card>
        <CardContent className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-6 h-6 rounded-full bg-sky-500/20 border border-sky-500/40 flex items-center justify-center text-xs font-bold text-sky-400 shrink-0">٣</span>
            <span className="text-sm font-semibold">قبل وبعد — نفس المقال، نتيجتان مختلفتان تماماً</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {/* BEFORE */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-5 h-5 rounded-full bg-red-500/15 border border-red-500/30 flex items-center justify-center shrink-0">
                  <XCircle className="h-3 w-3 text-red-400" />
                </div>
                <span className="text-xs font-bold text-red-400">بدون تحسين SEO</span>
              </div>
              <div className="rounded-xl border border-red-500/25 bg-background p-4 space-y-2">
                <div className="flex items-center gap-1.5 border-s-2 border-red-500/30 ps-2">
                  <div className="w-3.5 h-3.5 rounded-full bg-muted shrink-0" />
                  <span className="text-xs text-muted-foreground/60">modonty.com › articles › post-4821</span>
                </div>
                <div className="border-s-2 border-red-500/30 ps-2">
                  <p className="text-[13px] text-blue-400/50">مقال جديد — عيادات بلسم الطبية</p>
                </div>
                <div className="border-s-2 border-red-500/30 ps-2">
                  <p className="text-[11px] text-muted-foreground/50 leading-relaxed">عيادات بلسم الطبية — موقع عيادات بلسم الرسمي. انقر هنا لمعرفة المزيد من خدماتنا الطبية المتنوعة والمتكاملة...</p>
                </div>
              </div>
              <div className="mt-3 space-y-1.5">
                <div className="flex items-start gap-1.5">
                  <XCircle className="h-3 w-3 text-red-400 mt-0.5 shrink-0" />
                  <p className="text-xs text-muted-foreground">رابط بأرقام عشوائية — جوجل لا يفهم موضوع الصفحة</p>
                </div>
                <div className="flex items-start gap-1.5">
                  <XCircle className="h-3 w-3 text-red-400 mt-0.5 shrink-0" />
                  <p className="text-xs text-muted-foreground">عنوان عام بلا كلمة مفتاحية — لا يظهر في نتائج البحث المستهدفة</p>
                </div>
                <div className="flex items-start gap-1.5">
                  <XCircle className="h-3 w-3 text-red-400 mt-0.5 shrink-0" />
                  <p className="text-xs text-muted-foreground">وصف اختاره جوجل بنفسه من أول سطر — لا يُقنع أحداً بالنقر</p>
                </div>
              </div>
            </div>

            {/* AFTER */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-5 h-5 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                </div>
                <span className="text-xs font-bold text-emerald-400">بعد تحسين SEO</span>
              </div>
              <div className="rounded-xl border border-emerald-500/25 bg-background p-4 space-y-2">
                <div className="flex items-center gap-1.5 border-s-2 border-sky-500 ps-2">
                  <div className="w-3.5 h-3.5 rounded-full bg-sky-500/15 border border-sky-500/30 flex items-center justify-center shrink-0">
                    <span className="text-[6px] font-bold text-sky-400">M</span>
                  </div>
                  <span className="text-xs text-emerald-500">modonty.com › عيادات-بلسم › رعاية-ما-بعد-العملية</span>
                </div>
                <div className="border-s-2 border-violet-500 ps-2">
                  <p className="text-[13px] text-blue-500 font-medium leading-snug">رعاية ما بعد العملية الجراحية | عيادات بلسم الطبية</p>
                </div>
                <div className="border-s-2 border-amber-500 ps-2">
                  <p className="text-[11px] text-muted-foreground leading-relaxed">دليل شامل لرعاية ما بعد العملية — تعليمات التغذية، الأدوية، وعلامات التعافي. احجز استشارة مجانية اليوم.</p>
                </div>
              </div>
              <div className="mt-3 space-y-1.5">
                <div className="flex items-start gap-1.5">
                  <CheckCircle2 className="h-3 w-3 text-emerald-400 mt-0.5 shrink-0" />
                  <p className="text-xs text-muted-foreground">رابط بكلمات مفتاحية — جوجل يفهم الموضوع ويُصنّف الصفحة صح</p>
                </div>
                <div className="flex items-start gap-1.5">
                  <CheckCircle2 className="h-3 w-3 text-emerald-400 mt-0.5 shrink-0" />
                  <p className="text-xs text-muted-foreground">عنوان يحوي الكلمة المفتاحية + اسم البراند — يُقنع بالنقر</p>
                </div>
                <div className="flex items-start gap-1.5">
                  <CheckCircle2 className="h-3 w-3 text-emerald-400 mt-0.5 shrink-0" />
                  <p className="text-xs text-muted-foreground">وصف مكتوب خصيصاً بكلمة مفتاحية + CTA — يرفع الـ CTR فوراً</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-5 rounded-lg border border-sky-500/25 bg-sky-500/[0.06] px-4 py-3 text-center">
            <p className="text-sm text-sky-300 leading-relaxed">
              نفس المقال · نفس المحتوى · نفس الموقع — الفرق الوحيد هو{" "}
              <strong className="text-sky-200">3 حقول في الأدمن</strong>
              {" "}(آخر الرابط + عنوان جوجل + وصف جوجل)
            </p>
          </div>
        </CardContent>
      </Card>

      {/* ── Stop 4: Social Share Preview ────────────────────────────────── */}
      <Card>
        <CardContent className="p-5">
          <div className="flex items-center gap-2 mb-5">
            <span className="w-6 h-6 rounded-full bg-sky-500/20 border border-sky-500/40 flex items-center justify-center text-xs font-bold text-sky-400 shrink-0">٤</span>
            <span className="text-sm font-semibold">لما تشارك الرابط — ما يظهر في كل منصة</span>
          </div>

          {/* Flow: Admin → System → Platforms → User */}
          <div className="flex items-center gap-2 mb-6 flex-wrap">
            {(
              [
                { label: "الأدمن", sub: "تملأ البيانات", c: "border-sky-500/30 bg-sky-500/[0.08] text-sky-400" },
                { label: "النظام", sub: "يكتب بيانات المشاركة", c: "border-violet-500/30 bg-violet-500/[0.08] text-violet-400" },
                { label: "المنصات", sub: "تقرأ الـ Tags", c: "border-amber-500/30 bg-amber-500/[0.08] text-amber-400" },
                { label: "الزائر", sub: "يرى البطاقة", c: "border-emerald-500/30 bg-emerald-500/[0.08] text-emerald-400" },
              ] as const
            ).map((step, i, arr) => (
              <div key={step.label} className="flex items-center gap-2">
                <div className={`rounded-lg border px-3 py-1.5 text-center ${step.c}`}>
                  <p className="text-xs font-bold">{step.label}</p>
                  <p className="text-[11px] text-muted-foreground">{step.sub}</p>
                </div>
                {i < arr.length - 1 && <ChevronLeft className="h-3.5 w-3.5 text-muted-foreground shrink-0" />}
              </div>
            ))}
          </div>

          {/* 3 Platform Mockups */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">

            {/* ① WhatsApp */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded-full bg-[#25D366] flex items-center justify-center shrink-0">
                  <span className="text-[11px] font-black text-white">W</span>
                </div>
                <div>
                  <p className="text-xs font-bold" style={{ color: "#25D366" }}>WhatsApp</p>
                  <p className="text-[11px] text-muted-foreground">معاينة الرابط في المحادثة</p>
                </div>
              </div>
              <div className="rounded-2xl border border-[#25D366]/20 overflow-hidden" style={{ backgroundColor: "#0d1117" }}>
                <div className="px-3 py-2 flex items-center gap-2.5" style={{ backgroundColor: "#1f2c34" }}>
                  <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: "#25D36630" }}>
                    <span className="text-[11px] font-bold" style={{ color: "#25D366" }}>ب</span>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-white/90">عيادات بلسم الطبية</p>
                    <p className="text-[8px] text-white/40">آخر ظهور الآن</p>
                  </div>
                </div>
                <div className="p-3 space-y-2" style={{ backgroundColor: "#0d1117" }}>
                  <div className="flex justify-start">
                    <div className="text-[11px] text-white/60 rounded-lg px-2.5 py-1.5" style={{ backgroundColor: "#1f2c34" }}>
                      اطلعوا على المقال الجديد 👇
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <div className="rounded-xl overflow-hidden max-w-[88%]" style={{ backgroundColor: "#005c4b" }}>
                      <div className="aspect-[1.91/1] relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-sky-900 via-slate-800 to-violet-900 flex items-center justify-center">
                          <div className="text-center px-3">
                            <p className="text-xs font-bold text-white/90 leading-snug">رعاية ما بعد</p>
                            <p className="text-xs font-bold text-white/90">العملية الجراحية</p>
                            <p className="text-[8px] text-white/40 mt-1">عيادات بلسم الطبية</p>
                          </div>
                        </div>
                        <span className="absolute bottom-1 end-1.5 text-[7px] text-white/25">OG Image</span>
                      </div>
                      <div className="px-2.5 py-2 border-t border-white/5 space-y-0.5">
                        <p className="text-[11px] font-semibold text-white/90 leading-snug">رعاية ما بعد العملية | بلسم</p>
                        <p className="text-[8px] text-white/50 leading-relaxed">دليل شامل للتعافي بعد العملية...</p>
                        <p className="text-[7px] uppercase mt-0.5" style={{ color: "#25D36699" }}>MODONTY.COM</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ② LinkedIn */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded flex items-center justify-center shrink-0" style={{ backgroundColor: "#0A66C2" }}>
                  <span className="text-[8px] font-black text-white">in</span>
                </div>
                <div>
                  <p className="text-xs font-bold" style={{ color: "#0A66C2" }}>LinkedIn</p>
                  <p className="text-[11px] text-muted-foreground">مشاركة في التغذية الإخبارية</p>
                </div>
              </div>
              <div className="rounded-xl border border-border/60 bg-card overflow-hidden">
                <div className="px-3 py-2.5 flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ background: "linear-gradient(135deg, #0A66C299, #0A66C2)" }}>
                    <span className="text-[11px] font-bold text-white">M</span>
                  </div>
                  <div>
                    <p className="text-xs font-semibold">Modonty</p>
                    <p className="text-[8px] text-muted-foreground">منصة إدارة المحتوى · للتو</p>
                  </div>
                </div>
                <div className="px-3 pb-2">
                  <p className="text-xs text-muted-foreground">نشرنا مقالاً جديداً حول رعاية ما بعد العملية 🏥</p>
                </div>
                <div className="border-t border-border/40">
                  <div className="aspect-[1200/627] relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-sky-900/60 via-slate-800/80 to-violet-900/60 flex items-center justify-center">
                      <div className="text-center px-6">
                        <p className="text-sm font-bold text-white/85 leading-snug">رعاية ما بعد العملية الجراحية</p>
                        <p className="text-xs text-white/50 mt-1.5">عيادات بلسم الطبية</p>
                      </div>
                    </div>
                    <span className="absolute bottom-2 end-2 text-[7px] text-white/20">OG Image · 1200×627</span>
                  </div>
                  <div className="px-3 py-2.5 bg-muted/20">
                    <p className="text-[11px] text-muted-foreground/60 uppercase tracking-wide mb-1">modonty.com</p>
                    <p className="text-[11px] font-semibold leading-snug">رعاية ما بعد العملية الجراحية | عيادات بلسم الطبية</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">دليل شامل للتعافي بعد العملية — تعليمات التغذية والأدوية وعلامات التعافي الطبيعي...</p>
                  </div>
                </div>
              </div>
            </div>

            {/* ③ Twitter / X */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded-full bg-foreground flex items-center justify-center shrink-0">
                  <span className="text-[11px] font-black text-background">𝕏</span>
                </div>
                <div>
                  <p className="text-xs font-bold">Twitter / X</p>
                  <p className="text-[11px] text-muted-foreground">بطاقة تويتر — Large Image</p>
                </div>
              </div>
              <div className="rounded-xl border border-border/60 bg-card overflow-hidden">
                <div className="px-3 py-2.5 flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-500 to-slate-700 flex items-center justify-center shrink-0">
                    <span className="text-[11px] font-bold text-white">M</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-1.5">
                      <p className="text-xs font-semibold">Modonty</p>
                      <span className="text-[8px] text-muted-foreground">· الآن</span>
                    </div>
                    <p className="text-[8px] text-muted-foreground">@modonty_sa</p>
                  </div>
                </div>
                <div className="px-3 pb-2">
                  <p className="text-xs text-foreground/80">مقال جديد على المدونة 👇 قراءة إلزامية لكل مريض ✅</p>
                </div>
                <div className="mx-3 mb-3 rounded-xl border border-border/50 overflow-hidden">
                  <div className="aspect-[2/1] relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-sky-900/50 via-slate-800/80 to-violet-900/50 flex items-center justify-center">
                      <div className="text-center px-4">
                        <p className="text-sm font-bold text-white/85 leading-snug">رعاية ما بعد العملية</p>
                        <p className="text-xs text-white/40 mt-1">عيادات بلسم الطبية</p>
                      </div>
                    </div>
                    <span className="absolute bottom-2 end-2 text-[7px] text-white/20">OG Image · 1200×600</span>
                  </div>
                  <div className="px-3 py-2 bg-muted/20">
                    <p className="text-xs font-semibold leading-snug">رعاية ما بعد العملية | بلسم الطبية</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">دليل شامل للتعافي بعد العملية الجراحية...</p>
                    <p className="text-[8px] text-muted-foreground/50 mt-1">modonty.com</p>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Source annotation table */}
          <div className="rounded-xl border border-border/50 overflow-hidden mb-5">
            <div className="px-4 py-2.5 bg-muted/30 border-b border-border/40">
              <p className="text-[11px] font-semibold">كل عنصر في البطاقات — مصدره في الأدمن</p>
            </div>
            <div className="divide-y divide-border/30">
              {(
                [
                  { element: "الصورة الكبيرة", field: "تعديل المقال › Media › الصورة الرئيسية (1200×630px)", note: "نفس الصورة تظهر في كل المنصات", dot: "bg-sky-500" },
                  { element: "العنوان داخل البطاقة", field: "تعديل المقال › SEO › SEO Title", note: "50-60 حرف · يُقطَع إذا كان أطول", dot: "bg-violet-500" },
                  { element: "الوصف تحت العنوان", field: "تعديل المقال › SEO › SEO Description", note: "140-160 حرف · بعض المنصات تُقصّره", dot: "bg-amber-500" },
                  { element: "اسم الدومين", field: "تلقائي — من رابط الموقع", note: "ما تحتاج تكتبه يدوياً", dot: "bg-emerald-500" },
                  { element: "اسم الموقع", field: "الإعدادات › اسم الموقع", note: "يظهر في LinkedIn + تسلسل المسار", dot: "bg-pink-500" },
                ] as const
              ).map((row, i) => (
                <div key={i} className="flex items-center gap-3 px-4 py-2.5 flex-wrap">
                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${row.dot}`} />
                  <span className="text-xs font-medium w-36 shrink-0">{row.element}</span>
                  <code className="text-[11px] bg-muted border border-border rounded px-1.5 py-0.5 shrink-0">{row.field}</code>
                  <span className="text-[11px] text-muted-foreground hidden sm:block">{row.note}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Without OG Image — Before vs After */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <XCircle className="h-3.5 w-3.5 text-red-400 shrink-0" />
                <span className="text-xs font-bold text-red-400">بدون صورة مشاركة (OG Image)</span>
              </div>
              <div className="rounded-xl border border-red-500/20 bg-card overflow-hidden">
                <div className="w-full h-20 bg-muted/40 flex flex-col items-center justify-center gap-1 border-b border-border/30">
                  <ImageIcon className="h-5 w-5 text-muted-foreground/25" />
                  <p className="text-[11px] text-muted-foreground/35">لا توجد صورة</p>
                </div>
                <div className="px-3 py-2">
                  <p className="text-xs text-muted-foreground/60">مقال جديد — عيادات بلسم الطبية</p>
                  <p className="text-[11px] text-muted-foreground/40 mt-0.5">modonty.com</p>
                </div>
              </div>
              <div className="mt-2 space-y-1">
                <p className="text-xs text-muted-foreground flex items-start gap-1.5"><XCircle className="h-3 w-3 text-red-400 shrink-0 mt-0.5" />لا صورة = نقرات أقل بـ ٣-٥× في وسائل التواصل</p>
                <p className="text-xs text-muted-foreground flex items-start gap-1.5"><XCircle className="h-3 w-3 text-red-400 shrink-0 mt-0.5" />المنصة تختار صورة عشوائية من الصفحة</p>
                <p className="text-xs text-muted-foreground flex items-start gap-1.5"><XCircle className="h-3 w-3 text-red-400 shrink-0 mt-0.5" />يبدو غير احترافي ويخسر الثقة فوراً</p>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                <span className="text-xs font-bold text-emerald-400">مع صورة مشاركة (OG Image · 1200×630px)</span>
              </div>
              <div className="rounded-xl border border-emerald-500/20 bg-card overflow-hidden">
                <div className="w-full h-20 bg-gradient-to-br from-sky-900/40 via-slate-800/60 to-violet-900/40 flex flex-col items-center justify-center gap-0.5 border-b border-border/30">
                  <p className="text-xs font-bold text-white/80">رعاية ما بعد العملية</p>
                  <p className="text-[8px] text-white/40">عيادات بلسم الطبية</p>
                </div>
                <div className="px-3 py-2">
                  <p className="text-xs font-semibold">رعاية ما بعد العملية | بلسم الطبية</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">modonty.com</p>
                </div>
              </div>
              <div className="mt-2 space-y-1">
                <p className="text-xs text-muted-foreground flex items-start gap-1.5"><CheckCircle2 className="h-3 w-3 text-emerald-400 shrink-0 mt-0.5" />صورة جاذبة = أكثر نقرات ومشاركات</p>
                <p className="text-xs text-muted-foreground flex items-start gap-1.5"><CheckCircle2 className="h-3 w-3 text-emerald-400 shrink-0 mt-0.5" />براند الموقع يظهر في كل مشاركة</p>
                <p className="text-xs text-muted-foreground flex items-start gap-1.5"><CheckCircle2 className="h-3 w-3 text-emerald-400 shrink-0 mt-0.5" />تجربة احترافية تبني الثقة بالمحتوى</p>
              </div>
            </div>
          </div>

          {/* Final mega takeaway */}
          <div className="rounded-xl border border-sky-500/25 bg-gradient-to-r from-sky-500/[0.07] via-violet-500/[0.04] to-emerald-500/[0.07] p-4">
            <p className="text-xs font-semibold text-center mb-3">خلاصة — ٥ حقول في الأدمن، حضور كامل في كل مكان</p>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {(
                [
                  { label: "آخر الرابط", sub: "Slug — رابط جوجل", color: "text-sky-400" },
                  { label: "عنوان جوجل", sub: "SEO Title — العنوان الأزرق", color: "text-violet-400" },
                  { label: "وصف جوجل", sub: "SEO Description — تحت العنوان", color: "text-amber-400" },
                  { label: "صورة المشاركة", sub: "OG Image — على كل المنصات", color: "text-pink-400" },
                  { label: "الكاتب + العميل", sub: "البطاقة الموسَّعة في جوجل", color: "text-emerald-400" },
                ] as const
              ).map((item) => (
                <div key={item.label} className="rounded-lg border border-border/40 bg-background/60 px-2.5 py-2 text-center">
                  <p className={`text-xs font-bold ${item.color}`}>{item.label}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">{item.sub}</p>
                </div>
              ))}
            </div>
          </div>

        </CardContent>
      </Card>

    </GuidelineLayout>
  );
}
