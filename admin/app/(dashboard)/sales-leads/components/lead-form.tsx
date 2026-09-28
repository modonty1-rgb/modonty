"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Check, ChevronDown, Loader2, Save, Wallet } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { createLead, updateLead } from "../actions";
import { PICKABLE_STAGES, STAGE_DOT, STAGE_LABEL, type Stage } from "../helpers/funnel";
import { MOBILE_HINT, type LeadInput } from "../helpers/lead-schema";
import { MARKET_LABEL } from "../helpers/markets";
import { AD_CHANNEL_LABEL } from "@/lib/ad-channel-label";
import type { CampaignOption } from "../helpers/get-campaign-options";
import { formatCount } from "../helpers/format-count";
import { buildTermPricing } from "@modonty/shared/lib/commercial/term-pricing";
import { formatMonths } from "@modonty/shared/lib/commercial/arabic-months";

/* `SOURCE_LABEL` حُذفت: القائمة صارت صفوفاً في القاعدة يحرّرها خالد من «Dropdown Lists»
   (`/settings/reference-data`)، وتصل هنا في `leadSources`. */
const SOCIALS = ["instagram", "facebook", "tiktok", "snapchat", "twitter", "linkedin"] as const;
const SOCIAL_LABEL: Record<string, string> = {
  instagram: "انستقرام", facebook: "فيسبوك", tiktok: "تيك توك",
  snapchat: "سناب شات", twitter: "إكس", linkedin: "لينكدإن",
};

/* `isoDay` و`WHEN_PRESETS` انتقلا إلى `follow-up-log.tsx` مع الموعد نفسه — نسخةٌ واحدة
   حيث يُستعمل، لا اثنتان في شاشتين. */

/**
 * السوقان وما يتبعهما.
 *
 * الدولة أوّل سؤال في النموذج لأنها تحكم ما بعدها: العملة تُشتقّ منها فلا تُسأل مرّتين، وهي
 * التي تُسعَّر بها الباقات من كتالوج سوقها. سؤالها في الآخر — كما كانت — يعني أن تُملأ
 * الحقول ثم يتغيّر معناها.
 *
 * ولا عَلَم هنا: ويندوز لا يرسم رموز الأعلام، فيظهر «🇪🇬» حرفَين لاتينيَّين وسط سطر عربي.
 */
/**
 * خيار «مجال تاني» — قيمةٌ لا تقابل صفّاً في `Industry`.
 *
 * وكتبتُ هنا أوّلاً أنها تمرّ بلا حارس لأن `resolveIndustry` «يردّ `null` لما لا يجده». غلط:
 * مونجو يرفض السلسلة قبل البحث (`Malformed ObjectID … length 9`)، فكان الحفظ يفشل صامتاً.
 * الحارسان الآن في مكانيهما — الشكل في `resolveIndustry`، والمعنى في `leadSchema` التي تُسقط
 * هذه القيمة قبل أن تغادر الحدّ.
 */
const OTHER_INDUSTRY = "__other__";

const MARKETS = [
  { code: "SA", label: "السعودية", currency: "SAR" },
  { code: "EG", label: "مصر", currency: "EGP" },
] as const;

/** اسم العملة بجانب عنوان «الصفقة» — مفتاحه عملة صفّ السعر (`CommercialPlanPrice.currency`). */
const CURRENCY_NAME: Record<string, string> = { SAR: "بالريال السعودي", EGP: "بالجنيه المصري" };

/**
 * النوعُ من منتِجه (`helpers/get-lead-catalog`) لا نسخةً منه.
 *
 * كانت هنا نسخةٌ بنفس الحقول زائداً `tier` — وقد سقط `tier` من الباقات، فصار الشكلان
 * لا يتطابقان: TypeScript يقارن بالبنية لا بالاسم، فرفض تمريرَ `Record<"SA"|"EG", PlanOption[]>`
 * القادمَ من الخادم إلى هذا المكوّن (TS2322 في `new/page.tsx` و`[id]/edit/page.tsx`).
 *
 * و`import type` يُمحى عند البناء، فلا يجرّ `"server-only"` من الملفّ المصدر إلى العميل.
 */
import type { PlanOption, TermOption } from "../helpers/get-lead-catalog";

interface Props {
  leadId?: string;
  industries: { id: string; name: string }[];
  /** باقات كل سوق بأسعارها، من `CommercialPlan` + `CommercialPlanPrice` — لا من قائمة في الكود. */
  plans: Record<"SA" | "EG", PlanOption[]>;
  /**
   * المدد المفعّلة من `CommercialTermPolicy` — الأشهر المدفوعة وهديّتها و«الأنسب».
   * كانت `3 · 6 · 12` وهديّتها مكتوبةً في `pricing-durations.ts` (٢٣ سبتمبر ٢٠٢٦ — خالد: مصدرٌ واحد).
   */
  terms: TermOption[];
  /** «العميل من فين جاي» — المفعَّل منها فقط، من `lead_source_options`. */
  leadSources: { value: string; label: string }[];
  /** الحملات المُطلَقة — تملأ قائمة «الحملة» حين يكون الوصول مدفوعاً. */
  campaigns: CampaignOption[];
  initial?: Partial<LeadInput>;
}

/**
 * نموذج التسجيل — مرتَّبٌ بترتيب المكالمة لا بترتيب الجدول.
 *
 * كان يسأل عن **هوية** العميل ولا يسأل عن **الصفقة**: لا متى نكلّمه، ولا بكم، ولا ماذا قال.
 * وهذه الثلاثة هي عمل المندوبة كلّه؛ الاسم والعنوان مجرّد ما يُكتب في أوّل عشر ثوانٍ.
 *
 * الترتيب هنا هو ترتيب ما يُقال في التليفون: مَن هو ← الصفقة ← متى نرجع له ← ماذا قال.
 * وما لا يُسأل في مكالمة (المدينة، الخرايط، ستّة حسابات) خلف طيّة واحدة — قِيس على الصفوف
 * السبعة عشر القادمة من النظام القديم: صفر من سبعة عشر في كلٍّ منها.
 */
