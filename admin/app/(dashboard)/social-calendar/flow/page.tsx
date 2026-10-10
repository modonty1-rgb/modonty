import Link from "next/link";
import type { SocialPostStatus } from "@prisma/client";
import {
  ArrowDown,
  ArrowRight,
  CheckCircle2,
  CircleCheck,
  Megaphone,
  Palette,
  PenLine,
  RotateCcw,
  Search,
  Send,
  type LucideIcon,
} from "lucide-react";

import { IconTelegram } from "@modonty/shared/lib/icons";

import { STATUS_BADGE, STATUS_LABEL, STATUS_ORDER } from "../helpers/social-labels";

export const metadata = { title: "سير العمل — Social Calendar" };

interface StageTheme {
  iconBg: string;
  headerBg: string;
  border: string;
  labelText: string;
  stepBg: string;
}

const THEMES: Record<number, StageTheme> = {
  1: {
    iconBg: "bg-violet-500",
    headerBg: "bg-violet-50 dark:bg-violet-950/60",
    border: "border-violet-200 dark:border-violet-800",
    labelText: "text-violet-900 dark:text-violet-200",
    stepBg: "bg-violet-50 dark:bg-violet-950/60",
  },
  2: {
    iconBg: "bg-orange-500",
    headerBg: "bg-orange-50 dark:bg-orange-950/60",
    border: "border-orange-200 dark:border-orange-800",
    labelText: "text-orange-900 dark:text-orange-200",
    stepBg: "bg-orange-50 dark:bg-orange-950/60",
  },
  3: {
    iconBg: "bg-amber-500",
    headerBg: "bg-amber-50 dark:bg-amber-950/60",
    border: "border-amber-200 dark:border-amber-800",
    labelText: "text-amber-900 dark:text-amber-200",
    stepBg: "bg-amber-50 dark:bg-amber-950/60",
  },
  4: {
    iconBg: "bg-blue-500",
    headerBg: "bg-blue-50 dark:bg-blue-950/60",
    border: "border-blue-200 dark:border-blue-800",
    labelText: "text-blue-900 dark:text-blue-200",
    stepBg: "bg-blue-50 dark:bg-blue-950/60",
  },
};

interface Stage {
  id: number;
  role: string;
  roleEn: string;
  icon: LucideIcon;
  status: SocialPostStatus;
  title: string;
  description: string;
  fields?: { label: string; sub: string | null }[];
  steps?: string[];
  telegram: string;
  telegramAuto: boolean;
  feedbackNote?: string;
  transition: string;
}

/**
 * دليل سير العمل — منقول من `JBRSEO/content/app/flow/page.tsx` بنفس المراحل الأربع والحقول
 * والخطوات، مع تحديث ما تغيّر في الأدمن فقط: أسماء الأدوار من `StaffRole`، الرفع على Bunny بدل
 * «رابط Google Drive»، رفض بإشعار، وإرجاع الميديا باير للمنشور (س٧). بلا إيموجي — الأدمن أداة قرار.
 */
