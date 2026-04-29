"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import {
  Mic2, Users, Target, ShieldAlert, MapPin, FileText,
  Heart, MessageCircleQuestion, Lightbulb, Swords, Stethoscope,
  CheckCircle2, AlertCircle, Loader2,
} from "lucide-react";
import { saveIntakeAction } from "../actions/save-intake";
import type { ClientIntake } from "../lib/intake-types";
import { INTAKE_SCHEMA_VERSION } from "../lib/intake-types";

interface IntakeFormProps {
  initial: ClientIntake | null;
  intakeUpdatedAt: Date | null;
  detected?: { gbpUrl: string | null } | null;
  industryName?: string | null;
  country?: string | null;
}

// YMYL = "Your Money or Your Life" — Google E-E-A-T category. Section 11 (reviewer)
// only shows for clients in regulated/sensitive industries where unverified claims
// are dangerous (medical, financial, legal).
const YMYL_KEYWORDS = [
  "طب", "طبي", "طبية", "صحة", "صحي", "صحية", "دواء", "أدوية", "صيدلة", "صيدلية",
  "مستشفى", "عيادة", "تجميل طبي", "أسنان", "نفسي", "علاج",
  "مالي", "مالية", "بنك", "بنوك", "تأمين", "استثمار", "تمويل", "مصرفي",
  "قانون", "قانوني", "قانونية", "محاماة", "محامي",
  "medical", "health", "pharmacy", "dental", "clinic", "hospital", "therapy",
  "financial", "banking", "insurance", "investment", "wealth",
  "legal", "law", "attorney", "lawyer",
];

function isYmylIndustry(name: string | null | undefined): boolean {
  if (!name) return false;
  const lower = name.toLowerCase();
  return YMYL_KEYWORDS.some((kw) => lower.includes(kw.toLowerCase()));
}

// ─── OPTION SETS (click-only choices to minimize typing) ─────────────────────
const TONE_OPTIONS = [
  "ودّي ومحادثة", "رسمي ومحترف", "علمي ومدروس", "بسيط ومباشر",
  "فكاهي ومرح", "فاخر ومتميّز", "تعليمي ومرشد",
];

// Seasons grouped by country — common ones always shown, country-specific ones
// shown based on the same toggle that controls citation sources.
const SEASON_OPTIONS = {
  COMMON: [
    "رمضان",
    "عيد الفطر",
    "عيد الأضحى",
    "الصيف",
    "العودة للمدارس",
    "الجمعة البيضاء",
    "لا تأثير موسمي",
  ],
  SA: [
    "اليوم الوطني السعودي",
    "يوم التأسيس",
    "موسم الرياض / جدة",
  ],
  EG: [
    "شم النسيم",
    "أعياد قبطية",
    "مناسبات وطنية مصرية",
  ],
};

// Content-focus options (not business outcomes — avoids implying guaranteed results)
const CONTENT_FOCUS_OPTIONS = [
  { value: "introductory", label: "تعريفي (يشرح من نحن وماذا نقدّم)" },
  { value: "educational", label: "تثقيفي (يعلّم القارئ في مجالنا)" },
  { value: "comparative", label: "مقارنات ودلائل اختيار" },
  { value: "technical", label: "متخصّص فنّي (للمتخصصين / B2B)" },
  { value: "local", label: "محلّي / إقليمي (مخصّص لمنطقة جغرافية)" },
  { value: "trust-building", label: "يبني الثقة والمصداقية (case studies, شهادات)" },
];

const COMMON_FORBIDDEN_KEYWORDS = [
  "رخيص", "مضمون 100%", "فوري", "سحري", "الأرخص في السوق", "بدون منافس",
];

const COMMON_FORBIDDEN_CLAIMS = [
  "يعالج المرض", "نتائج خلال 24 ساعة", "بدون آثار جانبية",
  "أفضل في العالم", "موافقة طبية رسمية",
];

const COMMON_OBJECTIONS = [
  "السعر مرتفع", "الجودة غير ثابتة", "الكمية الدنيا عالية",
  "مدة التوصيل طويلة", "صعوبة الاسترجاع", "عدم وضوح التواصل",
  "قلّة الخبرة المثبتة", "عدم وجود ضمان", "صعوبة التخصيص", "شك في المصداقية",
];

