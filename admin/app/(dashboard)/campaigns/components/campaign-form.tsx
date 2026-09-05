"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Loader2, Save } from "lucide-react";
import type { AdCampaignStatus, AdChannel, AdObjective, AdSite } from "@prisma/client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { AD_CHANNEL_LABEL } from "@/lib/ad-channel-label";
import { ThreeColumnLayout } from "@modonty/shared/components/column-layout/ThreeColumnLayout";

import { createCampaign, updateCampaign } from "../actions";
import {
  CHANNELS_BY_MARKET, MARKETS, OBJECTIVE_LABEL, SITES, STATUS_DOT, STATUS_LABEL,
  campaignDays, marketOf, suggestUtm, totalBudget, trackedUrl,
} from "../helpers/channels";
import type { CampaignInput } from "../helpers/campaign-schema";

const STATUSES: AdCampaignStatus[] = ["DRAFT", "ACTIVE", "PAUSED", "ENDED"];
const OBJECTIVES: AdObjective[] = ["LEADS", "SALES", "TRAFFIC", "ENGAGEMENT", "AWARENESS"];

/** نفس مقادير نموذج العميل المحتمل: الشاشتان أختان، واختلاف الإيقاع يكلّف إعادة توجيهٍ بصريّ. */
const FIELD = "mt-0.5 h-8 rounded py-1";
const TAP =
  "touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring " +
  "focus-visible:ring-offset-1 focus-visible:ring-offset-background " +
  "motion-reduce:transition-none motion-reduce:active:scale-100";

/**
 * التاريخ بأجزائه المحلّية لا بـ`toISOString`.
 *
 * تلك تحوّل إلى التوقيت العالميّ أوّلاً، فآخر الشهر محلّياً (٣٠ سبتمبر ٠٠:٠٠ بتوقيت +٣) يصير
 * ٢٩ سبتمبر ٢١:٠٠ عالمياً — فتُقصّ الحملة يوماً كاملاً في الافتراضيّ. مقيس حيّاً: الصفّ
 * المحفوظ حمل `endAt: 2026-09-29` بينما الشاشة قصدت ٣٠.
 */
const isoDay = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const ar = new Intl.NumberFormat("ar-EG", { maximumFractionDigits: 0 });

interface Props {
  campaignId?: string;
  initial?: Partial<CampaignInput>;
}

/**
 * تأسيس الحملة — الشاشة التي تُصرف بعدها فلوس.
 *
 * ما ليس فيها مقصودٌ كوجود ما فيها: الجمهور والإبداع وهدف التحسين تعيش على `ad set` و`ad` في
 * المنصّة، وحملةٌ واحدة قد تحوي خمس مجموعاتٍ بخمسة جماهير — فحقلٌ لها هنا لا جواب صحيح له.
 * هذه **وحدةُ إسنادٍ وتكلفة**، لا نسخةٌ أسوأ من مدير إعلانات ميتا.
 */