const STAGES: Stage[] = [
  {
    id: 1,
    role: "كاتب المحتوى",
    roleEn: "EDITOR",
    icon: PenLine,
    status: "IN_PRODUCTION",
    title: "إنشاء المنشور",
    description: "يبدأ سير العمل بإنشاء منشور جديد. كاتب المحتوى يملأ كل التفاصيل اللازمة للتصميم والإنتاج.",
    fields: [
      { label: "الفكرة", sub: "الفكرة الرئيسية للمنشور — إلزامية" },
      { label: "اليوم", sub: "يوم كامل بسنته" },
      { label: "نوع المحتوى", sub: "فيديو، كاروسيل، بوست، ستوري، ريل" },
      { label: "القنوات", sub: "المنصات المستهدفة" },
      { label: "هدف الحملة", sub: "توعية، تفاعل، عملاء، تحويل" },
      { label: "النص الكامل", sub: null },
      { label: "الخطاف Hook", sub: null },
      { label: "الدعوة للتصرف CTA", sub: null },
      { label: "نبرة الصوت Voice Tone", sub: null },
      { label: "الإلهام Reference", sub: null },
      { label: "السيناريو Script", sub: "رابط خارجي إن وجد" },
      { label: "ملحوظات للمصمم Notes", sub: null },
    ],
    telegram:
      "منشور جديد — الفكرة، نوع المحتوى، القنوات، اليوم، واسم العميل. يُرسل للفريق عند إنشاء منشور جديد فقط، وليس عند التعديل.",
    telegramAuto: false,
    transition: "حفظ المنشور → الحالة تصبح «قيد الإنتاج»",
  },
  {
    id: 2,
    role: "المصمم / المونتير",
    roleEn: "CREATIVE",
    icon: Palette,
    status: "READY_FOR_REVIEW",
    title: "الإنتاج",
    description: "المصمم يدخل صفحة الإنتاج ويشوف كل بيانات المنشور كاملة. يصمم أو يصوّر الإبداع، ثم يرفعه.",
    steps: [
      "يقرأ البريف كامل (النص، الخطاف، CTA، نبرة الصوت، الإلهام، السيناريو)",
      "يصمم / يصوّر / يُنتج الإبداع",
      "يرفع الملفات من صفحة الإنتاج — صور حتى 4MB، فيديو حتى 500MB",
      "يضغط «جاهز للمراجعة» (يحتاج ملفاً واحداً مرفوعاً على الأقل)",
    ],
    telegram: "إبداع جاهز للمراجعة — الفكرة، اليوم، وعدد الملفات. يُرسل فور الضغط على «جاهز للمراجعة»، ويصل كاتبَ المنشور جرسٌ في الأدمن.",
    telegramAuto: true,
    feedbackNote: "إذا رُفض الإبداع يرجع المنشور لـ«قيد الإنتاج» وتظهر ملاحظة الرفض أعلى صفحة الإنتاج — يعدّل ويرفع من جديد.",
    transition: "رفع الملفات + الضغط على «جاهز للمراجعة»",
  },
  {
    id: 3,
    role: "كاتب المحتوى",
    roleEn: "EDITOR",
    icon: Search,
    status: "READY_TO_PUBLISH",
    title: "منح الموافقة",
    description: "كاتب المحتوى يراجع الإبداع من الجدول ويتأكد إنه مطابق للبريف. إما يوافق أو يرفض بملاحظة.",
    steps: [
      "يفتح «منح الموافقة» من صفّ المنشور ويراجع الملفات",
      "يتحقق من مطابقة النص، الفكرة، والأسلوب",
      "إذا موافق → «منح الموافقة — جاهز للنشر»",
      "إذا محتاج تعديل → «رفض» مع سبب الرفض، فيرجع للمصمم",
    ],
    telegram: "جاهز للنشر — يُرسل للميديا باير فور الموافقة، ويصل كل ميديا باير جرسٌ في الأدمن. والرفض يُرسل أيضاً بسببه، ويصل المصمم جرس.",
    telegramAuto: true,
    feedbackNote: "الرفض يعيد المنشور لـ«قيد الإنتاج» ويُعدّ في سجلّ المنشور (كم مرّة رُفض).",
    transition: "الموافقة على الإبداع → «جاهز للنشر»",
  },
  {
    id: 4,
    role: "الميديا باير",
    roleEn: "SOCIAL",
    icon: Megaphone,
    status: "PUBLISHED",
    title: "النشر",
    description: "الميديا باير يدخل صفحة النشر، يضيف تفاصيل الإعلان والميزانية، وينشر المحتوى على المنصات.",
    steps: [
      "يراجع الإبداع النهائي ويحمّل الملفات",
      "يحدد: عضوي أم مدفوع",
      "إذا مدفوع: يضيف الميزانية، العملة، ومدة الإعلان",
      "يحدد موعد النشر (تاريخ + وقت بتوقيت الرياض)",
      "يضيف روابط النشر لكل قناة بعد النشر",
      "يضغط «نشر» — أو «إرجاع للإنتاج» بسبب إلزامي إن وجد مشكلة",
    ],
    telegram: "تم النشر — يُرسل للفريق تلقائياً فور الضغط على «نشر»، ويصل كاتبَ المنشور جرسٌ في الأدمن.",
    telegramAuto: true,
    transition: "الضغط على «نشر» → «تم النشر» (الروابط تبقى قابلة للتعديل)",
  },
];