export function LeadForm({ leadId, industries, plans, terms, leadSources, campaigns, initial }: Props) {
  const router = useRouter();
  const { toast } = useToast();
  const isEdit = Boolean(leadId);
  // المدّة الافتراضية هي «الأنسب» في سياسة المدد — لا رقمٌ في الكود.
  const recommendedTerm = terms.find((t) => t.isRecommended) ?? terms[0];

  const blank = (k: string) => (initial?.[k as keyof LeadInput] as string) ?? "";
  const [form, setForm] = useState<Record<string, string>>({
    name: blank("name"), company: blank("company"), phone: blank("phone"), email: blank("email"),
    stage: blank("stage") || "NEW",
    expectedTier: blank("expectedTier"),
    expectedMonths: blank("expectedMonths") || (recommendedTerm ? String(recommendedTerm.paidMonths) : ""),
    currency: blank("currency") || "SAR",
    city: blank("city"), website: blank("website"), googleLocation: blank("googleLocation"),
    // السعودية افتراضاً: هي السوق الأكبر، والافتراض الصامت يوفّر ضغطةً في الحالة الشائعة
    // ويبقى تبديله ضغطةً واحدة.
    // عميلٌ محفوظٌ بمجالٍ مكتوبٍ بيد يعود إلى «مجال تاني» لا إلى «غير محدّد» — وإلّا اختفى ما
    // كتبته المندوبة من الشاشة، وظهر عند الحفظ التالي كأنه لم يُكتب.
    industryId: blank("industryId") || (blank("industryOther") ? OTHER_INDUSTRY : ""),
    industryOther: blank("industryOther"),
    countryCode: blank("countryCode") || "SA", source: blank("source"),
    // الحالة كلّها نصوص، فالمنطقيّ يُخزَّن `"true"` أو فارغاً — لا `boolean` وسط `Record<string,string>`.
    isPaidAd: initial?.isPaidAd ? "true" : "", campaignId: blank("campaignId"), note: "",
    sourceNote: blank("sourceNote"),
    ...Object.fromEntries(SOCIALS.map((s) => [s, blank(s)])),
  });

  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  /**
   * تحذيرٌ قبل مغادرة نموذجٍ لم يُحفظ.
   *
   * المندوبة تملأ هذه الشاشة **أثناء مكالمة**؛ إغلاقُ لسانٍ بالغلط يضيّع الاسم والرقم وما
   * قيل، ولا سبيل لاستعادته. والحارس على `dirty` وحده لا دائماً: نموذجٌ فارغٌ يُغلق بلا
   * اعتراض، وإلّا صار التحذير ضجيجاً يُتجاهَل حين يهمّ.
   *
   * ولا يعترض على الحفظ نفسه: `saving` يرفعه، لأن الانتقال بعد النجاح انتقالٌ مقصود.
   */
  // «لم يُحفظ» = اختلف عمّا فُتح عليه، لا «فيه اسم»: التعديل يُفتح والاسم معبّأ، فكانت كل
  // مغادرةٍ لصفحة التعديل تسأل «متأكّد؟» ولو لم يُلمس حرف (مقيس ٢٨ سبتمبر ٢٠٢٦).
  const pristine = useRef<string | null>(null);
  if (pristine.current === null) pristine.current = JSON.stringify(form);
  const dirty = JSON.stringify(form) !== pristine.current;
  useEffect(() => {
    if (!dirty || saving) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty, saving]);

  const set = (k: string, v: string) => {
    setForm((f) => ({ ...f, [k]: v }));
    if (errors[k]) setErrors((e) => ({ ...e, [k]: [] }));
  };

  /**
   * تبديل السوق يكتب عملته معه.
   *
   * العملة نتيجةٌ للدولة لا سؤالٌ مستقلّ: عميلٌ في مصر بالريال خطأٌ لا معنى له، وخانةٌ تسمح
   * به تنتج صفوفاً مالية غلط بلا أي تحذير. فالحقل بقي في البيانات — القاعدة تحتاجه — وخرج
   * من الشاشة.
   */
  const pickMarket = (code: string) => {
    const m = MARKETS.find((x) => x.code === code);
    // الباقة تُمسح مع تبديل السوق: «الزخم» في السعودية ١١٩٩ ريالاً وفي مصر ٣٩٩٩ جنيهاً،
    // فإبقاء الاختيار يترك مبلغاً من سوقٍ على عميلٍ في سوقٍ آخر — وهو صفٌّ مالي غلط بلا تحذير.
    setForm((f) => ({
      ...f,
      countryCode: code,
      currency: m?.currency ?? f.currency,
      expectedTier: "",
    }));
  };

  const market = MARKETS.find((m) => m.code === form.countryCode) ?? MARKETS[0];
  const marketPlans = plans[market.code] ?? [];

  /**
   * اختيار الباقة يكتب سلَقها وحده.
   *
   * لا خانة مبلغ يدوية بعد اليوم (خالد ٤ سبتمبر): «ما في مبلغ شهري بيتحدد هنا. في packages
   * واضحة وثابتة». والمبلغ لا يمرّ من الشاشة أصلاً (٢٣ سبتمبر ٢٠٢٦ — خالد: مصدرٌ واحد): السيرفر
   * يقرؤه من `CommercialPlanPrice` عند الحفظ (`resolveLeadDeal`).
   */
  const pickPlan = (p: PlanOption) => {
    const same = form.expectedTier === p.slug;
    setForm((f) => ({ ...f, expectedTier: same ? "" : p.slug }));
    if (errors.expectedTier?.length) setErrors((e) => ({ ...e, expectedTier: [] }));
  };

  /**
   * الرقم وحده — بلا «ر.س» على كل بطاقة (خالد ٤ سبتمبر).
   *
   * العملة واحدة للبطاقات الثلاث، فتكرارها ثلاث مرّات يضيف ضجيجاً لا معلومة. مكانها مرّةً
   * واحدة بجانب عنوان «الصفقة»، وهي تحكم كل رقمٍ تحتها.
   */
  const money = (n: number) => new Intl.NumberFormat("ar-EG", { maximumFractionDigits: 0 }).format(n);

  /**
   * الإجمالي مشتقٌّ لا مخزَّن — بـ`buildTermPricing` نفسها التي تحسب بها بطاقة `/pay`.
   *
   * الباقات لا تُباع شهريّاً، فالبطاقة تعرض إجمالي المدّة لا سعر الشهر: الرقم الذي يُقال
   * للعميل في المكالمة هو ما يدفعه مرّةً واحدة = سعر الشهر × الأشهر المدفوعة.
   *
   * `Number(...)` لأن التعديل يمرّر المدّة المخزّنة رقماً لا نصّاً.
   */
  const term = terms.find((t) => t.paidMonths === Number(form.expectedMonths)) ?? null;
  const totalOf = (p: PlanOption) =>
    term
      ? buildTermPricing({
          monthlyBase: p.monthlyBase,
          paidMonths: term.paidMonths,
          bonusServiceMonths: term.bonusServiceMonths,
        }).totalMinor / 100
      : null;

  /** باقةٌ محفوظة لم تعد منشورة في هذا السوق — تُقال بدل أن تختفي من الشاشة وتُرفض عند الحفظ. */
  const stalePlan = Boolean(form.expectedTier) && !marketPlans.some((p) => p.slug === form.expectedTier);
  const dealError = errors.expectedTier?.[0] ?? errors.expectedMonths?.[0];
  const currencyName = CURRENCY_NAME[marketPlans[0]?.currency ?? ""];

  // التصنيف صار في البطاقة الأساسية، فلا يُحسب هنا — الطيّة للمدينة والموقع والحسابات وحدها.
  const [hasExtras] = useState(() =>
    ["city", "website", "googleLocation", ...SOCIALS].some((k) => blank(k).trim() !== ""),
  );

  const submit = async () => {
    setSaving(true);
    setErrors({});
    const result = isEdit ? await updateLead(leadId!, form as LeadInput) : await createLead(form as LeadInput);

    if (!result.success) {
      setSaving(false);
      if (result.fieldErrors) setErrors(result.fieldErrors);
      toast({ title: result.error, variant: "destructive" });

      /**
       * التركيز ينتقل إلى أوّل حقلٍ مرفوض.
       *
       * صار لازماً بعد التقسيم إلى عمودين: الخطأ قد يقع في العمود الآخر خارج مجال النظر،
       * فترى المندوبة تنبيهاً أحمر ولا ترى أين. والتمرير `center` لا `nearest` لأن الحاوية
       * التي تمرّر هي `main` لا الصفحة — والحقل قد يكون فوق الطيّة أو تحتها.
       */
      const firstBad = Object.keys(result.fieldErrors ?? {}).find((k) => result.fieldErrors?.[k]?.length);
      if (firstBad) {
        requestAnimationFrame(() => {
          const el = document.getElementById(firstBad);
          el?.scrollIntoView({ block: "center", behavior: "smooth" });
          el?.focus({ preventScroll: true });
        });
      }
      return;
    }

    toast({ title: isEdit ? "تم الحفظ" : `تمت إضافة ${form.name}`, variant: "success" });
    /**
     * الحفظ يرجع للقائمة (خالد ٤ سبتمبر) — **ومعه معرّف الجديد**.
     *
     * كان يرجع إليها عارياً، فيسقط العميل الذي سُجِّل للتوّ خارج النظر: الترتيب الافتراضي
     * «الأطول صمتاً» يضعه آخر القائمة (صمته صفر) والسقف عشرون. مقيس في اختبار الدورة —
     * سجّلتُ «عيادة الدورة الكاملة» فارتفع العدّاد ٢٠ ← ٢١ ولم تظهر البطاقة في الشاشة.
     *
     * فيمرّ المعرّف في العنوان، وتثبّته اللوحة أوّلاً وتعلّمه. وفي العنوان لا في الحالة كي
     * يبقى بعد التحديث ويُشارَك.
     */
    const created = (result as { id?: string }).id;
    router.push(
      isEdit
        ? `/sales-leads/${leadId}`
        : created
          ? `/sales-leads?new=${created}`
          : "/sales-leads",
    );
    router.refresh();
  };

  /**
   * الكثافة — «minimal» (خالد ٤ سبتمبر: «المسافات الزائدة، Padding الزائد، Margin الزائد
   * اللي تقدر تختصره، اختصره… curve minimal»).
   *
   * ثلاثة مقادير ثابتة تُطبَّق على كل عنصر في الشاشة كي لا تصير كل خانةٍ اجتهاداً:
   * الارتفاع `h-8` (٣٢ بكسل — يبقى فوق حدّ اللمس الآمن للفأرة ولا يقارب الـ٤٠)، والمسافة
   * بين اللافتة وخانتها `mt-0.5`، والانحناء `rounded` (٤ بكسل) بدل `rounded-md`.
   *
   * ولا سطر منها يعدّل مكوّنات `ui/` الأصلية — كلّها `className` فوق الافتراضيّ.
   */
  const FIELD = "mt-0.5 h-8 rounded py-1";

  /**
   * حلقة تركيزٍ ولمسٌ بلا تأخير — على كل زرٍّ مرسومٍ بيدنا.
   *
   * أزرار المفاتيح (`role="radio"`) لم تكن تحمل غير اللون، فمَن يتنقّل بلوحة المفاتيح لا يرى
   * أين هو أصلاً. و`touch-action: manipulation` يُسقط تأخير الـ٣٠٠ مللي الذي يضعه المتصفّح
   * انتظاراً لنقرةٍ ثانية.
   *
   * و`motion-reduce:` تُلغي القفزة والانتقال لمن ضبط جهازه على تقليل الحركة — القاعدة تقول
   * «احترمه»، وكانت الحركة تعمل عند الجميع بلا استثناء.
   */
  const TAP =
    "touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring " +
    "focus-visible:ring-offset-1 focus-visible:ring-offset-background " +
    "motion-reduce:transition-none motion-reduce:active:scale-100";

  /**
   * ما يعرفه المتصفّح عن كل خانة: نوعها، ولوحة مفاتيحها، وهل يملؤها تلقائياً.
   *
   * كانت كلّها `type="text"` بلا `autocomplete`: الجوّال يفتح لوحة حروفٍ على الجوّال بدل
   * لوحة الأرقام، والاسم والشركة لا يُملآن تلقائياً، والإيميل يُصحَّح إملائياً فيظهر تحته خطٌّ
   * أحمر في عنوانٍ صحيح.
   */
  const AUTOFILL: Record<string, { type?: string; mode?: "tel" | "email" | "url"; auto?: string; noSpell?: boolean }> = {
    name: { auto: "name" },
    company: { auto: "organization" },
    phone: { type: "tel", mode: "tel", auto: "tel", noSpell: true },
    email: { type: "email", mode: "email", auto: "email", noSpell: true },
    website: { type: "url", mode: "url", auto: "url", noSpell: true },
    city: { auto: "address-level2" },
  };

  const field = (k: string, label: string, o: { type?: string; ltr?: boolean; placeholder?: string } = {}) => {
    const a = AUTOFILL[k] ?? {};
    return (
      <div key={k}>
        <Label htmlFor={k} className="text-xs tracking-[0.01em]">{label}</Label>
        <Input
          id={k}
          name={k}
          type={a.type ?? o.type ?? "text"}
          inputMode={a.mode}
          // الحقول التي لا يعرفها المتصفّح تُغلق صراحةً، وإلّا اقترح عليها مدير كلمات السرّ.
          autoComplete={a.auto ?? "off"}
          spellCheck={a.noSpell ? false : undefined}
          value={form[k]}
          onChange={(e) => set(k, e.target.value)}
          placeholder={o.placeholder}
          dir={o.ltr ? "ltr" : undefined}
          className={cn(FIELD, "touch-manipulation", errors[k]?.length && "border-destructive")}
          aria-invalid={errors[k]?.length ? true : undefined}
          aria-describedby={errors[k]?.length ? `${k}-error` : undefined}
        />
        {/* `aria-live` كي يسمع قارئ الشاشة الخطأ لحظة ظهوره لا حين يصل إليه بالتنقّل. */}
        {errors[k]?.length ? (
          <p id={`${k}-error`} aria-live="polite" className="mt-0.5 text-[11px] text-destructive">
            {errors[k][0]}
          </p>
        ) : null}
      </div>
    );
  };

  /**
   * القائمة مكوّن `Select` من shadcn لا `<select>` خام.
   *
   * الخام يرسم قائمة نظام التشغيل: لا تتبع سمة الشاشة (تبقى بيضاء في الوضع الداكن على
   * ويندوز)، ولا تُنسّق عناصرها، وارتفاعها ليس ارتفاع بقيّة الحقول. والمكوّن يرسمها من نفس
   * الرموز التي ترسم بها البطاقة والحوار.
   *
   * وقيمة الفراغ `__none__` لا `""`: راديكس يحجز السلسلة الفارغة لمعنى «لا اختيار» ويرفضها
   * قيمةً لعنصر — فتُترجم عند الحدّ، وتبقى القاعدة تستقبل `""` كما كانت.
   */
  const NONE = "__none__";

  const select = (k: string, label: string, opts: { v: string; l: string }[], blankLabel: string) => (
    <div>
      <Label htmlFor={k} className="text-xs tracking-[0.01em]">{label}</Label>
      <Select value={form[k] || NONE} onValueChange={(v) => set(k, v === NONE ? "" : v)}>
        <SelectTrigger
          id={k}
          aria-invalid={errors[k]?.length ? true : undefined}
          className={cn(FIELD, "text-sm", errors[k]?.length && "border-destructive")}
        >
          <SelectValue placeholder={blankLabel} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={NONE}>{blankLabel}</SelectItem>
          {/**
           * خطٌّ فاصل قبل بند الهروب — لا نقله إلى الأعلى.
           *
           * «مجال تاني» آخر القائمة عمداً: بابُ الهروب حين يكون أوّل ما تقع عليه العين يُؤخَذ
           * ويُترك ما بعده، فتنقلب القائمة إلى خانةٍ نصّية وتموت المجالات الثمانية. والفاصل
           * يحلّ المشكلة الحقيقية — أنه كان يُقرأ «الخيار التاسع» فيضيع بينها — دون أن يغري.
           */}
          {opts.map((o) => (
            <Fragment key={o.v}>
              {o.v === OTHER_INDUSTRY ? <SelectSeparator /> : null}
              <SelectItem value={o.v}>{o.l}</SelectItem>
            </Fragment>
          ))}
        </SelectContent>
      </Select>
      {/* القائمة كانت الحقل الوحيد بلا عرضٍ لخطئه، فرفضُها كان صامتاً: الحفظ لا يتمّ ولا
          شيء يحمرّ. حقلٌ يُرفض بلا أن يقول ذلك أسوأ من حقلٍ يرفض. */}
      {errors[k]?.length ? <p className="mt-0.5 text-[11px] text-destructive">{errors[k][0]}</p> : null}
    </div>
  );

  const header = (
    <div className="flex items-center gap-2">
      {/* `asChild` لا `<Link><Button>` — زرٌّ داخل رابطٍ تعشيقٌ ممنوع في المواصفة، وقارئ
          الشاشة يعلن عنصرين حيث يوجد فعلٌ واحد. مقيس: `main a button` كان ٢. */}
      <Button variant="ghost" size="icon" type="button" asChild className="size-8">
        <Link href={isEdit ? `/sales-leads/${leadId}` : "/sales-leads"} aria-label="رجوع">
          <ArrowRight className="size-4 rtl:rotate-180" />
        </Link>
      </Button>
      <h1 className="text-lg font-semibold tracking-[-0.01em] text-pretty">{isEdit ? "تعديل بيانات العميل" : "بيانات العميل"}</h1>
    </div>
  );

  /**
   * ── عمودٌ واحد (خالد ٢٨ سبتمبر ٢٠٢٦: «أحسّها معقّدة، محتاجة ترتيب UI/UX») ──────────────
   *
   * كانت ثلاثة أعمدة — الصفقة وطريقة الوصول يميناً، البيانات وسطاً، الملاحظة يساراً — فتقفز العين
   * بين ثلاث جهاتٍ لإضافة اسمٍ ورقم، ولم يكن في الشاشة زرُّ «حفظ» ظاهر. صارت: كرتٌ واحد بما يُقال
   * في أوّل المكالمة (الدولة · الاسم · الجوّال · المصدر · ملاحظة)، وكلُّ ما عداه مطويٌّ تحت
   * «تفاصيل أكثر»، والحفظ في شريطٍ ثابتٍ أسفل. الفريق لم يبدأ استعمالها بعد، فالبساطة الآن.
   */
  /** ما لا يُسأل في أوّل المكالمة — يُملأ حين يُعرف، ولا يعترض الإضافة السريعة. */
  const moreAbout = (
    <section aria-label="عن العميل" className="space-y-2">
      <h3 className="text-xs font-semibold text-muted-foreground">عن العميل</h3>
      <div className="grid gap-3 sm:grid-cols-2">
        {field("company", "الشركة")}
        {field("email", "الإيميل", { type: "email", ltr: true })}
        {select(
          "industryId",
          "المجال",
          [...industries.map((i) => ({ v: i.id, l: i.name })), { v: OTHER_INDUSTRY, l: "مجال آخر — غير موجود بالقائمة" }],
          "غير محدّد",
        )}
        {form.industryId === OTHER_INDUSTRY ? field("industryOther", "مجاله", { placeholder: "عيادة بيطرية · مركز تدريب…" }) : null}
      </div>
    </section>
  );

  const howTheyCame = (
    /**
     * ② طريقة الوصول — كرتٌ مستقلّ (خالد ٤ سبتمبر: «طريقة الوصول، ومصدر العميل،
     * والملاحظات، هذه تكون كرت لوحدها»).
     *
     * وهي فعلاً موضوعٌ واحد لا ثلاثة حقول متجاورة: المفتاح يقول **كيف** وصل، والقائمة تقول
     * **من أين**، والخانة تحتهما تقول **أيّ حملةٍ بالضبط** أو **ما الذي رآه**. الثلاثة تُقرأ
     * جملةً واحدة — «مدفوع · انستقرام · رمضان-٢٠٢٦» — ووضعها مع الاسم والتليفون كان يخلط
     * هويّة العميل بقناة وصوله، وهما سؤالان لا سؤال.
     */
    // «من أين عرفنا؟» و«طبيعي · مدفوع» وتفصيلهما مجموعةٌ واحدة في الكرت الأساسي (خالد ٢٨ سبتمبر
    // ٢٠٢٦: «الاثنين مرتبطين ببعض») — كانت القائمة فوق والمفتاح مطويّاً تحت «تفاصيل أكثر».
    <section aria-label="المصدر" className="space-y-3">
      <div className="grid items-end gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
          {select("source", "من أين عرفنا؟", leadSources.map((s) => ({ v: s.value, l: s.label })), "غير محدّد")}
          {/**
           * «طبيعي · مدفوع» — `utm_medium`، أوّل سؤالٍ في البطاقة لأنه يحكم خانتها الأخيرة.
           *
           * محورٌ يقطع القنوات كلّها بدل أن يتضاعف داخل كلٍّ منها: «انستقرام» بندٌ واحد،
           * والمفتاح هو ما يفرّق المدفوع عن الطبيعيّ. والقائمة التي تتضاعف هي القائمة التي
           * تُملأ غلطاً.
           *
           * وسُمّي بالحالتين لا بسؤالٍ ونفيِه: «لا» تصف اللاشيء، و«طبيعي» تصف شيئاً — والفرق
           * أن الأولى تقرأها فتعرف ما ليس، والثانية تقرأها فتعرف ما هو.
           */}
          <div>
            <Label className="text-xs tracking-[0.01em]">الوصول</Label>
            <div
              role="radiogroup"
              aria-label="الوصول"
              className="mt-0.5 inline-flex rounded border p-0.5"
            >
              {[
                { v: "", l: "طبيعي" },
                { v: "true", l: "مدفوع" },
              ].map((o) => (
                <button
                  key={o.l}
                  type="button"
                  role="radio"
                  aria-checked={form.isPaidAd === o.v}
                  onClick={() =>
                    // التبديل يمسح خانة الحالة الأخرى من الشاشة كما يمسحها السيرفر، فلا
                    // يبقى نصٌّ مكتوباً وغير ظاهر ثم يُحفظ في الخانة الغلط.
                    setForm((f) => ({
                      ...f,
                      isPaidAd: o.v,
                      campaignId: o.v ? f.campaignId : "",
                      sourceNote: o.v ? "" : f.sourceNote,
                    }))
                  }
                  className={cn(
                    "h-7 rounded-[3px] px-3 text-xs font-medium transition-[color,background-color,transform] duration-150 active:scale-[0.97]",
                      TAP,
                    form.isPaidAd === o.v
                      ? "bg-foreground text-background"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {o.l}
                </button>
              ))}
            </div>
          </div>
      </div>
        {/**
         * المصدر ثم تفصيله — واحدٌ تحت الآخر لا جنباً إلى جنب.
         *
         * البطاقة صارت في رَيلٍ عرضه `260`؛ عمودان فيه يعطيان `~120` للخانة، وهو أضيق من أن
         * يُقرأ فيه اسم حملةٍ أو جملةُ ملاحظة. والترتيب الرأسيّ هو ترتيب السؤال أصلاً: من أين
         * جاء، ثم ما تفصيل ذلك.
         *
         * والخانة تتبدّل مع المفتاح — اسم الحملة للمدفوع، وملاحظة للطبيعيّ. الأولى عمودٌ
         * يُجمَّع عليه («رمضان جابت كام عميل؟»)، والثانية نصٌّ يُقرأ ولا يُعدّ. وخلطهما في
         * عمودٍ واحد يعني تقريراً يحسب جملةً مكتوبةً بيد كأنها اسم حملة.
         */}
        <div className="grid items-start gap-2">
          {/* ما يفصّل المصدر: الحملة للمدفوع، والملاحظة للطبيعي. */}

          {/**
           * الحملة اختيارٌ من صفٍّ قائم لا نصٌّ يُكتب (خالد ٥ سبتمبر).
           *
           * النصّ الحرّ لا يُجمَّع — «رمضان-٢٠٢٦» و«رمضان ٢٠٢٦» صفّان في التقرير — ولا يحمل
           * كلفةً فيُقاس بها عائد. والمعرّف يربط العميل بميزانيةٍ حقيقية.
           *
           * وحين لا توجد حملةٌ مُطلَقة بعد، يُقال ذلك ويُفتح الطريق إليها بدل قائمةٍ فارغة
           * تُقرأ عطلاً.
           */}
          {form.isPaidAd ? (
            campaigns.length > 0 ? (
              select(
                "campaignId",
                "الحملة",
                campaigns.map((c) => ({
                  v: c.id,
                  l: `${c.name} — ${MARKET_LABEL[c.countryCode] ?? c.countryCode} · ${AD_CHANNEL_LABEL[c.channel] ?? c.channel}`,
                })),
                "غير محدّدة",
              )
            ) : (
              <div>
                <Label className="text-xs tracking-[0.01em]">الحملة</Label>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  ما في حملة شغّالة.{" "}
                  <Link href="/campaigns/new" className="underline hover:text-foreground">
                    أسّس واحدة
                  </Link>
                </p>
              </div>
            )
          ) : (
            field("sourceNote", "كيف وصلنا؟", { placeholder: "شاهدنا في ريل عن تقويم الأسنان…" })
          )}
        </div>
    </section>
  );

  /** الدولة — أوّل ما في سطر الصفقة: تحكم العملة وأسعار الباقات بجانبها ومثال الجوّال تحتها. */
  const countryToggle = (
    <div className="flex flex-wrap items-center gap-2">
      <Label className="text-xs tracking-[0.01em]">الدولة</Label>
      <div role="radiogroup" aria-label="الدولة" className="inline-flex rounded border p-0.5">
        {MARKETS.map((m) => (
          <button
            key={m.code}
            type="button"
            role="radio"
            aria-checked={form.countryCode === m.code}
            onClick={() => pickMarket(m.code)}
            className={cn(
              "h-7 rounded-[3px] px-3 text-xs font-medium transition-[color,background-color,transform] duration-150 active:scale-[0.97]",
              TAP,
              form.countryCode === m.code ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {m.label}
          </button>
        ))}
      </div>
    </div>
  );

  /** المرحلة — في التعديل وحده، لتصحيح مرحلةٍ سُجّلت خطأً؛ حركتها الطبيعيّة من المتابعة. */
  const stageSection = isEdit ? (
    <section aria-label="المرحلة" className="space-y-2">
        {/**
         * المرحلة في التعديل وحده (خالد ٤ سبتمبر: «هذا المفروض يكون في متابعة»).
         *
         * العميل الجديد مرحلته «جديد» بالتعريف، فاختيارها عند الإنشاء سؤالٌ جوابه معروف.
         * وهي تتحرّك **نتيجة** تواصل، والتواصل يُسجَّل في المتابعة — فحركتها هناك تحمل معها
         * سببها وتاريخها. ويبقى هذا الصفّ في التعديل لتصحيح مرحلةٍ سُجّلت خطأً، لا لتحريكها.
         */}
          <div>
            <Label className="text-xs">المرحلة</Label>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {PICKABLE_STAGES.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => set("stage", s)}
                  aria-pressed={form.stage === s}
                  className={cn(
                    "inline-flex h-9 items-center gap-2 rounded-full border px-3 text-xs font-medium transition-[color,background-color,border-color,transform] duration-150 active:scale-[0.97]",
                    TAP,
                    form.stage === s
                      ? "border-foreground bg-foreground text-background"
                      : "border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground",
                  )}
                >
                  <span className={cn("size-1.5 rounded-full", STAGE_DOT[s as Stage])} aria-hidden />
                  {STAGE_LABEL[s as Stage]}
                </button>
              ))}
            </div>
          </div>
    </section>
  ) : null;

  /**
   * الصفقة أعلى الكرت الأساسي، في سطر الدولة (خالد ٢٨ سبتمبر ٢٠٢٦: «تكون فوق جنب التوجلز
   * تبعت البلد») — الدولة والمدّة والباقة قرارٌ واحد: الدولة تسعّر الباقات، والمدّة تحرّك أرقامها.
   */
  const deal = (
    <>
      {/**
       * ② الصفقة — عند الإنشاء كما في التعديل (خالد ٤ سبتمبر: «لما نؤسس عميل جديد، نحدد نوع
       * بياناته، والصفقة اللي هو عاوزها»).
       *
       * وكنتُ أخرجتُها من الإنشاء بحجّة أن `expectedTier` معبَّأ في **٠ من ٢٠** صفّاً — وهي
       * حجّةٌ فاسدة: الحقل أُضيف أمس، والصفوف العشرون كلّها أقدم منه. فالصفر نتيجةٌ حتميّة
       * لغياب الخانة، لا قياسٌ لسلوك المندوبة. رقمٌ يستحيل أن يكون غير صفر لا يصلح دليلاً.
       *
       * وهذا هو الفرق بينها وبين المدينة والحسابات (١/٢٠ · ١/١٢٠): تلك حقولٌ **موجودة منذ
       * النظام القديم**، فصفرها قياسٌ حقيقيّ — ولذلك بقيت وحدها في التعديل.
       */}
      <section aria-label="الصفقة" className="space-y-2">
        <div className="space-y-2">
          {/**
           * الباقات بطاقاتٌ لا قائمة منسدلة.
           *
           * القائمة تُخفي الأسعار خلف فتحة، فتُقارَن الباقات بالذاكرة. والبطاقة تعرض السعر
           * وعدد المقالات معاً، فالمقارنة تحصل بالعين في لحظة — وهو القرار الذي تتّخذه
           * المندوبة في المكالمة فعلاً. والأسعار تتبع مفتاح الدولة أعلاه.
           */}
          {/**
           * المدّة والباقات في **صفٍّ واحد** (خالد ٤ سبتمبر: «خليهم كلهم في صف واحد»).
           *
           * وهما فعلاً قرارٌ واحد لا قراران: المدّة تغيّر كل سعرٍ بجانبها لحظةَ الضغط، فوضعهما
           * على سطرٍ واحد يجعل السبب والنتيجة في مجال نظرٍ واحد — تضغطين «١٢» فترين الأرقام
           * الثلاثة تتحرّك أمامك بلا أن تنتقل العين لأعلى وأسفل.
           *
           * المدّة `shrink-0` والباقات `flex-1 min-w-0`: الباقات تأخذ ما بقي وتُقصّ أسماؤها
           * عند الضيق، بينما لا ينكسر مفتاح المدّة أبداً.
           */}
          {/**
           * يلفّ سطراً حين لا يتّسع، ولا ينضغط.
           *
           * كان `sm:flex-nowrap` مع `min-w-0` على الباقات: في عمودٍ عرضه `449` انضغطت البطاقة
           * إلى `59` بكسلاً واختفت أسماء الباقات تماماً — مقيس: `scrollWidth > clientWidth`
           * على الثلاثة، وعرض الاسم `0`. والمقارنة بين ثلاثة أرقامٍ بلا أسماء ليست مقارنة.
           *
           * و`min-w-[380px]` هو الحدّ الذي يجعلها تنزل سطراً بدل أن تضيق: `220` للمدّة و`380`
           * للباقات لا يجتمعان في `449`، فتنزل وتأخذ العرض كلّه — و`~144` لكل بطاقة تكفي
           * لأطولها «الريادة ١٧٬٩٩٤».
           */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          {countryToggle}
          <div className="flex shrink-0 items-center gap-x-3">
            <Label className="text-xs tracking-[0.01em] text-muted-foreground">المدّة</Label>
            {/**
             * المدد من `CommercialTermPolicy` المفعّلة — الرقم وحده (خالد ٤ سبتمبر: «اختصر لي
             * الدنيا»). وهديّة المدّة داخلة في «خدمة …» جواره وفي السعر تحته.
             */}
            {terms.length === 0 ? (
              <span className="text-[11px] text-muted-foreground">لا مدّة مفعّلة — أضفها من «الباقات والأسعار»</span>
            ) : (
              <div
                id="expectedMonths"
                tabIndex={-1}
                role="radiogroup"
                aria-label="مدّة الاشتراك"
                aria-invalid={errors.expectedMonths?.length ? true : undefined}
                className={cn("inline-flex rounded border p-0.5", errors.expectedMonths?.length && "border-destructive")}
              >
                {terms.map((t) => {
                  const on = term?.paidMonths === t.paidMonths;
                  return (
                    <button
                      key={t.paidMonths}
                      type="button"
                      role="radio"
                      aria-checked={on}
                      onClick={() => set("expectedMonths", String(t.paidMonths))}
                      className={cn(
                        "h-6 min-w-[2rem] rounded-[3px] px-1 text-xs font-medium tabular-nums transition-[color,background-color,transform] duration-150 active:scale-[0.97]",
                        TAP,
                        on ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground",
                      )}
                    >
                      {formatCount(t.paidMonths)}
                    </button>
                  );
                })}
              </div>
            )}
            {/* شهور الخدمة الفعلية = المدفوعة + هديّة المدّة من السياسة — يتغيّر أمام العين. */}
            {term ? (
              <span className="text-[11px] text-muted-foreground tabular-nums">
                خدمة {formatMonths(term.paidMonths + term.bonusServiceMonths)}
                {currencyName ? ` · ${currencyName}` : ""}
              </span>
            ) : null}
          </div>

          {marketPlans.length === 0 ? (
            <p className="text-xs text-muted-foreground">لا توجد باقات لهذا السوق.</p>
          ) : (
            <div
              id="expectedTier"
              tabIndex={-1}
              className={cn("grid w-full grid-cols-3 gap-1", errors.expectedTier?.length && "rounded ring-1 ring-destructive")}
            >
              {marketPlans.map((p) => {
                const on = form.expectedTier === p.slug;
                const total = totalOf(p);
                const tag = p.featuredBadge ?? p.badge;
                const featured = Boolean(p.featuredBadge);
                return (
                  <button
                    key={p.slug}
                    type="button"
                    onClick={() => pickPlan(p)}
                    aria-pressed={on}
                    className={cn(
                      "rounded border px-1.5 py-1.5 text-center transition-[border-color,background-color,transform] duration-150 active:scale-[0.98]",
                      TAP,
                      on
                        ? "border-foreground bg-foreground/[0.06]"
                        : featured
                          ? "border-amber-500/40 hover:border-amber-500/70"
                          : "border-border hover:border-foreground/40",
                    )}
                  >
                    <span className="flex flex-col items-center gap-0.5">
                      <span className="flex min-w-0 items-center gap-1">
                        <span className="truncate text-[11px] font-medium">{p.name}</span>
                        {on && <Check className="size-3 shrink-0" aria-hidden />}
                        {!on && featured && (
                          <span className="shrink-0 text-[10px] leading-none text-amber-700 dark:text-amber-400">✦</span>
                        )}
                      </span>
                      <span className="text-xs font-semibold tabular-nums">{total != null ? money(total) : "—"}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {stalePlan ? (
            <p className="w-full text-[11px] text-amber-700 dark:text-amber-400">
              الباقة المحفوظة «{form.expectedTier}» ليست منشورة في هذا السوق — يلزم اختيار باقة أو{" "}
              <button type="button" onClick={() => set("expectedTier", "")} className={cn("underline", TAP)}>
                مسحها
              </button>
            </p>
          ) : null}

          {/* خطأ الصفقة من السيرفر (باقة غير منشورة · مدّة مطفأة) — حقلٌ يُرفض يقول ذلك. */}
          {dealError ? (
            <p aria-live="polite" className="w-full text-[11px] text-destructive">{dealError}</p>
          ) : null}
          </div>
        </div>
      </section>

    </>
  );

  const main = (
    <Card className="rounded-md">
      <CardContent className="space-y-3 p-4">
        {deal}

        {/* الاسم والجوّال وحدهما الإلزاميّان — عميلٌ بلا رقم لا يُعمل عليه. */}
        <div className="grid gap-3 sm:grid-cols-2">
          {field("name", "الاسم *", { placeholder: "د. محمد الشناوي…" })}
          {field("phone", "الجوّال *", { ltr: true, placeholder: `${MOBILE_HINT[market.code]}…` })}
        </div>

        {howTheyCame}

        {/* الملاحظة الأولى في الإضافة وحدها: `createLead` يكتبها أوّل سطرٍ في سجلّه، و`updateLead`
            لا يكتبها عمداً كي لا يصير كل تصحيحِ رقمٍ حدثاً في التاريخ. */}
        {!isEdit && (
          <div>
            <Label htmlFor="note" className="text-xs tracking-[0.01em]">
              ملاحظة <span className="font-normal text-muted-foreground">— اختيارية</span>
            </Label>
            <Textarea
              id="note"
              value={form.note ?? ""}
              onChange={(e) => set("note", e.target.value)}
              rows={3}
              placeholder="يريد يعرف الأسعار أولاً، وقال نتواصل معه بعد رجوعه من السفر…"
              className="mt-0.5 resize-none rounded text-sm"
            />
          </div>
        )}
      </CardContent>
    </Card>
  );


  /**
   * المدينة والموقع والخرائط وحسابات التواصل — في التعديل وحده: إثراءٌ لملفّ عميلٍ صار حقيقيّاً،
   * لا حقولٌ تُملأ في مكالمة (قِيست على النظام القديم: ١/٢٠ · ١/٢٠ · ٠/٢٠ · ١ من ١٢٠ خانة).
   */
  const profile = isEdit ? (
    <section aria-label="الموقع والحسابات" className="space-y-2">
      <h3 className="text-xs font-semibold text-muted-foreground">الموقع والحسابات</h3>
      <div className="grid gap-3 sm:grid-cols-2">
        {field("city", "المدينة")}
        {field("website", "الموقع", { ltr: true, placeholder: "clinic.com…" })}
        <div className="sm:col-span-2">{field("googleLocation", "الموقع على خرائط جوجل", { ltr: true })}</div>
      </div>
      <div className="grid gap-2 sm:grid-cols-3">{SOCIALS.map((s) => field(s, SOCIAL_LABEL[s], { ltr: true }))}</div>
    </section>
  ) : null;

  /**
   * «تفاصيل أكثر» — مطويّةٌ في الإضافة، ومفتوحةٌ في التعديل حين يكون فيها ما يُقرأ: عميلٌ حُفظت
   * شركته أو صفقته يُفتح ملفّه على ما كُتب، لا على طيّةٍ تُخفيه.
   */
  const [moreOpen] = useState(() =>
    isEdit &&
    (hasExtras ||
      ["company", "email", "industryId", "industryOther", "expectedTier", "campaignId", "sourceNote"].some((k) => blank(k).trim() !== "") ||
      Boolean(initial?.isPaidAd)),
  );
  const more = (
    <details className="group rounded-md border bg-card" open={moreOpen}>
      <summary className={cn("flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3", TAP)}>
        <span className="text-sm font-medium">
          تفاصيل أكثر
          <span className="ms-2 text-xs font-normal text-muted-foreground">
            اختيارية — الشركة · الإيميل · المجال{isEdit ? " · المرحلة · الحسابات" : ""}
          </span>
        </span>
        <ChevronDown className="size-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" aria-hidden />
      </summary>
      <div className="space-y-5 border-t px-4 py-4">
        {moreAbout}
        {stageSection}
        {profile}
      </div>
    </details>
  );

  /**
   * زرُّ حفظٍ واحد في آخر النموذج. كان النموذج يُحفظ بـEnter وحده، ثم صار «حفظ» بجانب
   * «حفظ وإضافة آخر» — وخالد (٢٨ سبتمبر ٢٠٢٦): «في عدم منطقية هنا». فبقي واحد يرجع للقائمة
   * والجديد أوّلها.
   */
  const actions = (
    // In the flow, not sticky: pinned to the bottom it sat over «تفاصيل أكثر» once that opened,
    // and its see-through backing let the fields show through it (Khalid, 28 Sep 2026).
    <div className="flex flex-wrap items-center gap-2 pt-1">
      <Button type="submit" disabled={saving} className="h-9 gap-2 rounded px-5">
        {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
        {saving ? "جارٍ الحفظ…" : "حفظ"}
      </Button>
      <Button type="button" variant="ghost" asChild className="ms-auto h-9 rounded">
        <Link href={isEdit ? `/sales-leads/${leadId}` : "/sales-leads"}>إلغاء</Link>
      </Button>
    </div>
  );

  return (
    <form onSubmit={(e) => { e.preventDefault(); submit(); }} className="mx-auto max-w-[720px] space-y-3">
      {header}
      {main}
      {more}
      {actions}
    </form>
  );
}