export function CampaignForm({ campaignId, initial }: Props) {
  const router = useRouter();
  const { toast } = useToast();
  const isEdit = Boolean(campaignId);

  const today = new Date();
  const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);

  const [form, setForm] = useState({
    name: initial?.name ?? "",
    countryCode: initial?.countryCode ?? "SA",
    site: (initial?.site as AdSite) ?? "MODONTY",
    channel: (initial?.channel as AdChannel) ?? "SNAPCHAT",
    objective: (initial?.objective as AdObjective) ?? "LEADS",
    status: (initial?.status as AdCampaignStatus) ?? "DRAFT",
    startAt: initial?.startAt ? isoDay(new Date(initial.startAt as string)) : isoDay(today),
    endAt: initial?.endAt ? isoDay(new Date(initial.endAt as string)) : isoDay(monthEnd),
    dailyBudget: initial?.dailyBudget != null ? String(initial.dailyBudget) : "",
    spendCap: initial?.spendCap != null ? String(initial.spendCap) : "",
    targetRegion: (initial?.targetRegion as string) ?? "",
    targetAge: (initial?.targetAge as string) ?? "",
    targetAudience: (initial?.targetAudience as string) ?? "",
    landingPath: (initial?.landingPath as string) ?? "",
    platformCampaignId: (initial?.platformCampaignId as string) ?? "",
    utmCampaign: initial?.utmCampaign ?? "",
    note: (initial?.note as string) ?? "",
  });

  /** الوسم يُقترح ما لم يُلمس — فمَن كتبه بيده لا يُسحب من تحته عند تغيير الاسم. */
  const [utmTouched, setUtmTouched] = useState(Boolean(initial?.utmCampaign));
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  const set = (k: string, v: string | boolean) => {
    setForm((f) => ({ ...f, [k]: v }));
    if (errors[k]) setErrors((e) => ({ ...e, [k]: [] }));
  };

  const market = marketOf(form.countryCode);
  const channels = CHANNELS_BY_MARKET[form.countryCode] ?? CHANNELS_BY_MARKET.SA;

  const utm = utmTouched
    ? form.utmCampaign
    : suggestUtm(form.countryCode, form.channel, form.name, new Date(form.startAt));

  /**
   * اليوميّ هو المصدر، والإجماليّ مشتقٌّ منه (خالد ٥ سبتمبر) — والمفتاح بينهما أُلغي.
   *
   * لو كان الإجماليّ هو المخزَّن لَما ظهر العطل إلا بعد شهر: مدُّ الحملة أسبوعاً يُبقيه على
   * حاله ويخفض اليوميَّ سرّاً إلى رقمٍ لم يضبطه أحد في أيّ منصّة، ثم يُبنى عليه تقرير.
   */
  const money = useMemo(() => {
    const s = new Date(form.startAt);
    const e = new Date(form.endAt);
    if (Number.isNaN(s.getTime()) || Number.isNaN(e.getTime())) return null;
    const daily = Number(form.dailyBudget) || 0;
    return { days: campaignDays(s, e), total: totalBudget(daily, s, e) };
  }, [form.startAt, form.endAt, form.dailyBudget]);

  /** الإجماليّ يُكتب فيه فيُترجَم فوراً إلى يوميّ — يُحفظ الثاني ويُعرض الأوّل. */
  const setTotal = (v: string) => {
    const days = money?.days ?? 1;
    const per = (Number(v) || 0) / days;
    set("dailyBudget", String(Math.round(per * 100) / 100));
  };

  const submit = async () => {
    setSaving(true);
    setErrors({});
    const payload = { ...form, utmCampaign: utm } as unknown as CampaignInput;
    const r = isEdit ? await updateCampaign(campaignId!, payload) : await createCampaign(payload);
    setSaving(false);

    if (!r.success) {
      if (r.fieldErrors) setErrors(r.fieldErrors);
      toast({ title: r.error, variant: "destructive" });
      const first = Object.keys(r.fieldErrors ?? {}).find((k) => r.fieldErrors?.[k]?.length);
      if (first) {
        requestAnimationFrame(() => {
          const el = document.getElementById(first);
          el?.scrollIntoView({ block: "center", behavior: "smooth" });
          el?.focus({ preventScroll: true });
        });
      }
      return;
    }

    toast({ title: isEdit ? "تم الحفظ" : `تأسّست حملة ${form.name}`, variant: "success" });
    router.push("/campaigns");
    router.refresh();
  };

  const err = (k: string) =>
    errors[k]?.length ? (
      <p id={`${k}-error`} aria-live="polite" className="mt-0.5 text-[11px] text-destructive">
        {errors[k][0]}
      </p>
    ) : null;

  const seg = (
    name: string,
    value: string,
    options: { v: string; l: string; dot?: string }[],
    onPick: (v: string) => void,
    wide = false,
  ) => (
    <div role="radiogroup" aria-label={name} className={cn("mt-0.5 rounded border p-0.5", wide ? "flex" : "inline-flex")}>
      {options.map((o) => (
        <button
          key={o.v}
          type="button"
          role="radio"
          aria-checked={value === o.v}
          onClick={() => onPick(o.v)}
          className={cn(
            "h-7 rounded-[3px] px-3 text-xs font-medium transition-[color,background-color,transform] duration-150 active:scale-[0.97]",
            wide && "flex-1 px-2",
            TAP,
            value === o.v ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground",
          )}
        >
          {o.dot && <span className={cn("me-1.5 inline-block size-1.5 rounded-full align-middle", o.dot)} aria-hidden />}
          {o.l}
        </button>
      ))}
    </div>
  );

  const header = (
    <div className="flex items-center gap-2">
      <Button variant="ghost" size="icon" type="button" asChild className="size-8">
        <Link href="/campaigns" aria-label="رجوع">
          <ArrowRight className="size-4 rtl:rotate-180" />
        </Link>
      </Button>
      <h1 className="text-lg font-semibold tracking-[-0.01em]">{isEdit ? "تعديل الحملة" : "حملة جديدة"}</h1>
    </div>
  );

  /**
   * قائمةٌ لافتتُها **داخلها** لا فوقها (خالد ٥ سبتمبر: «عشان نستفيد من المساحات»).
   *
   * ثلاث لافتاتٍ فوق ثلاث قوائم تكلّف ثلاثة أسطر في رَيلٍ عرضه ٢٦٠ — والاسم والقيمة يسعان
   * سطراً واحداً.
   *
   * ── ولماذا ليس «خيارًا أوّل معطَّلاً» كما اقترحتَ ────────────────────────────────────────
   * لأنه يختفي لحظة الاختيار: تضغط «سناب شات» فيغيب اسم الحقل، فمَن يعود للشاشة بعد دقيقة
   * يرى ثلاث قوائم بثلاث قيمٍ بلا ما يقول أيُّها القناة وأيُّها الهدف. وقارئ الشاشة يفقد
   * اسم الحقل معه (WCAG 4.1.2 — لكل عنصرٍ اسمٌ برمجيّ). والاسم هنا **يبقى ظاهراً دائماً**
   * بجانب القيمة، ويُعلَن لقارئ الشاشة بـ`aria-label` — نفس المساحة المكسوبة بلا الثمن.
   */
  const pick = (
    id: string,
    label: string,
    value: string,
    onPick: (v: string) => void,
    options: { v: string; l: string }[],
  ) => (
    <div className="flex items-center gap-2">
      {/* اللافتة خارج الزنّاد لا داخله: `SelectTrigger` يفرض على أبنائه المباشرين تنسيقه
          (`display: flow-root` مقيس)، فيسقط أيّ `flex` نضعه بالداخل ويلتصق الاسم بالقيمة.
          وبعرضٍ ثابت `w-12` تصطفّ القوائم الثلاث على خطٍّ واحد. */}
      <label htmlFor={id} className="w-12 shrink-0 text-xs text-muted-foreground">{label}</label>
      <Select value={value} onValueChange={onPick}>
        <SelectTrigger id={id} aria-label={label} className={cn(FIELD, "mt-0 flex-1 text-sm")}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((o) => (
            <SelectItem key={o.v} value={o.v}>{o.l}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );

  /**
   * الحالة فوق «مكان النشر» في الرَيل (خالد ٥ سبتمبر) — لا داخل بطاقة الحملة.
   *
   * وهي أوّل ما يُقرأ عند فتح الشاشة: «هذي شغّالة ولّا موقوفة؟» سؤالٌ يسبق كلَّ تفصيل، ووضعها
   * وسط الحقول كان يدفنها بين التواريخ والميزانية.
   *
   * وشبكةٌ من عمودين لا صفٌّ واحد: أربعة مفاتيح بنقاطها لا تسع ٢٦٠ بكسلاً في سطر.
   */
  const statusCard = (
    <Card className="rounded-md">
      <CardContent className="space-y-1.5 p-3">
        <span className="text-xs text-muted-foreground">الحالة</span>
        <div role="radiogroup" aria-label="الحالة" className="grid grid-cols-2 gap-1">
          {STATUSES.map((v) => (
            <button
              key={v}
              type="button"
              role="radio"
              aria-checked={form.status === v}
              onClick={() => set("status", v)}
              className={cn(
                "flex h-7 items-center gap-1.5 rounded border px-2 text-xs font-medium transition-[color,background-color,border-color,transform] duration-150 active:scale-[0.97]",
                TAP,
                form.status === v
                  ? "border-foreground bg-foreground text-background"
                  : "border-border text-muted-foreground hover:text-foreground",
              )}
            >
              <span className={cn("size-1.5 shrink-0 rounded-full", STATUS_DOT[v])} aria-hidden />
              {STATUS_LABEL[v]}
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  // ── يمين: أين تُنشر — ظرف الحملة، يُختار بالضغط لا بالحروف ─────────────────────────────
  const placement = (
    <Card className="rounded-md">
      <CardHeader className="px-4 pb-2 pt-3">
        <CardTitle className="text-sm">مكان النشر</CardTitle>
      </CardHeader>
      <CardContent className="space-y-1.5 px-4 pb-3">
        {/**
         * السوق صفٌّ واحد: الاسم ثم المفتاحان — لا لافتةً فوق ومفتاحين تحت.
         *
         * وكان في صفّ العنوان فتجاوز حدّ البطاقة: «مكان النشر» ومفتاحان بعرض ١٢٠ لا يجتمعان
         * في ٢٦٠ ناقص الحشوة، فانكسر العنوان سطرين وقُصّ المفتاح. مقيس على الشاشة.
         */}
        <div className="flex items-center gap-2">
          <span className="w-12 shrink-0 text-xs text-muted-foreground">السوق</span>
          <span className="ms-auto">
            {seg(
              "السوق",
              form.countryCode,
              MARKETS.map((m) => ({
                v: m.code,
                l: m.label,
                dot: m.code === "SA" ? "bg-emerald-500" : "bg-red-500",
              })),
              (v) => {
                const next = CHANNELS_BY_MARKET[v] ?? CHANNELS_BY_MARKET.SA;
                setForm((f) => ({
                  ...f,
                  countryCode: v,
                  channel: next.includes(f.channel) ? f.channel : next[0],
                }));
              },
            )}
          </span>
        </div>

        {pick("site", "الموقع", form.site, (v) => set("site", v),
          SITES.map((x) => ({ v: x.code, l: x.label })))}
        {pick("channel", "القناة", form.channel, (v) => set("channel", v),
          channels.map((c) => ({ v: c, l: AD_CHANNEL_LABEL[c] })))}
        {pick("objective", "الهدف", form.objective, (v) => set("objective", v),
          OBJECTIVES.map((x) => ({ v: x, l: OBJECTIVE_LABEL[x] })))}
      </CardContent>
    </Card>
  );

  /**
   * الميزانية **داخل بطاقة الحملة** لا في رَيلٍ جانبيّ (خالد ٥ سبتمبر: «من الحاجات المهمة
   * جدًا»).
   *
   * والموضع يتبع الحساب: الإجماليّ مشتقٌّ من المدّة التي فوقه مباشرةً، فوضعُهما في عمودين
   * متقابلين كان يفرّق السبب عن النتيجة — تُعدّل تاريخاً في الوسط وينفعل رقمٌ في الطرف خارج
   * مجال نظرك.
   *
   * ثلاث خاناتٍ في صفٍّ واحد: الوسط ٦٠٠ بكسل يعطي كلَّ واحدةٍ ~١٩٠ — بينما الرَيل ٢٦٠ كان
   * يجبرها على صفّين ونصف.
   */
  const budget = (
    <div className="space-y-1.5 border-t pt-2">
      <div className="flex items-baseline gap-2">
        <span className="text-xs font-medium">الميزانية</span>
        <span className="text-[11px] text-muted-foreground">{market.currencyName}</span>
      </div>

      {/**
       * الرقمان مفرودان معاً (خالد ٥ سبتمبر: «الـtotals هذي حتلخبطني، افرد لي هم قدام
       * عيني»). المنصّة تقبل واحداً، وهذا لا يمنع الشاشة من عرض الاثنين.
       *
       * و`placeholder` صفرٌ لا مبلغ (خالد ٥ سبتمبر: «الـmedia buyer حيخرب بيتي، ما تدّي
       * فكرة إنه يحطّ أرقام… حطّ صفر»). المبلغ الباهت في خانة فلوس يُقرأ توصيةً لا مثالاً.
       */}
      <div className="grid gap-2 sm:grid-cols-3">
        <div>
          <Label htmlFor="dailyBudget" className="text-xs">في اليوم *</Label>
          <Input
            id="dailyBudget"
            inputMode="decimal"
            dir="ltr"
            value={form.dailyBudget}
            onChange={(e) => set("dailyBudget", e.target.value)}
            placeholder="0"
            className={cn(FIELD, errors.dailyBudget?.length && "border-destructive")}
          />
        </div>
        <div>
          <Label htmlFor="totalBudget" className="text-xs">إجمالي المدّة</Label>
          <Input
            id="totalBudget"
            inputMode="numeric"
            dir="ltr"
            value={money && form.dailyBudget ? String(Math.round(money.total)) : ""}
            onChange={(e) => setTotal(e.target.value)}
            placeholder="0"
            className={cn(FIELD)}
          />
        </div>
        <div>
          <Label htmlFor="spendCap" className="text-xs">
            سقف الصرف <span className="text-muted-foreground">اختياري</span>
          </Label>
          <Input
            id="spendCap"
            inputMode="numeric"
            dir="ltr"
            value={form.spendCap}
            onChange={(e) => set("spendCap", e.target.value)}
            placeholder="0"
            className={cn(FIELD, errors.spendCap?.length && "border-destructive")}
          />
        </div>
      </div>
      {err("dailyBudget")}
      {err("spendCap")}
    </div>
  );

  /**
   * الاستهداف في الرَيل مع الميزانية (خالد ٥ سبتمبر) — والقرابة صحيحة.
   *
   * «كم صرفنا» و«على مَن صرفنا» سؤالٌ واحدٌ في المراجعة، والفصل بينهما كان يضع نصفَه في
   * الوسط ونصفَه في الطرف. والوسط بقي لما يخصّ الحملة نفسها: اسمها ومدّتها وحالتها ووصلها.
   *
   * وعمودٌ واحد لا عمودان: الرَيل ٢٦٠ بكسلاً، فصفٌّ من خانتين يعطي ١١٥ لكلٍّ — أضيق من أن
   * يُقرأ فيه «الرياض · جدة».
   *
   * والمنطقة والجمهور خانتان ممتدّتان (خالد ٥ سبتمبر: «يقدر يكتب فيها براحته») — الجمهور
   * الحقيقيّ جملةٌ لا كلمة: «أصحاب عيادات أسنان · مشابه ٢٪ من قائمة عملائنا». وسطرٌ واحد
   * يقصّ ما بعد الكلمة الثالثة فلا يُقرأ عند المراجعة، وهي كلّ الغرض منه.
   *
   * والعمر بقي سطراً: «٢٥ – ٤٥» لا يطول أبداً، وخانةٌ ممتدّة له فراغٌ يُحجز ولا يُملأ.
   */
  const targeting = (
    <Card className="rounded-md">
      <CardHeader className="px-4 pb-1.5 pt-3">
        <CardTitle className="text-sm">
          الاستهداف
          <span className="ms-2 text-xs font-normal text-muted-foreground">على مَن كانت</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 px-4 pb-3">
        <div>
          <Label htmlFor="targetRegion" className="text-xs">المنطقة</Label>
          <Textarea
            id="targetRegion"
            rows={2}
            value={form.targetRegion}
            onChange={(e) => set("targetRegion", e.target.value)}
            placeholder="الرياض · جدة · الدمام"
            className="mt-0.5 rounded text-sm"
          />
        </div>
        <div>
          <Label htmlFor="targetAge" className="text-xs">العمر</Label>
          <Input
            id="targetAge"
            value={form.targetAge}
            onChange={(e) => set("targetAge", e.target.value)}
            placeholder="٢٥ – ٤٥"
            className={cn(FIELD)}
          />
        </div>
        <div>
          <Label htmlFor="targetAudience" className="text-xs">الجمهور</Label>
          <Textarea
            id="targetAudience"
            rows={4}
            value={form.targetAudience}
            onChange={(e) => set("targetAudience", e.target.value)}
            placeholder="أصحاب عيادات أسنان · مهتمّون بالتسويق الرقمي · مشابه ٢٪ من قائمة عملائنا"
            className="mt-0.5 rounded text-sm"
          />
        </div>
      </CardContent>
    </Card>
  );

  return (
    /**
     * `dir="rtl"` على النموذج نفسه — الأدمن إنجليزيّ الاتجاه، وهذه شاشةٌ عربية.
     *
     * بدونه كان الاتجاه `ltr` فينقلب كلّ ما يعتمد المنطقيّ: العمودان يتبادلان مكانيهما (مكان
     * النشر يسار والميزانية يمين — مقيس `x: 113` و`x: 965`)، و`ms-auto` تدفع الزرّ إلى الجهة
     * الخطأ، و`text-start` تصير يساراً. نفس ما تفعله شاشات العملاء المحتملين في صفحاتها.
     */
    <form dir="rtl" onSubmit={(e) => { e.preventDefault(); submit(); }}>
      <ThreeColumnLayout
        className="!px-0 !py-0"
        header={<div className="-mb-4">{header}</div>}
        right={
          <aside
            aria-label="الحالة ومكان النشر"
            className="w-full shrink-0 space-y-2 lg:sticky lg:top-0 lg:w-[260px]"
          >
            {statusCard}
            {placement}
          </aside>
        }
        center={
          <div className="space-y-2">
            <Card className="rounded-md">
              <CardContent className="space-y-2 p-4">
                <div>
                  <Label htmlFor="name" className="text-xs">اسم الحملة *</Label>
                  <Input
                    id="name"
                    value={form.name}
                    onChange={(e) => set("name", e.target.value)}
                    placeholder="تقويم الأسنان — سبتمبر"
                    className={cn(FIELD, errors.name?.length && "border-destructive")}
                  />
                  {err("name")}
                </div>

                <div className="grid gap-2 border-t pt-2 sm:grid-cols-3">
                  <div>
                    <Label htmlFor="startAt" className="text-xs">تبدأ *</Label>
                    <Input
                      id="startAt"
                      type="date"
                      dir="ltr"
                      value={form.startAt}
                      onChange={(e) => set("startAt", e.target.value)}
                      className={cn(FIELD, errors.startAt?.length && "border-destructive")}
                    />
                    {err("startAt")}
                  </div>
                  <div>
                    <Label htmlFor="endAt" className="text-xs">تنتهي *</Label>
                    <Input
                      id="endAt"
                      type="date"
                      dir="ltr"
                      value={form.endAt}
                      onChange={(e) => set("endAt", e.target.value)}
                      className={cn(FIELD, errors.endAt?.length && "border-destructive")}
                    />
                    {err("endAt")}
                  </div>

                  {/**
                   * المدّة خانةً ثالثة في صفّ التاريخين (خالد ٥ سبتمبر: «ليش تهدر المسافات؟»).
                   *
                   * كانت شريطاً بعرض البطاقة كاملاً تحتهما — ٣٣ بكسلاً لرقمٍ من ثلاثة محارف،
                   * بينما صفُّ التاريخين يترك ثلثه فارغاً. وهي نتيجتهما فمكانها بينهما، لا
                   * سطراً مستقلّاً يعلن نفسه موضوعاً ثالثاً.
                   *
                   * وقراءةٌ لا خانة: `div` بارتفاع `h-8` نفسه كي يستوي الصفّ، بلا حدٍّ يوحي
                   * بالكتابة فيه.
                   */}
                  <div>
                    <Label className="text-xs text-muted-foreground">المدّة</Label>
                    <div className="mt-0.5 flex h-8 items-center rounded bg-muted/50 px-2.5">
                      <b className="text-[13px] tabular-nums">{ar.format(money?.days ?? 0)} يوماً</b>
                    </div>
                  </div>
                </div>

                {budget}

              </CardContent>
            </Card>

            <Card className="rounded-md">
              <CardHeader className="px-4 pb-1.5 pt-3">
                <CardTitle className="text-sm">
                  الوصل بالمبيعات
                  <span className="ms-2 text-xs font-normal text-muted-foreground">
                    مفتاحان — بهما يُعرف مَن جاء منها
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 px-4 pb-3">
                {/* صفحة الوصول هنا لا في «الاستهداف»: هي جزءٌ من الرابط تحتها، وتغييرها
                    يغيّره أمام العين. */}
                <div>
                  <Label htmlFor="landingPath" className="text-xs">صفحة الوصول</Label>
                  <Input
                    id="landingPath"
                    dir="ltr"
                    value={form.landingPath}
                    onChange={(e) => set("landingPath", e.target.value)}
                    placeholder="/pricing"
                    className={cn(FIELD, "font-mono text-xs")}
                  />
                </div>

                <div>
                  <Label htmlFor="platformCampaignId" className="text-xs">معرّف الحملة في المنصّة</Label>
                  <Input
                    id="platformCampaignId"
                    dir="ltr"
                    value={form.platformCampaignId}
                    onChange={(e) => set("platformCampaignId", e.target.value)}
                    placeholder="120210000000123456"
                    className={cn(FIELD, "font-mono text-xs")}
                  />
                </div>

                <div>
                  <Label htmlFor="utmCampaign" className="text-xs">وسم الرابط</Label>
                  <Input
                    id="utmCampaign"
                    dir="ltr"
                    value={utm}
                    onChange={(e) => { setUtmTouched(true); set("utmCampaign", e.target.value); }}
                    className={cn(FIELD, "font-mono text-xs", errors.utmCampaign?.length && "border-destructive")}
                  />
                  {err("utmCampaign")}
                </div>

                <TrackedLink
                  site={form.site as AdSite}
                  landingPath={form.landingPath}
                  channel={form.channel}
                  utmCampaign={utm}
                  platformCampaignId={form.platformCampaignId}
                />
              </CardContent>
            </Card>

            <Card className="rounded-md">
              <CardHeader className="px-4 pb-1.5 pt-3">
                <CardTitle className="text-sm">
                  ملاحظة <span className="ms-2 text-xs font-normal text-muted-foreground">اختيارية</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-3">
                <Textarea
                  id="note"
                  rows={2}
                  value={form.note}
                  onChange={(e) => set("note", e.target.value)}
                  placeholder="جرّبنا نفس الإعلان في أغسطس وجاب ٧ عملاء…"
                  className="rounded text-sm"
                />
              </CardContent>
            </Card>

            <div className="flex flex-wrap items-center gap-2 border-t pt-3">
              <Button type="submit" disabled={saving} className="h-8 gap-2 rounded">
                {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                {saving ? "جارٍ الحفظ…" : isEdit ? "حفظ التعديلات" : "حفظ"}
              </Button>
              <Button type="button" variant="ghost" asChild className="ms-auto h-8 rounded">
                <Link href="/campaigns">إلغاء</Link>
              </Button>
            </div>
          </div>
        }
        left={
          <aside aria-label="الاستهداف" className="w-full shrink-0 lg:sticky lg:top-0 lg:w-[260px]">
            {targeting}
          </aside>
        }
      />
    </form>
  );
}

/**
 * الرابط الجاهز — يُقرأ ويُنسخ، فليس خانة إدخال.
 *
 * وبلا معرّف المنصّة يخرج ناقصاً مفتاحه الثاني، ويُقال ذلك في سطرٍ عربيٍّ تحته — لا بدسّ كلمة
 * عربية داخل نصٍّ لاتينيّ حيث تُقرأ معكوسة.
 */
function TrackedLink({
  site, landingPath, channel, utmCampaign, platformCampaignId,
}: {
  site: AdSite; landingPath: string; channel: AdChannel;
  utmCampaign: string; platformCampaignId: string;
}) {
  const { toast } = useToast();
  const url = useMemo(
    () => trackedUrl({ site, landingPath, channel, utmCampaign: utmCampaign || "…", platformCampaignId }),
    [site, landingPath, channel, utmCampaign, platformCampaignId],
  );


  return (
    <div className="border-t pt-2">
      <Label className="text-xs">الرابط الجاهز</Label>
      <p dir="ltr" className="mt-0.5 break-all rounded border bg-background px-2 py-1.5 font-mono text-[11px] leading-relaxed">
        {url}
      </p>
      {!platformCampaignId.trim() && (
        <p className="mt-0.5 text-[11px] text-muted-foreground">
          ناقصه معرّف المنصّة — أضفه فوق ليكتمل المفتاح الثاني.
        </p>
      )}
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="mt-1.5 h-7 rounded px-2 text-[11px]"
        onClick={() => {
          navigator.clipboard.writeText(url);
          toast({ title: "اتنسخ", variant: "success" });
        }}
      >
        نسخ الرابط
      </Button>
    </div>
  );
}