function TelegramBadge({ message, auto }: { message: string; auto: boolean }) {
  return (
    <div
      className={`flex items-start gap-2.5 rounded-xl border px-4 py-3 ${
        auto
          ? "border-sky-400/30 bg-sky-500/5 dark:border-sky-500/30"
          : "border-purple-200 bg-purple-50 dark:border-purple-800 dark:bg-purple-950/50"
      }`}
    >
      <IconTelegram className={`mt-0.5 h-4 w-4 shrink-0 ${auto ? "text-sky-500" : "text-purple-600 dark:text-purple-400"}`} />
      <div>
        <p className={`mb-0.5 text-xs font-bold ${auto ? "text-sky-600 dark:text-sky-400" : "text-purple-700 dark:text-purple-300"}`}>
          إشعار Telegram — {auto ? "تلقائي" : "اختياري"}
        </p>
        <p className={`text-xs leading-relaxed ${auto ? "text-sky-700/80 dark:text-sky-400/80" : "text-purple-600 dark:text-purple-400"}`}>
          {message}
        </p>
        {!auto && (
          <p className="mt-1 text-[11px] italic text-purple-500/80">يظهر checkbox للمستخدم قبل الحفظ — لا يُرسل عند التعديل</p>
        )}
      </div>
    </div>
  );
}

