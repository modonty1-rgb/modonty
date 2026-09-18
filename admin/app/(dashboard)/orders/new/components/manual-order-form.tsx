"use client";

import { useMemo, useState, useTransition } from "react";
import { vatRateBpForMarket } from "@modonty/shared/lib/payments/vat-rate";
import { useRouter } from "next/navigation";
import { Check, Loader2, Receipt } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

import { createManualOrder } from "../actions/create-manual-order";
import type { OrderFormData } from "../helpers/load-order-form-data";

const MARKETS = [
  { key: "SA", label: "السعودية", currencyWord: "ريال" },
  { key: "EG", label: "مصر", currencyWord: "جنيه" },
] as const;

type MarketKey = (typeof MARKETS)[number]["key"];

/**
 * **نسبةُ الضريبة تُقرأ من مصدرها الواحد** — لا نسخةَ ثانيةً للعرض.
 *
 * كانت `VAT_LABEL = { SA: "١٥٪", EG: "١٤٪" }` مكتوبةً بيد، و`EG_VAT_RATE_BP = 0` في
 * `shared/lib/payments/vat-rate.ts` منذ ١٥ سبتمبر ٢٠٢٦ بقرارٍ صريح: المؤسّسةُ سعوديّة
 * وليست مسجَّلةً ضريبيّاً في مصر، فلا ضريبةَ مصريّة تُحصَّل.
 *
 * فكانت الشاشةُ تَعِد المشتريَ المصريَّ بـ«شامل ضريبة ١٤٪» والطلبُ يُكتب بصفر — مقيسٌ
 * حيّاً ١٩ سبتمبر ٢٠٢٦ على صفحة الإنشاء. وهذا أسوأ من رقمٍ غلط: إعلانُ ضريبةٍ لا تُورَّد.
 */
function vatLabel(market: MarketKey): string {
  const bp = vatRateBpForMarket(market);
  return bp === 0 ? "بلا ضريبة" : `شامل ضريبة ${(bp / 100).toLocaleString("ar-EG")}٪`;
}

/** معرّفٌ لا يساوي أي `planId` حقيقيّ — اختيارُه يعني «خارج الكتالوج». */
const CUSTOM = "__custom__";

/**
 * حقلٌ يحمل خطأه تحته (خالد ١٥ سبتمبر ٢٠٢٦: «البليديشن طريقته غلط… المفروض إن‑لاين»).
 *
 * والتوست كان يقول «الإيميل غير صالح» ثم يختفي بعد ثوانٍ، فيبقى الموظّف يبحث عن
 * الحقل بعينه. والخطأ تحت حقله يبقى حتى يُصلَح، ويقوله لمن يقرأ بلوحة المفاتيح
 * أيضاً (`aria-invalid` + `role="alert"`).
 */
function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string | null;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[11px] font-semibold text-muted-foreground">{label}</span>
      {/**
        * الحدّ الأحمر بمحدّد ثابت لا شرطيّ — تيلويند يمسح الملفّات نصّاً، فصنفٌ
        * يُركّب في تعبير شرطيّ قد لا يُولّد. والحالة تُنقل بـ`data-error` ويلتقطها المحدّد.
        */}
      <div
        data-error={error ? "true" : undefined}
        className="[&[data-error]_button]:border-destructive [&[data-error]_input]:border-destructive"
      >
        {children}
      </div>
      {error ? (
        <span role="alert" className="text-[10px] font-medium text-destructive">
          {error}
        </span>
      ) : null}
    </label>
  );
}

/**
 * بطاقة بإطار وعنوان صغير — ثلاثٌ منها تفصل مراحل الإدخال بصرياً.
 *
 * خالد (١٥ سبتمبر ٢٠٢٦): «حسّن الـUI، خليه كل في بوردر في كرت — حاسس بتشويش بصري».
 * والسبب أن الحقول كانت جداراً واحداً بلا فواصل، فلا تعرف العين أين تبدأ.
 */
function Section({
  title,
  aside,
  children,
}: {
  title: string;
  /** عنصرٌ في الطرف المقابل للعنوان — للاختيار القصير الذي يحكم بقيّة البطاقة. */
  aside?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-lg border bg-card">
      <div className="flex items-center justify-between gap-3 border-b px-3.5 py-2">
        <h2 className="text-[12px] font-bold">{title}</h2>
        {aside}
      </div>
      <div className="flex flex-col gap-3 p-3.5">{children}</div>
    </section>
  );
}