const FUNNEL_OPTIONS = [
  { value: "awareness", label: "لا يعرف أن الخدمة موجودة" },
  { value: "consideration", label: "يقارن بين الخيارات" },
  { value: "decision", label: "جاهز للشراء" },
  { value: "mixed", label: "خليط من الكل" },
];

const CTA_OPTIONS = [
  { value: "call", label: "📞 اتصال / واتساب" },
  { value: "form", label: "📝 نموذج تواصل" },
  { value: "appointment", label: "📅 حجز موعد / استشارة" },
  { value: "newsletter", label: "📧 اشتراك في النشرة" },
  { value: "product", label: "🛒 صفحة منتج محدد" },
  { value: "education", label: "📚 فقط تثقيف (بدون CTA)" },
];

// Citation sources grouped by country — toggled by client. International sources
// always shown. All names verified against each agency's official Arabic naming.
const CITATION_SOURCES = {
  SA: [
    "هيئة الغذاء والدواء السعودية (SFDA)",
    "وزارة الصحة السعودية",
    "هيئة المواصفات والمقاييس (SASO)",
    "الهيئة العامة للإحصاء (GASTAT)",
    "البنك المركزي السعودي (SAMA)",
  ],
  EG: [
    "هيئة الدواء المصرية (EDA)",
    "وزارة الصحة المصرية",
    "البنك المركزي المصري",
    "الجهاز المركزي للإحصاء (CAPMAS)",
  ],
  INTL: [
    "منظمة الصحة العالمية (WHO)",
    "Statista",
    "المنظمة الدولية للتقييس (ISO)",
  ],
};

type MarketCountry = "SA" | "EG";