export default function SocialFlowPage() {
  return (
    <div className="min-h-full">
      <header className="sticky top-0 z-10 -mx-4 -mt-4 border-b border-border bg-card sm:-mx-6 sm:-mt-6">
        <div className="flex h-14 items-center justify-between gap-4 px-5">
          <div className="flex min-w-0 items-center gap-3">
            <Link
              href="/social-calendar"
              aria-label="رجوع"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <ArrowRight className="h-4 w-4" />
            </Link>
            <div className="h-5 w-px shrink-0 bg-border" />
            <h1 className="text-sm font-semibold text-foreground">دليل سير العمل</h1>
            <span className="hidden text-[11px] text-muted-foreground sm:block">— من المنشور إلى النشر</span>
          </div>
          <div className="hidden items-center gap-1.5 md:flex">
            {STATUS_ORDER.map((s) => (
              <span key={s} className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-semibold ${STATUS_BADGE[s]}`}>
                {STATUS_LABEL[s]}
              </span>
            ))}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl py-8">
        <div className="relative">
          <div className="absolute bottom-0 right-[27px] top-0 w-px bg-border" aria-hidden />
          {STAGES.map((stage, i) => {
            const Icon = stage.icon;
            const theme = THEMES[stage.id];
            return (
              <div key={stage.id}>
                <div className="relative flex gap-6">
                  <div className="relative z-10 flex w-14 shrink-0 flex-col items-center">
                    <div className={`flex h-14 w-14 items-center justify-center rounded-2xl text-white shadow-md ring-4 ring-background ${theme.iconBg}`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <span className="mt-2 text-[10px] font-bold tabular-nums text-muted-foreground/50">{stage.id}</span>
                  </div>

                  <div className={`mb-2 flex-1 overflow-hidden rounded-2xl border bg-card shadow-sm ${theme.border}`}>
                    <div className={`flex flex-wrap items-center justify-between gap-3 border-b px-5 py-4 ${theme.headerBg} ${theme.border}`}>
                      <div>
                        <div className="mb-0.5 flex flex-wrap items-center gap-2">
                          <span className={`text-xs font-bold opacity-70 ${theme.labelText}`}>المرحلة {stage.id}</span>
                          <span className="text-muted-foreground/50">·</span>
                          <span className={`text-xs font-semibold ${theme.labelText}`}>{stage.role}</span>
                          <span className={`font-mono text-[10px] opacity-60 ${theme.labelText}`}>{stage.roleEn}</span>
                        </div>
                        <h3 className="text-base font-bold text-foreground">{stage.title}</h3>
                      </div>
                      <span className={`inline-flex shrink-0 items-center rounded-full border px-3 py-1 text-xs font-semibold ${STATUS_BADGE[stage.status]}`}>
                        {STATUS_LABEL[stage.status]}
                      </span>
                    </div>

                    <div className="space-y-4 px-5 py-5">
                      <p className="text-sm leading-relaxed text-muted-foreground">{stage.description}</p>

                      {stage.fields && (
                        <div>
                          <p className="mb-3 text-[11px] font-bold text-muted-foreground/60">الحقول</p>
                          <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                            {stage.fields.map((f) => (
                              <div key={f.label} className="flex items-center gap-2 rounded-lg bg-muted/40 px-3 py-2">
                                <CircleCheck className="h-3 w-3 shrink-0 text-violet-400" />
                                <span className="text-sm font-medium text-foreground">{f.label}</span>
                                {f.sub && <span className="truncate text-[11px] text-muted-foreground/60">{f.sub}</span>}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {stage.steps && (
                        <div>
                          <p className="mb-3 text-[11px] font-bold text-muted-foreground/60">الخطوات</p>
                          <ol className="space-y-2">
                            {stage.steps.map((step, si) => (
                              <li key={step} className="flex items-start gap-3">
                                <span
                                  className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[10px] font-bold ${theme.stepBg} ${theme.labelText} ${theme.border}`}
                                >
                                  {si + 1}
                                </span>
                                <span className="text-sm leading-relaxed text-foreground">{step}</span>
                              </li>
                            ))}
                          </ol>
                        </div>
                      )}

                      <TelegramBadge message={stage.telegram} auto={stage.telegramAuto} />

                      {stage.feedbackNote && (
                        <div className="flex items-start gap-2.5 rounded-xl border border-dashed border-amber-300 bg-amber-50/60 px-4 py-3 dark:border-amber-700 dark:bg-amber-950/40">
                          <RotateCcw className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500" />
                          <p className="text-xs leading-relaxed text-amber-700 dark:text-amber-300">{stage.feedbackNote}</p>
                        </div>
                      )}

                      <div className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 ${theme.stepBg} ${theme.border}`}>
                        <Send className={`h-3.5 w-3.5 shrink-0 ${theme.labelText}`} />
                        <span className={`text-xs font-semibold ${theme.labelText}`}>الانتقال للمرحلة التالية:</span>
                        <span className="text-xs text-foreground">{stage.transition}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {i < STAGES.length - 1 && (
                  <div className="mr-7 flex py-1">
                    <ArrowDown className="h-5 w-5 text-muted-foreground/30" />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="mr-20 mt-4 rounded-2xl border border-green-200 bg-green-50 px-6 py-6 text-center dark:border-green-800 dark:bg-green-950/50">
          <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full border border-green-200 bg-green-100 dark:border-green-700 dark:bg-green-900">
            <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
          <p className="text-lg font-bold text-green-700 dark:text-green-300">تم النشر</p>
          <p className="mt-1 text-sm text-green-600 dark:text-green-400">المنشور اكتمل — المحتوى على الهواء والحالة محدّثة في النظام.</p>
        </div>

        <div className="mr-20 mt-4 rounded-2xl border border-border bg-card px-5 py-4 text-xs leading-relaxed text-muted-foreground">
          <p className="mb-1 font-semibold text-foreground">مَن يفعل ماذا</p>
          <p>
            الإنشاء والتعديل والأرشفة: ADMIN · EDITOR. رفع الإبداع و«جاهز للمراجعة»: ADMIN · EDITOR · CREATIVE. الموافقة
            والرفض: ADMIN · EDITOR. النشر وإرجاع المنشور من «جاهز للنشر»: ADMIN · SOCIAL. والبقية (QC · SALES) يرون التقويم
            للقراءة فقط.
          </p>
        </div>
      </main>
    </div>
  );
}