/** زرّ اختيارٍ واحد — نفس الشكل في السوق والمدّة والباقة والحالة، فلا تتعدّد اللغات. */
function Choice({
  selected,
  disabled,
  onClick,
  children,
}: {
  selected: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        "rounded-md border px-3 py-1.5 text-xs font-bold transition-colors",
        selected
          ? "border-primary bg-primary/[0.07] text-primary"
          : "border-input text-foreground hover:border-primary/40",
        disabled && "cursor-not-allowed opacity-40",
      )}
    >
      {children}
    </button>
  );
}

/**
 * تسجيل طلب اشتراك من الأدمن — نفس ما تكتبه صفحة الدفع، بيد الموظّف.
 *
 * الشاشة **لا تعرف سعراً**: تختار سوقاً وباقةً ومدّة، وتعرض الإجمالي المحسوب من
 * الكتالوج للتأكيد البصريّ فقط. والأكشن يعيد القراءة والحساب من القاعدة — فلا
 * يمرّ مبلغٌ من المتصفّح إلى الصفّ.
 */
/** تعبئةُ الهويّة من عميلٍ محتمَل — ولا مبلغَ فيها: المال يكتبه الموظّف بما اتُّفق عليه. */
export type OrderPrefill = {
  buyerName: string;
  businessName: string;
  buyerEmail: string;
  buyerPhone: string;
  market: "SA" | "EG";
  salesRepId: string;
  /** الباقةُ المختارة سلفاً — يملؤها التجديد من الطلب السابق؛ والمبلغُ لا يُنسخ. */
  planId?: string;
};

