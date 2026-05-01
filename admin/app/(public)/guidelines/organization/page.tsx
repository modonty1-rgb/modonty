"use client";

import { Card, CardContent } from "@/components/ui/card";
import { GuidelineLayout } from "../components/guideline-layout";
import {
  FolderTree,
  Tag,
  Briefcase,
  Zap,
  HelpCircle,
} from "lucide-react";

// ─── 3 طرق التنظيم — في سطر لكل واحدة ────────────────────────────
const types = [
  {
    icon: FolderTree,
    name: "Category — الفئة",
    color: "blue",
    when: "موضوع عريض ينتمي له المقال",
    example: "\"التقنية\" · \"التسويق\" · \"الصحة\"",
    rule: "كل مقال = فئة واحدة فقط · أنشئ 5-15 فئة (لا أكثر)",
  },
  {
    icon: Tag,
    name: "Tag — الوسم",
    color: "violet",
    when: "كلمة محددة تربط مقالات متشابهة",
    example: "\"SEO\" · \"تصميم UI\" · \"أدوات مجانية\"",
    rule: "كل مقال = 3-5 وسوم · محددة، مش عامة",
  },
  {
    icon: Briefcase,
    name: "Industry — القطاع",
    color: "emerald",
    when: "نوع شغل العميل (للعملاء فقط، مش للمقالات)",
    example: "\"الرعاية الصحية\" · \"التعليم\" · \"العقارات\"",
    rule: "كل عميل = قطاع واحد · 10-20 قطاع كحد أقصى",
  },
] as const;

// ─── شجرة قرار بسيطة ───────────────────────────────────────
const decisionTree = [
  { question: "موضوع عريض — التقنية، التسويق، الصحة؟", answer: "Category" },
  { question: "كلمة محددة — SEO، تصميم UI، Google Analytics؟", answer: "Tag" },
  { question: "نوع شغل العميل — مستشفى، مدرسة، متجر؟", answer: "Industry" },
] as const;

// ─── أخطاء شائعة (3 أمثلة فقط) ──────────────────────────
const commonMistakes = [
  {
    wrong: "إنشاء وسم \"مقالات\"",
    why: "كل المحتوى مقالات أصلاً — وسم بدون فائدة",
    do: "احذف، استخدم وسماً محدداً مثل \"دليل خطوة بخطوة\"",
  },
  {
    wrong: "نفس الاسم فئة + وسم",
    why: "تكرار يُشتت Google ويُربك الزائر",
    do: "اختر واحد فقط — الفئة للتصنيف الرئيسي، الوسم للربط",
  },
  {
    wrong: "فئة فيها مقال واحد",
    why: "فئة شبه فارغة = إشارة جودة سلبية",
    do: "ادمجها مع فئة قريبة، أو احذفها لو ما عندك خطة محتوى",
  },
] as const;

export default function OrganizationGuidelinesPage() {
  const colorMap: Record<string, { border: string; bg: string; text: string; iconBg: string }> = {
    blue: { border: "border-blue-500/30", bg: "bg-blue-500/[0.05]", text: "text-blue-400", iconBg: "bg-blue-500/15" },
    violet: { border: "border-violet-500/30", bg: "bg-violet-500/[0.05]", text: "text-violet-400", iconBg: "bg-violet-500/15" },
    emerald: { border: "border-emerald-500/30", bg: "bg-emerald-500/[0.05]", text: "text-emerald-400", iconBg: "bg-emerald-500/15" },
  };

  return (
    <GuidelineLayout
      title="تنظيم المحتوى — Categories · Tags · Industries"
      description="3 طرق لتنظيم المحتوى · فهمها في دقيقة واحدة"
    >

      {/* ── 3 cards: ما الفرق؟ ─────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {types.map((t) => {
          const Icon = t.icon;
          const c = colorMap[t.color];
          return (
            <Card key={t.name} className={`${c.border} ${c.bg}`}>
              <CardContent className="p-5">
                <div className="flex items-center gap-2 mb-3">
                  <div className={`p-2 rounded-lg ${c.iconBg}`}>
                    <Icon className={`h-5 w-5 ${c.text}`} />
                  </div>
                  <h3 className={`text-base font-bold ${c.text} leading-tight`}>{t.name}</h3>
                </div>
                <div className="space-y-2.5">
                  <div>
                    <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-1">متى تستخدمه؟</p>
                    <p className="text-sm font-medium leading-relaxed">{t.when}</p>
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-1">أمثلة</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">{t.example}</p>
                  </div>
                  <div className={`mt-3 pt-3 border-t ${c.border}`}>
                    <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-1">القاعدة الذهبية</p>
                    <p className={`text-xs font-bold ${c.text} leading-relaxed`}>{t.rule}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* ── شجرة قرار في 30 ثانية ─────────────────────────── */}
      <Card className="border-primary/30 bg-primary/[0.04]">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <HelpCircle className="h-5 w-5 text-primary shrink-0" />
            <h2 className="text-lg font-bold">حيران؟ — اسأل نفسك واحد من هذي الـ 3 أسئلة</h2>
          </div>
          <div className="space-y-3">
            {decisionTree.map((d, i) => (
              <div key={i} className="flex items-center gap-3 flex-wrap">
                <span className="shrink-0 w-7 h-7 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center text-sm font-bold text-primary">
                  {i + 1}
                </span>
                <p className="text-sm flex-1 min-w-[200px] leading-relaxed">{d.question}</p>
                <span className="text-muted-foreground text-lg">←</span>
                <span className="text-sm font-bold text-primary px-3 py-1 rounded-md bg-primary/10 border border-primary/30 shrink-0">
                  {d.answer}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ── أخطاء شائعة ───────────────────────────────────── */}
      <Card className="border-red-500/25 bg-red-500/[0.03]">
        <CardContent className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xl">⚠️</span>
            <h2 className="text-base font-bold text-red-400">3 أخطاء شائعة — تجنّبها</h2>
          </div>
          <div className="space-y-3">
            {commonMistakes.map((m, i) => (
              <div key={i} className="rounded-lg border border-red-500/20 bg-background/60 p-4 space-y-2">
                <p className="text-sm font-bold flex items-start gap-2">
                  <span className="text-red-400 shrink-0">❌</span>
                  <span>{m.wrong}</span>
                </p>
                <p className="text-xs text-muted-foreground leading-relaxed ps-6">
                  <strong className="text-foreground">السبب:</strong> {m.why}
                </p>
                <p className="text-xs leading-relaxed ps-6 flex items-start gap-1.5">
                  <span className="text-emerald-400 shrink-0">✓</span>
                  <span><strong className="text-emerald-400">الحل:</strong> {m.do}</span>
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ── النظام يحلها لك (footer) ─────────────────────── */}
      <Card className="border-blue-500/25 bg-blue-500/[0.04]">
        <CardContent className="p-4">
          <div className="flex items-start gap-2.5">
            <Zap className="h-4 w-4 text-blue-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-blue-400 mb-1">ما يحتاج تعمله — النظام يحلها</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                الرابط (Slug) · عنوان SEO · وصف SEO · صورة المشاركة → كلها تُولَّد تلقائياً من الاسم. أنت تكتب الاسم بس، الباقي على النظام.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

    </GuidelineLayout>
  );
}