function detectDefaultMarket(country: string | null | undefined): MarketCountry {
  if (!country) return "SA";
  const lower = country.toLowerCase();
  if (lower.includes("مصر") || lower.includes("egypt") || lower === "eg") return "EG";
  return "SA";
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function toggleArrayItem(arr: string[] | null | undefined, item: string): string[] {
  const cur = arr ?? [];
  return cur.includes(item) ? cur.filter((x) => x !== item) : [...cur, item];
}

function Pill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-4 py-1.5 text-sm transition ${
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-input bg-background hover:bg-muted"
      }`}
    >
      {children}
    </button>
  );
}

function SectionHeader({
  icon: Icon,
  step,
  totalSections,
  title,
  description,
  filled,
  total,
}: {
  icon: React.ComponentType<{ className?: string }>;
  step: number;
  totalSections: number;
  title: string;
  description: string;
  filled: number;
  total: number;
}) {
  const complete = total > 0 && filled === total;
  return (
    <div className="flex items-start gap-3 px-6 pt-6 pb-3 border-b">
      <div
        className={`flex-shrink-0 w-10 h-10 rounded-xl grid place-items-center ${
          complete ? "bg-emerald-100 text-emerald-700" : "bg-primary/10 text-primary"
        }`}
      >
        <Icon className="h-5 w-5" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-muted-foreground">{step}/{totalSections}</span>
          <h3 className="text-base font-bold">{title}</h3>
          {complete && <CheckCircle2 className="h-4 w-4 text-emerald-600" />}
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
      </div>
      <span
        className={`flex-shrink-0 text-xs px-2 py-1 rounded-full font-medium ${
          complete
            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
            : "bg-muted text-muted-foreground"
        }`}
      >
        {filled}/{total}
      </span>
    </div>
  );
}

// ─── Main Form ──────────────────────────────────────────────────────────────
export function IntakeForm({ initial, intakeUpdatedAt, detected, industryName, country }: IntakeFormProps) {
  const isYmyl = isYmylIndustry(industryName);
  const totalSections = isYmyl ? 11 : 10;
  const [marketCountry, setMarketCountry] = useState<MarketCountry>(
    detectDefaultMarket(country)
  );
  const visibleCitationSources = [
    ...CITATION_SOURCES[marketCountry],
    ...CITATION_SOURCES.INTL,
  ];
  const visibleSeasons = [
    ...SEASON_OPTIONS.COMMON,
    ...SEASON_OPTIONS[marketCountry],
  ];
  // Pre-fill auto-detected Google Business Profile URL on first load
  const seed: ClientIntake = (() => {
    const base = initial ?? { version: INTAKE_SCHEMA_VERSION };
    if (!detected?.gbpUrl) return base;
    if (base.technical?.googleBusinessProfileUrl) return base;
    return { ...base, technical: { googleBusinessProfileUrl: detected.gbpUrl } };
  })();
  const [data, setData] = useState<ClientIntake>(seed);
  const autoDetectedGbp = !!detected?.gbpUrl;
  const [pending, startTransition] = useTransition();
  const [savedAt, setSavedAt] = useState<Date | null>(intakeUpdatedAt);
  const [error, setError] = useState<string | null>(null);

  function handleSave() {
    setError(null);
    startTransition(async () => {
      const res = await saveIntakeAction(data);
      if (res.ok) setSavedAt(new Date());
      else setError(res.error);
    });
  }

  const update = <K extends keyof ClientIntake>(key: K, value: ClientIntake[K]) =>
    setData((p) => ({ ...p, [key]: value }));

  // ─── Per-section completion counts ─────────────────────────────────────────
  const counts = {
    voice: data.voice?.tone ? 1 : 0,
    audience: data.audience?.description ? 1 : 0,
    goals: data.goals?.primary ? 1 : 0,
    policy:
      ((data.policy?.forbiddenKeywords?.length ?? 0) > 0 ? 1 : 0) +
      ((data.policy?.forbiddenClaims?.length ?? 0) > 0 ? 1 : 0) +
      (data.policy?.competitiveMentionsAllowed !== undefined ? 1 : 0),
    technical: data.technical?.googleBusinessProfileUrl ? 1 : 0,
    business: data.business?.brief ? 1 : 0,
    story:
      (data.story?.foundingStory ? 1 : 0) +
      (data.story?.expertise ? 1 : 0) +
      ((data.story?.seasons?.length ?? 0) > 0 ? 1 : 0),
    customers:
      (data.customers?.bigProblem ? 1 : 0) +
      ((data.customers?.objections?.length ?? 0) > 0 ? 1 : 0) +
      (data.customers?.faqs ? 1 : 0) +
      ((data.customers?.funnelStage?.length ?? 0) > 0 ? 1 : 0),
    strategy:
      (data.strategy?.mainProductFocus ? 1 : 0) +
      (data.strategy?.topicIdeas ? 1 : 0) +
      (data.strategy?.evidence ? 1 : 0) +
      (data.strategy?.preferredCta ? 1 : 0) +
      (data.strategy?.citationSources ? 1 : 0),
    competition:
      ((data.competition?.competitors?.[0]?.name?.length ?? 0) > 0 ? 1 : 0) +
      ((data.competition?.competitors?.[1]?.name?.length ?? 0) > 0 ? 1 : 0) +
      ((data.competition?.competitors?.[2]?.name?.length ?? 0) > 0 ? 1 : 0) +
      (data.competition?.gaps ? 1 : 0),
    ymyl: data.ymylReviewer?.name ? 1 : 0,
  };

  const totals = {
    voice: 1, audience: 1, goals: 1, policy: 3, technical: 1, business: 1,
    story: 3, customers: 4, strategy: 5, competition: 4,
    ymyl: isYmyl ? 1 : 0,
  };

  const totalFilled = Object.values(counts).reduce((a, b) => a + b, 0);
  const totalFields = Object.values(totals).reduce((a, b) => a + b, 0);
  const progress = Math.round((totalFilled / totalFields) * 100);

  return (
    <div className="flex flex-col gap-5">
      {/* ─── Top progress strip ─────────────────────────────────────────── */}
      <div className="rounded-xl border bg-card p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">اكتمال معلومات نشاطك</span>
          <span className="text-sm font-bold tabular-nums">
            {totalFilled} / {totalFields} · {progress}%
          </span>
        </div>
        <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${
              progress === 100 ? "bg-emerald-500" : "bg-primary"
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-2 p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg">
          <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* ─── Global Market Toggle — affects seasons (sec 7) + citations (sec 9) ─── */}
      <div className="rounded-xl border bg-card p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Label className="text-sm font-bold">السوق المستهدف</Label>
            <p className="text-xs text-muted-foreground mt-0.5">
              نستخدمه لتخصيص المواسم ومصادر الاستشهاد
            </p>
          </div>
          <div className="inline-flex gap-1 rounded-lg border bg-muted/30 p-1">
            <button
              type="button"
              onClick={() => setMarketCountry("SA")}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition ${
                marketCountry === "SA"
                  ? "bg-background shadow-sm text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              🇸🇦 السعودية
            </button>
            <button
              type="button"
              onClick={() => setMarketCountry("EG")}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition ${
                marketCountry === "EG"
                  ? "bg-background shadow-sm text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              🇪🇬 مصر
            </button>
          </div>
        </div>
      </div>

      {/* ─── Voice (position 6) ─────────────────────────────────────── */}
      <Card className="overflow-hidden p-0 order-6">
        <SectionHeader
          totalSections={totalSections}
          icon={Mic2}
          step={6}
          title="نبرة الكتابة"
          description="اختر النبرة المناسبة لمحتواك"
          filled={counts.voice}
          total={totals.voice}
        />
        <CardContent className="p-6">
          <div className="space-y-2">
            <Label className="text-sm">النبرة الأساسية</Label>
            <select
              value={data.voice?.tone ?? ""}
              onChange={(e) => update("voice", { tone: e.target.value || null })}
              className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
            >
              <option value="">— اختر —</option>
              {TONE_OPTIONS.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* ─── Audience (position 3) ──────────────────────────────────── */}
      <Card className="overflow-hidden p-0 order-3">
        <SectionHeader
          totalSections={totalSections}
          icon={Users}
          step={3}
          title="عميلك المثالي"
          description="صفه في جملة واحدة (السن + المهنة + المكان)"
          filled={counts.audience}
          total={totals.audience}
        />
        <CardContent className="p-6">
          <Textarea
            rows={3}
            maxLength={300}
            value={data.audience?.description ?? ""}
            onChange={(e) => update("audience", { description: e.target.value })}
            placeholder="مثال: صاحبة محل تجميل، 28-45 سنة، مدن خليجية كبرى، تبحث عن منتجات حلال..."
          />
        </CardContent>
      </Card>

      {/* ─── Content Focus (position 5) ─────────────────────────────── */}
      <Card className="overflow-hidden p-0 order-5">
        <SectionHeader
          totalSections={totalSections}
          icon={Target}
          step={5}
          title="اتجاه المحتوى المفضّل"
          description="إيش نوع المحتوى الأكثر فائدة لنشاطك؟"
          filled={counts.goals}
          total={totals.goals}
        />
        <CardContent className="p-6">
          <div className="space-y-2">
            <Label className="text-sm">اختر التركيز الأساسي</Label>
            <div className="grid grid-cols-1 gap-2">
              {CONTENT_FOCUS_OPTIONS.map((opt) => {
                const active = data.goals?.primary === opt.value;
                return (
                  <label
                    key={opt.value}
                    className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 text-sm transition ${
                      active ? "border-primary bg-primary/5" : "border-input hover:bg-muted"
                    }`}
                  >
                    <input
                      type="radio"
                      name="content-focus"
                      checked={active}
                      onChange={() => update("goals", { primary: opt.value })}
                    />
                    {opt.label}
                  </label>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ─── Policy (position 8) ────────────────────────────────────── */}
      <Card className="overflow-hidden p-0 order-8">
        <SectionHeader
          totalSections={totalSections}
          icon={ShieldAlert}
          step={8}
          title="سياسة المحتوى"
          description="إيش الممنوع في محتواك (ضغطة فقط)"
          filled={counts.policy}
          total={totals.policy}
        />
        <CardContent className="p-6 space-y-5">
          <div className="space-y-2">
            <Label className="text-sm">كلمات ممنوعة شائعة</Label>
            <div className="flex flex-wrap gap-2">
              {COMMON_FORBIDDEN_KEYWORDS.map((kw) => (
                <Pill
                  key={kw}
                  active={data.policy?.forbiddenKeywords?.includes(kw) ?? false}
                  onClick={() =>
                    update("policy", {
                      ...data.policy,
                      forbiddenKeywords: toggleArrayItem(data.policy?.forbiddenKeywords, kw),
                    })
                  }
                >
                  {kw}
                </Pill>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm">ادعاءات تريد منا تجنّبها (اختر ما ينطبق)</Label>
            <p className="text-xs text-muted-foreground">
              هذي اقتراحات شائعة — اختر فقط اللي يخصّ نشاطك. ما تختاره يُعتبر ممنوعاً في محتواك.
            </p>
            <div className="flex flex-wrap gap-2">
              {COMMON_FORBIDDEN_CLAIMS.map((cl) => (
                <Pill
                  key={cl}
                  active={data.policy?.forbiddenClaims?.includes(cl) ?? false}
                  onClick={() =>
                    update("policy", {
                      ...data.policy,
                      forbiddenClaims: toggleArrayItem(data.policy?.forbiddenClaims, cl),
                    })
                  }
                >
                  {cl}
                </Pill>
              ))}
            </div>
          </div>

          <label className="flex cursor-pointer items-center gap-3 rounded-lg border p-3 text-sm">
            <input
              type="checkbox"
              checked={data.policy?.competitiveMentionsAllowed ?? false}
              onChange={(e) =>
                update("policy", { ...data.policy, competitiveMentionsAllowed: e.target.checked })
              }
            />
            <span>السماح بذكر المنافسين بالاسم في المقالات</span>
          </label>
        </CardContent>
      </Card>

      {/* ─── Google Business Profile (position 10) ─────────────────── */}
      <Card className="overflow-hidden p-0 order-10">
        <SectionHeader
          totalSections={totalSections}
          icon={MapPin}
          step={10}
          title="بطاقة شركتك على Google Maps"
          description="رابط Google Business Profile (اختياري) — يفيد في البحث المحلي"
          filled={counts.technical}
          total={totals.technical}
        />
        <CardContent className="p-6 space-y-3">
          {autoDetectedGbp ? (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">
              🤖 وجدنا الرابط تلقائياً من موقعك — تقدر تعدّله لو غير صحيح.
            </div>
          ) : (
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-900">
              💡 ما لقينا الرابط من موقعك. لو عندك بطاقة على Google Maps، أضف الرابط هنا.
              تقدر تجدّه بالبحث في Google عن اسم شركتك ثم نسخ رابط البطاقة.
            </div>
          )}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm">رابط Google Business Profile</Label>
              {data.technical?.googleBusinessProfileUrl &&
                detected?.gbpUrl === data.technical.googleBusinessProfileUrl && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    ✓ اكتُشف تلقائياً
                  </span>
                )}
            </div>
            <Input
              dir="ltr"
              value={data.technical?.googleBusinessProfileUrl ?? ""}
              onChange={(e) =>
                update("technical", { googleBusinessProfileUrl: e.target.value })
              }
              placeholder="https://g.page/your-business  أو  https://maps.app.goo.gl/..."
            />
          </div>
        </CardContent>
      </Card>

      {/* ─── Business Brief (position 1 — most important) ──────────── */}
      <Card className="overflow-hidden p-0 order-1">
        <SectionHeader
          totalSections={totalSections}
          icon={FileText}
          step={1}
          title="ملخص نشاطك"
          description="فقرة 3-5 أسطر تصف نشاطك (تستخدم في About + JSON-LD)"
          filled={counts.business}
          total={totals.business}
        />
        <CardContent className="p-6">
          <Textarea
            rows={4}
            value={data.business?.brief ?? ""}
            onChange={(e) => update("business", { brief: e.target.value })}
            placeholder="مثال: كيما زون مصنع سعودي لمستحضرات التجميل بـ 15 سنة خبرة..."
          />
        </CardContent>
      </Card>

      {/* ─── Story (position 2 — E-E-A-T) ────────────────────────── */}
      <Card className="overflow-hidden p-0 order-2">
        <SectionHeader
          totalSections={totalSections}
          icon={Heart}
          step={2}
          title="قصتك وخبرتك"
          description="القصة الإنسانية + الشهادات + المواسم (E-E-A-T)"
          filled={counts.story}
          total={totals.story}
        />
        <CardContent className="p-6 space-y-4">
          <div className="space-y-2">
            <Label className="text-sm">القصة الإنسانية وراء النشاط</Label>
            <Textarea
              rows={3}
              maxLength={500}
              value={data.story?.foundingStory ?? ""}
              onChange={(e) => update("story", { ...data.story, foundingStory: e.target.value })}
              placeholder="مثال: بدأت في مطبخ بيتي 2010 عندما لاحظت..."
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm">خبرتك / شهاداتك / جوائزك</Label>
            <Textarea
              rows={3}
              maxLength={600}
              value={data.story?.expertise ?? ""}
              onChange={(e) => update("story", { ...data.story, expertise: e.target.value })}
              placeholder="مثال: 15 سنة خبرة، شهادة ISO 22716، عملنا مع 200+ علامة..."
            />
            <p className="rounded-md border border-amber-200 bg-amber-50 p-2 text-xs text-amber-900">
              ⚠️ ضع فقط الشهادات والجوائز الموثّقة — ستظهر للقرّاء وفي JSON-LD المرئي لـ Google.
            </p>
          </div>
          <div className="space-y-2">
            <Label className="text-sm">مواسم تتغير فيها أعمالك</Label>
            <p className="text-xs text-muted-foreground">
              تتبع السوق المختار في أعلى الصفحة.
            </p>
            <div className="flex flex-wrap gap-2">
              {visibleSeasons.map((s) => (
                <Pill
                  key={s}
                  active={data.story?.seasons?.includes(s) ?? false}
                  onClick={() =>
                    update("story", { ...data.story, seasons: toggleArrayItem(data.story?.seasons, s) })
                  }
                >
                  {s}
                </Pill>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ─── Customers (position 4) ────────────────────────────────── */}
      <Card className="overflow-hidden p-0 order-4">
        <SectionHeader
          totalSections={totalSections}
          icon={MessageCircleQuestion}
          step={4}
          title="عملاؤك ومشاكلهم"
          description="المشكلة + الاعتراضات + FAQs + مرحلة الشراء"
          filled={counts.customers}
          total={totals.customers}
        />
        <CardContent className="p-6 space-y-4">
          <div className="space-y-2">
            <Label className="text-sm">المشكلة الكبرى التي يأتيك العميل ليحلها</Label>
            <Textarea
              rows={2}
              maxLength={200}
              value={data.customers?.bigProblem ?? ""}
              onChange={(e) => update("customers", { ...data.customers, bigProblem: e.target.value })}
              placeholder="مثال: العميل تعب من المنتجات المستوردة الباهظة..."
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm">الاعتراضات الشائعة (اختر ما ينطبق)</Label>
            <div className="flex flex-wrap gap-2">
              {COMMON_OBJECTIONS.map((obj) => (
                <Pill
                  key={obj}
                  active={data.customers?.objections?.includes(obj) ?? false}
                  onClick={() =>
                    update("customers", {
                      ...data.customers,
                      objections: toggleArrayItem(data.customers?.objections, obj),
                    })
                  }
                >
                  {obj}
                </Pill>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm">أهم 5-10 أسئلة يكررها عملاؤك (سؤال في كل سطر)</Label>
            <Textarea
              rows={5}
              value={data.customers?.faqs ?? ""}
              onChange={(e) => update("customers", { ...data.customers, faqs: e.target.value })}
              placeholder="كم أقل كمية تطلبون؟&#10;هل تنتجون بشعار خاص؟"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm">في أي مرحلة يصلك العميل عادة؟</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {FUNNEL_OPTIONS.map((opt) => {
                const active = data.customers?.funnelStage?.includes(opt.value) ?? false;
                return (
                  <label
                    key={opt.value}
                    className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 text-sm transition ${
                      active ? "border-primary bg-primary/5" : "border-input hover:bg-muted"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={active}
                      onChange={() =>
                        update("customers", {
                          ...data.customers,
                          funnelStage: toggleArrayItem(data.customers?.funnelStage, opt.value),
                        })
                      }
                    />
                    {opt.label}
                  </label>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ─── Strategy (position 7) ─────────────────────────────────── */}
      <Card className="overflow-hidden p-0 order-7">
        <SectionHeader
          totalSections={totalSections}
          icon={Lightbulb}
          step={7}
          title="استراتيجية المحتوى"
          description="المنتج المركّز عليه + المواضيع + CTA + المصادر"
          filled={counts.strategy}
          total={totals.strategy}
        />
        <CardContent className="p-6 space-y-4">
          <div className="space-y-2">
            <Label className="text-sm">المنتج / الخدمة اللي تحب نركّز عليها في المحتوى</Label>
            <Input
              maxLength={200}
              value={data.strategy?.mainProductFocus ?? ""}
              onChange={(e) => update("strategy", { ...data.strategy, mainProductFocus: e.target.value })}
              placeholder="مثال: خط منتجات Hair Care الجديد"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm">أفكار مواضيع مقترحة (موضوع في كل سطر)</Label>
            <Textarea
              rows={5}
              value={data.strategy?.topicIdeas ?? ""}
              onChange={(e) => update("strategy", { ...data.strategy, topicIdeas: e.target.value })}
              placeholder="كيف أختار شريك تصنيع؟&#10;الفرق بين الحلال وغير الحلال"
            />
            <p className="text-xs text-muted-foreground">
              نختار من المواضيع المقترحة بناءً على البحث والمنافسة وما يخدم نشاطك أكثر — قد لا تُغطّى كلها.
            </p>
          </div>
          <div className="space-y-2">
            <Label className="text-sm">بيانات / أرقام / شهادات يمكن استخدامها في المحتوى</Label>
            <Textarea
              rows={3}
              value={data.strategy?.evidence ?? ""}
              onChange={(e) => update("strategy", { ...data.strategy, evidence: e.target.value })}
              placeholder="مثال: عملاء راضون 95% / 200+ علامة عملت معنا..."
            />
            <p className="rounded-md border border-amber-200 bg-amber-50 p-2 text-xs text-amber-900">
              ⚠️ ضع فقط الأرقام والشهادات القابلة للإثبات — ستُنشر للقرّاء.
            </p>
          </div>
          <div className="space-y-2">
            <Label className="text-sm">CTA المفضل في نهاية المقالات</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {CTA_OPTIONS.map((opt) => {
                const active = data.strategy?.preferredCta === opt.value;
                return (
                  <label
                    key={opt.value}
                    className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 text-sm transition ${
                      active ? "border-primary bg-primary/5" : "border-input hover:bg-muted"
                    }`}
                  >
                    <input
                      type="radio"
                      name="cta"
                      checked={active}
                      onChange={() => update("strategy", { ...data.strategy, preferredCta: opt.value })}
                    />
                    {opt.label}
                  </label>
                );
              })}
            </div>
          </div>
          <div className="space-y-3">
            <Label className="text-sm">مصادر للاستشهاد بها (اختر ما يناسبك)</Label>
            <p className="text-xs text-muted-foreground">
              تتبع السوق المختار في أعلى الصفحة.
            </p>
            <div className="flex flex-wrap gap-2">
              {visibleCitationSources.map((src) => {
                const active = (data.strategy?.citationSources ?? "").includes(src);
                return (
                  <Pill
                    key={src}
                    active={active}
                    onClick={() => {
                      const current = data.strategy?.citationSources ?? "";
                      const list = current
                        .split(/[,،\n]/)
                        .map((s) => s.trim())
                        .filter(Boolean);
                      const next = list.includes(src)
                        ? list.filter((s) => s !== src)
                        : [...list, src];
                      update("strategy", { ...data.strategy, citationSources: next.join("، ") });
                    }}
                  >
                    {src}
                  </Pill>
                );
              })}
            </div>
            <Input
              value={data.strategy?.citationSources ?? ""}
              onChange={(e) => update("strategy", { ...data.strategy, citationSources: e.target.value })}
              placeholder="مصادر إضافية (مفصولة بفواصل)"
            />
          </div>
        </CardContent>
      </Card>

      {/* ─── Competition (position 9) ──────────────────────────────── */}
      <Card className="overflow-hidden p-0 order-9">
        <SectionHeader
          totalSections={totalSections}
          icon={Swords}
          step={9}
          title="المنافسة"
          description="أقوى 3 منافسين + الفجوات اللي تشوفها"
          filled={counts.competition}
          total={totals.competition}
        />
        <CardContent className="p-6 space-y-4">
          {[0, 1, 2].map((i) => {
            const c = data.competition?.competitors?.[i] ?? { name: "", url: "", edge: "" };
            return (
              <div key={i} className="space-y-2 rounded-lg bg-muted/30 p-3">
                <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                  <span className="grid h-5 w-5 place-items-center rounded-full bg-primary/15 text-primary text-[10px] font-bold">
                    {i + 1}
                  </span>
                  <span>المنافس {i + 1}</span>
                </div>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <Input
                    placeholder="اسم المنافس"
                    value={c.name ?? ""}
                    onChange={(e) => {
                      const list = [...(data.competition?.competitors ?? [{ name: "" }, { name: "" }, { name: "" }])];
                      list[i] = { ...list[i], name: e.target.value };
                      update("competition", { ...data.competition, competitors: list });
                    }}
                  />
                  <Input
                    dir="ltr"
                    placeholder="https://..."
                    value={c.url ?? ""}
                    onChange={(e) => {
                      const list = [...(data.competition?.competitors ?? [{ name: "" }, { name: "" }, { name: "" }])];
                      list[i] = { ...list[i], name: list[i]?.name ?? "", url: e.target.value };
                      update("competition", { ...data.competition, competitors: list });
                    }}
                  />
                </div>
                <Input
                  placeholder="ما يفعلونه أفضل منك (خدمة، سعر، حضور رقمي، إلخ)"
                  value={c.edge ?? ""}
                  onChange={(e) => {
                    const list = [...(data.competition?.competitors ?? [{ name: "" }, { name: "" }, { name: "" }])];
                    list[i] = { ...list[i], name: list[i]?.name ?? "", edge: e.target.value };
                    update("competition", { ...data.competition, competitors: list });
                  }}
                />
              </div>
            );
          })}
          <div className="space-y-2">
            <Label className="text-sm">الفجوات (اختياري)</Label>
            <Input
              value={data.competition?.gaps ?? ""}
              onChange={(e) => update("competition", { ...data.competition, gaps: e.target.value })}
              placeholder="مثال: عندهم مدونة فعّالة + صور احترافية"
            />
          </div>
        </CardContent>
      </Card>

      {/* ─── YMYL (position 11, conditional) ───────────────────────── */}
      {isYmyl && (
      <Card className="overflow-hidden p-0 border-amber-200 order-11">
        <SectionHeader
          totalSections={totalSections}
          icon={Stethoscope}
          step={11}
          title="مراجع المحتوى الحساس"
          description="للقطاعات الحساسة فقط: طبي · صحة · مالي · قانوني"
          filled={counts.ymyl}
          total={totals.ymyl}
        />
        <CardContent className="p-6 space-y-4">
          <p className="rounded-md border border-amber-200 bg-amber-50 p-2 text-xs text-amber-900">
            ⚠️ تأكّد من صحة المؤهل والترخيص قبل الإدخال — ستظهر هذه المعلومات للقرّاء وفي JSON-LD المرئي لـ Google. أي ادعاء غير موثّق قد يعرّضك لمسؤولية قانونية.
          </p>
          <div className="space-y-1.5">
            <Label className="text-sm">الاسم الكامل</Label>
            <Input
              value={data.ymylReviewer?.name ?? ""}
              onChange={(e) =>
                update("ymylReviewer", { ...data.ymylReviewer, name: e.target.value })
              }
              placeholder="مثال: د. أحمد محمد العلي"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm">المؤهل / الترخيص</Label>
            <Input
              value={data.ymylReviewer?.qualification ?? ""}
              onChange={(e) =>
                update("ymylReviewer", { ...data.ymylReviewer, qualification: e.target.value })
              }
              placeholder="مثال: طبيب أسنان مرخّص — رقم الترخيص 12345"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm">رابط السيرة الذاتية / LinkedIn (اختياري)</Label>
            <Input
              dir="ltr"
              value={data.ymylReviewer?.profileUrl ?? ""}
              onChange={(e) =>
                update("ymylReviewer", { ...data.ymylReviewer, profileUrl: e.target.value })
              }
              placeholder="https://linkedin.com/in/..."
            />
          </div>
        </CardContent>
      </Card>
      )}

      {/* ─── Sticky Save Bar (always last) ──────────────────────────── */}
      <div className="sticky bottom-4 z-30 order-[100]">
        <div className="flex items-center justify-between gap-4 rounded-xl border bg-background/95 backdrop-blur shadow-lg p-3">
          <div className="flex items-center gap-2 text-xs">
            {pending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                <span className="text-muted-foreground">جارٍ الحفظ...</span>
              </>
            ) : savedAt ? (
              <>
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span className="text-emerald-700 font-medium">
                  حُفظ · {new Intl.DateTimeFormat("ar-SA", { timeStyle: "short" }).format(savedAt)}
                </span>
              </>
            ) : (
              <span className="text-muted-foreground">جاهز للحفظ</span>
            )}
          </div>
          <Button onClick={handleSave} disabled={pending} size="sm" className="font-bold">
            {pending ? "جارٍ الحفظ..." : "حفظ التغييرات"}
          </Button>
        </div>
      </div>
    </div>
  );
}