export function ManualOrderForm({
  data,
  leadId,
  prefill,
}: {
  data: OrderFormData;
  leadId?: string;
  prefill?: OrderPrefill;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [pending, startTransition] = useTransition();

  const [market, setMarket] = useState<MarketKey>(prefill?.market ?? "SA");
  // باقةُ التجديد إن كانت ما تزال في الكتالوج — وإلّا فأوّل باقةٍ منشورة.
  const [planId, setPlanId] = useState(
    (prefill?.planId && data.plans.some((p) => p.id === prefill.planId) ? prefill.planId : data.plans[0]?.id) ?? "",
  );
  const [paidMonths, setPaidMonths] = useState(
    data.terms.find((t) => t.isRecommended)?.paidMonths ?? data.terms[0]?.paidMonths ?? 1,
  );
  const [buyerName, setBuyerName] = useState(prefill?.buyerName ?? "");
  const [buyerEmail, setBuyerEmail] = useState(prefill?.buyerEmail ?? "");
  const [buyerPhone, setBuyerPhone] = useState(prefill?.buyerPhone ?? "");
  const [businessName, setBusinessName] = useState(prefill?.businessName ?? "");
  const [salesRepId, setSalesRepId] = useState(prefill?.salesRepId ?? "");
  const [paidAt, setPaidAt] = useState("");
  const [notes, setNotes] = useState("");
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [submitTried, setSubmitTried] = useState(false);
  const touch = (k: string) => setTouched((prev) => ({ ...prev, [k]: true }));
  /**
   * باقة «أخرى» (خالد ١٥ سبتمبر ٢٠٢٦): «ندخل من خلالها العملاء القدام، ولو في أي
   * خصومات، أو عميل نازل مجاني». `planId === CUSTOM` يبدّل الأرقام الجاهزة بثلاثة
   * حقول: الإجمالي وعدد المقالات والأشهر.
   */
  const [customName, setCustomName] = useState("");
  const [customTotal, setCustomTotal] = useState("");
  const [customArticles, setCustomArticles] = useState("");
  const [customMonths, setCustomMonths] = useState("");

  const marketMeta = MARKETS.find((m) => m.key === market)!;
  const isCustom = planId === CUSTOM;
  const plan = data.plans.find((p) => p.id === planId);
  const price = plan?.priceByMarket[market];
  const term = data.terms.find((t) => t.paidMonths === paidMonths);

  const customMonthsNum = Number(customMonths) || 0;
  const customTotalNum = customTotal === "" ? null : Number(customTotal);
  const customArticlesTotal =
    customArticles !== "" && customMonthsNum >= 1 ? Number(customArticles) * customMonthsNum : null;

  const total = useMemo(() => {
    if (isCustom) return customTotalNum;
    if (!price || !term) return null;
    return price.monthlyBase * term.paidMonths;
  }, [isCustom, customTotalNum, price, term]);

  const serviceMonths = isCustom ? (customMonthsNum || null) : term ? term.paidMonths + term.bonusServiceMonths : null;

  /**
   * الزرّ لا يُفعَّل قبل اكتمال الإلزاميّ (قيس ١٥ سبتمبر ٢٠٢٦): كان مفعّلاً والفورم
   * فارغ، فيضغط الموظّف ليكتشف النقص من رسالة خطأ — والصحيح أن يراه قبل الضغط.
   *
   * والتحقّق هنا **لا يغني عن تحقّق الأكشن**: هذا يمنع ضغطةً ضائعة، وذاك يحرس الصفّ
   * من نداءٍ لا يمرّ بالشاشة أصلاً.
   */
  /**
   * الأخطاء تُحسب دائماً وتُعرض عند اللمس — لا عند الضغط وحده. فالحقل الذي تركه
   * الموظّف يقول عيبه فوراً، ولا ينتظر ضغطةً ليكتشفها.
   *
   * وصحّة الإيميل والجوال تُفحص هنا بنفس شرط الخادم تقريباً — لا بديلاً عنه:
   * `create-manual-order.ts` يعيد الفحص بزود و`toE164`، وهو الحارس الحقيقيّ.
   */
  const errors: Record<string, string | null> = {
    buyerName: !buyerName.trim() ? "اكتب اسم العميل" : null,
    buyerEmail: !buyerEmail.trim()
      ? "اكتب الإيميل"
      : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(buyerEmail.trim())
        ? "الإيميل غير صالح"
        : null,
    buyerPhone: !buyerPhone.trim()
      ? "اكتب رقم الجوال"
      : buyerPhone.replace(/\D/g, "").length < 9
        ? "الرقم قصير"
        : null,
    customName: isCustom && !customName ? "اختر الباقة" : null,
    customTotal: isCustom && customTotalNum == null ? "اكتب الإجمالي" : null,
    customArticles: isCustom && customArticles === "" ? "اكتب عدد المقالات" : null,
    customMonths: isCustom && customMonthsNum < 1 ? "اكتب عدد الأشهر" : null,
    plan: !isCustom && (!plan || !price || !term) ? "اختر باقةً لها سعرٌ في هذا السوق" : null,
  };
  const canSubmit = Object.values(errors).every((e) => e == null);
  /** يُظهر خطأ حقلٍ لم يُلمَس بعد — يُفعَّل عند أول محاولة حفظ. */
  const err = (k: string) => (touched[k] || submitTried ? errors[k] : null);

  const submit = () => {
    setSubmitTried(true);
    if (!canSubmit) return;
    startTransition(async () => {
      const res = await createManualOrder({
        market,
        planId: isCustom ? undefined : planId,
        paidMonths: isCustom ? customMonthsNum : paidMonths,
        customName: isCustom ? customName || undefined : undefined,
        customTotal: isCustom ? customTotalNum ?? undefined : undefined,
        customArticlesPerMonth: isCustom ? Number(customArticles) : undefined,
        buyerName,
        buyerEmail,
        buyerPhone,
        businessName: businessName || undefined,
        salesRepId: salesRepId || undefined,
        status: "PAID",
        paidAt: paidAt || undefined,
        notes: notes || undefined,
        leadId,
      });

      if (!res.ok) {
        toast({ title: "لم يُسجَّل الطلب", description: res.error, variant: "destructive" });
        return;
      }
      toast({ title: "سُجّل الطلب", description: res.number });
      router.push(`/orders/${res.id}`);
    });
  };

  return (
    <div className="flex flex-col gap-3">
      <Section
        title="الاشتراك"
        aside={
          /**
           * السوق في رأس البطاقة لا في جسمها (خالد ١٥ سبتمبر ٢٠٢٦): هو يحكم كلّ ما
           * تحته — السعر والعملة والضريبة — فيُقرأ قبلها لا بينها، ويصغر لأنّه خياران
           * لا قائمة.
           */
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              {MARKETS.map((m) => (
                <button
                  key={m.key}
                  type="button"
                  onClick={() => setMarket(m.key)}
                  aria-pressed={market === m.key}
                  className={cn(
                    "rounded px-2 py-0.5 text-[11px] font-bold transition-colors",
                    market === m.key
                      ? "bg-primary/10 text-primary ring-1 ring-primary/30"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>
        }
      >
        <div className="flex flex-wrap items-end gap-x-6 gap-y-3">
          {isCustom ? null : (
            <Field label="المدّة">
              <div className="flex flex-wrap gap-1.5">
                {data.terms.map((t) => (
                  <Choice key={t.paidMonths} selected={paidMonths === t.paidMonths} onClick={() => setPaidMonths(t.paidMonths)}>
                    {t.paidMonths} شهور
                    {t.bonusServiceMonths > 0 ? (
                      <span className="ms-1 text-[10px] font-medium opacity-70">+{t.bonusServiceMonths}</span>
                    ) : null}
                  </Choice>
                ))}
              </div>
            </Field>
          )}
        </div>

        <Field label="الباقة" error={err("plan")}>
          <div className="grid max-w-2xl grid-cols-4 gap-1.5">
            {data.plans.map((p) => {
              const pr = p.priceByMarket[market];
              /**
               * الإجمالي لا سعر الشهر (خالد ١٥ سبتمبر ٢٠٢٦): «نجيب لي الباقة باسمها
               * وإجماليها». الموظّف يختار المدّة أوّلاً، فيصير كل زرّ يقول الرقم الذي سيقوله للعميل —
               * لا رقماً يُضرب في رأسه.
               */
              const planTotal = pr && term ? pr.monthlyBase * term.paidMonths : null;
              return (
                <Choice key={p.id} selected={planId === p.id} disabled={!pr} onClick={() => setPlanId(p.id)}>
                  <span className="flex flex-col gap-0.5 text-start">
                    <span className="truncate">{p.name}</span>
                    <span className="text-sm font-extrabold tabular-nums">
                      {planTotal != null ? planTotal.toLocaleString() : "—"}
                      <span className="ms-1 text-[10px] font-medium text-muted-foreground">
                        {marketMeta.currencyWord}
                      </span>
                    </span>
                    <span className="text-[10px] font-medium text-muted-foreground">
                      {p.articlesPerMonth ? `${p.articlesPerMonth} مقال/شهر` : "بلا حصّة"}
                    </span>
                  </span>
                </Choice>
              );
            })}

            <Choice selected={isCustom} onClick={() => setPlanId(CUSTOM)}>
              <span className="flex flex-col gap-0.5 text-start">
                <span className="truncate">أخرى</span>
                <span className="text-sm font-extrabold">—</span>
                <span className="text-[10px] font-medium text-muted-foreground">سعر واتفاق خاصّ</span>
              </span>
            </Choice>
          </div>
        </Field>

        {isCustom ? (
          <div className="grid grid-cols-2 gap-x-3 gap-y-3 rounded-md border border-dashed p-3 sm:grid-cols-5">
            {/**
              * الباقة تُختار من الكتالوج لا تُكتب (خالد ١٥ سبتمبر ٢٠٢٦): «بدل اسم الاتفاق
              * يكون الباقة وأسوّي سلكت منها». فاسمٌ حرّ يعني عشرة تهجّئات لباقةٍ واحدة على
              * عشر فواتير، ولا يُعرف بعدها على أي باقةٍ يُشغَّل العميل.
              */}
            <Field label="الباقة *" error={err("customName")}>
              <Select value={customName} onValueChange={setCustomName}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="اختر الباقة" />
                </SelectTrigger>
                <SelectContent>
                  {data.plans.map((p) => (
                    <SelectItem key={p.id} value={p.name} className="text-xs">
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="الإجمالي *" error={err("customTotal")}>
              <Input className="h-8 text-xs" type="number" min={0} value={customTotal} onChange={(e) => setCustomTotal(e.target.value)} onBlur={() => touch("customTotal")} placeholder="0" />
            </Field>
            <Field label="مقالات/شهر *" error={err("customArticles")}>
              <Input className="h-8 text-xs" type="number" min={0} value={customArticles} onChange={(e) => setCustomArticles(e.target.value)} onBlur={() => touch("customArticles")} placeholder="8" />
            </Field>
            <Field label="عدد الأشهر *" error={err("customMonths")}>
              <Input className="h-8 text-xs" type="number" min={1} value={customMonths} onChange={(e) => setCustomMonths(e.target.value)} onBlur={() => touch("customMonths")} placeholder="12" />
            </Field>

            {/**
              * إجمالي المقالات — محسوبٌ لا مُدخَل (خالد ١٥ سبتمبر ٢٠٢٦). وهو الرقم
              * الذي يُوعَد به العميل فعلاً، فرؤيتُه قبل الحفظ تمنع اتفاقاً يُكتشف خطؤه بعد شهر.
              */}
            <Field label="إجمالي المقالات">
              <div className="flex h-8 items-center rounded-md border border-dashed bg-muted/40 px-2 text-xs font-bold tabular-nums">
                {customArticlesTotal != null ? customArticlesTotal.toLocaleString() : "—"}
              </div>
            </Field>
          </div>
        ) : null}

        {/* العنصر المهيمن — الرقم الذي تُحفظ الصفحة من أجله، فيأخذ أرضيّة تفصله عمّا فوقه. */}
        <div className="-mx-3.5 -mb-3.5 mt-1 flex flex-wrap items-baseline gap-x-3 border-t bg-muted/40 px-3.5 py-3">
          {total != null && serviceMonths != null ? (
            <>
              <span className="text-2xl font-extrabold leading-none tabular-nums">
                {total.toLocaleString()}
              </span>
              <span className="text-xs font-semibold text-muted-foreground">{marketMeta.currencyWord}</span>
              <span className="text-[11px] text-muted-foreground">
                · {vatLabel(market)} · خدمة {serviceMonths} شهراً
                {isCustom ? " · اتفاق خاصّ" : null}
              </span>
            </>
          ) : (
            <span className="text-[11px] text-muted-foreground">اختر باقةً لها سعرٌ في هذا السوق.</span>
          )}
        </div>
      </Section>

      <Section title="العميل">
        <div className="grid grid-cols-2 gap-x-3 gap-y-3 sm:grid-cols-3">
          <Field label="الاسم *" error={err("buyerName")}>
            <Input className="h-8 text-xs" value={buyerName} onChange={(e) => setBuyerName(e.target.value)} onBlur={() => touch("buyerName")} placeholder="محمد العمري" />
          </Field>
          <Field label="الإيميل *" error={err("buyerEmail")}>
            <Input className="h-8 text-xs" value={buyerEmail} onChange={(e) => setBuyerEmail(e.target.value)} onBlur={() => touch("buyerEmail")} placeholder="you@company.com" />
          </Field>
          <Field label="الجوال *" error={err("buyerPhone")}>
            <Input className="h-8 text-xs" value={buyerPhone} onChange={(e) => setBuyerPhone(e.target.value)} onBlur={() => touch("buyerPhone")} placeholder={market === "EG" ? "01012345678" : "0501234567"} />
          </Field>
          {/**
            * نوع النشاط لا اسمه (خالد ١٥ سبتمبر ٢٠٢٦): وصفٌ حرّ يكتبه الموظّف ليعرف مع من
            * يتعامل. و**الصناعة المعتمدة** تُحدّد عند تأسيس العميل من جدول `Industry` — لا هنا،
            * لأنّ صفحة الدفع لا تسأل الزائر صناعته، فطلبها هنا يجعل المنفذَين يكتبان حقولاً مختلفة.
            */}
          <Field label="نوع النشاط">
            <Input className="h-8 text-xs" value={businessName} onChange={(e) => setBusinessName(e.target.value)} placeholder="عيادة أسنان" />
          </Field>
          <Field label="المندوب">
            <Select value={salesRepId} onValueChange={setSalesRepId}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="اختر المندوب" />
              </SelectTrigger>
              <SelectContent>
                {data.salesReps.map((r) => (
                  <SelectItem key={r.id} value={r.id} className="text-xs">
                    {r.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          {/**
            * تاريخ الدفع — للترحيل لا للاستعمال اليوميّ: عميلٌ دفع في مارس يُسجَّل
            * بتاريخه، وإلّا دخل تقرير سبتمبر وحُسبت نهاية اشتراكه من اليوم. والطلب
            * الجديد يُترك فارغاً فيُسجَّل اليوم.
            */}
          <Field label="تاريخ الدفع">
            <Input className="h-8 text-xs" type="date" value={paidAt} onChange={(e) => setPaidAt(e.target.value)} />
          </Field>
        </div>

        {/* ملاحظة داخليّة — سطرٌ كامل لأنّها جملة لا قيمة، وفي الآخر لأنّها اختياريّة. */}
        <Field label="ملاحظات">
          <Input
            className="h-8 text-xs"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="مثلاً: حوّل نصف المبلغ والباقي بعد أسبوع"
          />
        </Field>
      </Section>

      <div className="flex items-center gap-3">
        <Button size="sm" onClick={submit} disabled={pending} className="h-8 gap-1.5">
          {pending ? <Loader2 className="size-3.5 animate-spin" /> : <Check className="size-3.5" />}
          سجّل الطلب
        </Button>
        <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
          <Receipt className="size-3" />
          يُفتح برقم متسلسل، ثم تُصدَر الفاتورة من صفحة الطلب.
        </span>
      </div>
    </div>
  );
}
