"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Building2, CreditCard, Shield, Plus, Loader2, Mail } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogFooter,
  AlertDialogTitle, AlertDialogDescription, AlertDialogAction, AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { useClientForm } from "../../helpers/hooks/use-client-form";
import { clientCreateFormSchema } from "../../helpers/client-form-schema";
import { sendClientWelcome } from "../../actions/clients-actions";
import { DEFAULT_CLIENT_PASSWORD } from "@/lib/default-client-password";
import { YMYL_CATEGORIES, type YmylCategory } from "@modonty/shared/lib/seo/ymyl-config";
import { LEGAL_FORMS, type LegalForm } from "@modonty/shared/lib/constants/client-classification";
import { resolvePricing } from "../../../subscription-tiers/lib/pricing";

interface CreatedClient {
  id: string;
  name: string;
  email: string;
}

interface CreateClientFormProps {
  industries?: Array<{ id: string; name: string }>;
  siteUrl?: string | null;
  countries?: Array<{ code: string; nameAr: string; nameEn: string }>;
  salesReps?: Array<{ id: string; name: string }>;
  editors?: Array<{ id: string; name: string }>;
}

// Self-contained CREATE UI. Backend is shared via useClientForm (createClient).
// Editing has its own UI (ClientForm) — changes here never affect it.
export function CreateClientForm({ industries = [], siteUrl = null, countries = [], salesReps = [], editors = [] }: CreateClientFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [created, setCreated] = useState<CreatedClient | null>(null);
  const [sending, setSending] = useState(false);

  const { form, handleSubmit, loading, error, tierConfigs } = useClientForm({
    schema: clientCreateFormSchema,
    onCreated: (client) => setCreated(client),
  });
  const { watch, setValue, register, formState: { errors } } = form;

  // New clients default to Saudi Arabia (the primary market) so the console's
  // country-aware logic (isSaudi → tax + national-address fields) is correct from
  // creation. Admin changes it for EG/AE clients.
  useEffect(() => {
    if (!form.getValues("addressCountry")) {
      setValue("addressCountry", "SA", { shouldValidate: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // After create: either send the welcome email (login creds) or skip — then go to list.
  const finishToList = () => {
    setCreated(null);
    router.push("/clients");
    router.refresh();
  };

  const handleSendWelcome = async () => {
    if (!created) return;
    setSending(true);
    const res = await sendClientWelcome(created.id);
    setSending(false);
    if (res.success) {
      toast({ title: "تم الإرسال", description: `أُرسلت بيانات الدخول إلى ${created.email}.` });
    } else {
      toast({ title: "تعذّر الإرسال", description: res.error, variant: "destructive" });
    }
    finishToList();
  };

  const v = watch();

  // Tiers shown ascending by price (مجاني → الأعلى) for natural scanning.
  const sortedTiers = [...tierConfigs].sort((a, b) => a.price - b.price);

  // Currency follows the client's country (Egypt → EGP, everything else → SAR), the same
  // rule the Accounts/invoice pages use. Shown read-only here so the money section is complete.
  const currency: "EGP" | "SAR" = /^eg/i.test(v.addressCountry ?? "") ? "EGP" : "SAR";
  const billingCycle = v.billingCycle ?? "annual";

  // Auto-fill the opening balance = unit price (country + cycle aware) × the cycle's months
  // (annual → 12, monthly → 1). Admin can override for a client who paid a different amount.
  // Internal accounts are free, so they carry no balance.
  useEffect(() => {
    if (v.isInternal) return;
    const cfg = tierConfigs.find((c) => c.tier === v.subscriptionTier);
    if (!cfg) return;
    const bucket = currency === "EGP" ? resolvePricing(cfg.name, cfg.pricing).EG : resolvePricing(cfg.name, cfg.pricing).SA;
    const unit = billingCycle === "monthly" ? bucket.mo : bucket.yr;
    const months = billingCycle === "monthly" ? 1 : 12;
    setValue("openingBalance", unit * months, { shouldValidate: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [v.subscriptionTier, v.billingCycle, v.addressCountry, v.isInternal, tierConfigs]);

  return (
    <>
    <form id="client-form" onSubmit={handleSubmit} className="space-y-4">
      {/* Top banner is now reserved for server-side errors only (e.g. duplicate email/phone).
          Field-validation errors render inline under each field via the hook. */}
      {error && (
        <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md" role="alert">
          {error}
        </div>
      )}

      {/* 1. Identity + login (email = username). Password is a default sent in
          the welcome email; the client changes it from the console. */}
      <Card icon={<Building2 />} tone="blue" title="بيانات العميل" desc="الاسم والصناعة يظهران في المحتوى · الإيميل = اسم الدخول"
        pill={v.slug ? `${(siteUrl || "https://modonty.com").replace(/^https?:\/\//, "")}/clients/${v.slug}` : undefined}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="اسم العميل" required error={errors.name?.message}>
            <Input {...register("name")} placeholder="مثال: دريم تو آب" />
            <Help>يظهر في المقالات · الرابط يتولّد تلقائياً</Help>
          </Field>
          <Field label="الإيميل — اسم الدخول" required error={errors.email?.message}>
            <Input {...register("email")} type="email" dir="ltr" className="text-start" placeholder="client@example.com" />
            <Help>
              كلمة المرور تتأسس تلقائياً مع الإيميل (<span dir="ltr" className="font-mono font-semibold">{DEFAULT_CLIENT_PASSWORD}</span>) وتُرسل في إيميل الترحيب · يغيّرها العميل أول دخول
            </Help>
          </Field>
          <Field label="الصناعة" required error={errors.industryId?.message}>
            <Select value={v.industryId || undefined} onValueChange={(val) => setValue("industryId", val || "", { shouldValidate: true })}>
              <SelectTrigger className="w-full"><SelectValue placeholder="اختر الصناعة…" /></SelectTrigger>
              <SelectContent>
                {industries.map((ind) => <SelectItem key={ind.id} value={ind.id}>{ind.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>
          <Field label="الجوال" required error={errors.phone?.message}>
            <Input {...register("phone")} dir="ltr" className="text-start" placeholder="+966 5x xxx xxxx" />
          </Field>
          <Field label="الدولة" required error={errors.addressCountry?.message}>
            <Select value={v.addressCountry || "SA"} onValueChange={(val) => setValue("addressCountry", val || null, { shouldValidate: true })}>
              <SelectTrigger className="w-full"><SelectValue placeholder="اختر الدولة…" /></SelectTrigger>
              <SelectContent>
                {countries.map((c) => <SelectItem key={c.code} value={c.code}>{c.nameAr} ({c.code})</SelectItem>)}
              </SelectContent>
            </Select>
            <Help>يحدّد حقول الضريبة والعنوان في لوحة العميل (السعودية ↔ غيرها)</Help>
          </Field>
          <Field label="الشكل القانوني" optional error={errors.legalForm?.message}>
            <Select value={v.legalForm || undefined} onValueChange={(val) => setValue("legalForm", val ? (val as LegalForm) : null, { shouldValidate: true })}>
              <SelectTrigger className="w-full"><SelectValue placeholder="اختر الشكل القانوني…" /></SelectTrigger>
              <SelectContent>
                {LEGAL_FORMS.map((o) => <SelectItem key={o.value} value={o.value}>{o.ar} — {o.value}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>
          <Field label="الكاتب" optional error={errors.editorId?.message}>
            <Select value={v.editorId || undefined} onValueChange={(val) => setValue("editorId", val || null, { shouldValidate: true })}>
              <SelectTrigger className="w-full"><SelectValue placeholder="اختر الكاتب…" /></SelectTrigger>
              <SelectContent>
                {editors.map((ed) => <SelectItem key={ed.id} value={ed.id}>{ed.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Help>الكاتب المسؤول عن مقالات هذا العميل — يظهر في قائمة المقالات</Help>
          </Field>
        </div>
      </Card>


      {/* 4. Financial — plan, billing cycle, currency, featured. Dates + payment status are
          set later by the invoice/activation workflow, not at creation. */}
      <Card
        icon={<CreditCard />}
        tone="green"
        title="القسم المالي"
        desc="الباقة، الفوترة، والعملة — التواريخ تُضبط عند الفوترة"
        headerRight={
          <div className="flex items-center gap-2">
            <Label className="text-xs font-bold whitespace-nowrap">
              المندوب<span className="text-destructive ms-0.5">*</span>
            </Label>
            <Select value={v.salesRepId || undefined} onValueChange={(val) => setValue("salesRepId", val || null, { shouldValidate: true })}>
              <SelectTrigger className={`h-9 w-[190px] ${errors.salesRepId ? "border-destructive ring-1 ring-destructive/40" : ""}`}>
                <SelectValue placeholder="اختر المندوب…" />
              </SelectTrigger>
              <SelectContent>
                {salesReps.map((rep) => <SelectItem key={rep.id} value={rep.id}>{rep.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        }
      >
        <p className="text-xs font-semibold text-muted-foreground mb-2">الباقة</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {sortedTiers.map((cfg) => {
            const selected = v.subscriptionTier === cfg.tier;
            // Price follows the client's country + billing cycle (same source as the
            // Accounts page): EG bucket for Egypt, SA otherwise; monthly vs annual rate.
            const bucket = currency === "EGP" ? resolvePricing(cfg.name, cfg.pricing).EG : resolvePricing(cfg.name, cfg.pricing).SA;
            const amount = billingCycle === "monthly" ? bucket.mo : bucket.yr;
            return (
              <button
                key={cfg.tier}
                type="button"
                onClick={() => setValue("subscriptionTier", cfg.tier, { shouldValidate: true })}
                className={`flex items-center justify-between gap-2 rounded-lg border px-3 py-2 text-start transition-all ${
                  selected ? "border-primary bg-primary/[0.07] ring-2 ring-primary/20" : "border-input hover:border-primary/40"
                }`}
              >
                <div className="min-w-0">
                  <div className="text-[13px] font-bold truncate">{cfg.name}</div>
                  <div className="text-[10px] text-muted-foreground">
                    {cfg.articlesPerMonth > 0 ? `${cfg.articlesPerMonth} مقالات/شهر` : "تجربة"}
                  </div>
                </div>
                <div className="shrink-0 text-end text-sm font-extrabold tabular-nums">
                  {amount > 0 ? amount.toLocaleString() : "0"}
                  <span className="text-[10px] font-medium text-muted-foreground"> {currency === "EGP" ? "جنيه" : "ريال"}</span>
                  <div className="text-[9px] font-normal text-muted-foreground">/شهر</div>
                </div>
              </button>
            );
          })}

          {/* Fourth card — internal/platform account (free, excluded from all billing).
              Independent toggle (isInternal), not a subscription tier. */}
          <button
            type="button"
            onClick={() => setValue("isInternal", !v.isInternal, { shouldDirty: true })}
            className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-start transition-all ${
              v.isInternal ? "border-primary bg-primary/[0.07] ring-2 ring-primary/20" : "border-dashed border-input hover:border-primary/40"
            }`}
          >
            <span className="text-[13px] font-bold truncate">🏛️ حساب داخلي</span>
            <span className="ms-auto shrink-0 text-[10px] font-medium text-muted-foreground">مجاني</span>
          </button>
        </div>
        {errors.subscriptionTier && <p className="text-xs text-destructive mt-2">{errors.subscriptionTier.message}</p>}

        {/* Billing cycle + currency — the money inputs at creation (rep is in the header). */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-4">
          <Field label="دورة الفوترة">
            <div className="grid grid-cols-2 gap-2">
              {([["annual", "سنوي"], ["monthly", "شهري"]] as const).map(([val, label]) => {
                const on = billingCycle === val;
                return (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setValue("billingCycle", val, { shouldDirty: true })}
                    className={`rounded-lg border py-2.5 text-sm font-semibold transition ${
                      on ? "border-primary bg-primary/[0.07] ring-2 ring-primary/20" : "border-input hover:border-primary/40"
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
            <Help>السنوي يمنح مكافأة الشهور الإضافية</Help>
          </Field>
          <Field label="العملة">
            <div className="flex h-[42px] items-center rounded-lg border border-input bg-muted/30 px-3">
              <span className="text-sm font-semibold">
                {currency === "EGP" ? "جنيه مصري (EGP)" : "ريال سعودي (SAR)"}
              </span>
            </div>
            <Help>تتبع دولة العميل تلقائياً</Help>
          </Field>
        </div>

        {/* Opening balance — the founding payment («تأسيسه معناه دفع»). Recorded as revenue
            immediately (paid date = today's creation). NO invoice now; the first invoice is
            generated later from the account page once the client's first article is live.
            Hidden for internal (free) accounts; mandatory for a billable client. */}
        {!v.isInternal && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-4">
            <Field label="الرصيد الافتتاحي (المبلغ المدفوع)" required error={errors.openingBalance?.message}>
              <div className="relative">
                <Input
                  type="number"
                  min={0}
                  value={v.openingBalance ?? ""}
                  onChange={(e) => setValue("openingBalance", e.target.value === "" ? null : Number(e.target.value), { shouldValidate: true })}
                  className="pe-14"
                  placeholder="0"
                />
                <span className="absolute inset-y-0 end-3 flex items-center text-xs font-medium text-muted-foreground">
                  {currency === "EGP" ? "جنيه" : "ريال"}
                </span>
              </div>
              <Help>يتعبّى تلقائياً حسب الباقة والدورة — عدّله لو دفع مبلغ مختلف</Help>
            </Field>
            <div className="flex items-end">
              <p className="text-xs text-muted-foreground leading-relaxed pb-2">
                يُسجَّل كرصيد افتتاحي بتاريخ اليوم ويدخل تقرير المبيعات فوراً. الفاتورة تُصدَر لاحقاً من صفحة الحساب عند نشر أول مقال.
              </p>
            </div>
          </div>
        )}
      </Card>

      {/* 5. YMYL classification */}
      <Card icon={<Shield />} tone="violet" title="تصنيف YMYL"
        desc="للمجالات الطبية / القانونية / المالية — Google يطبّق تدقيق E-E-A-T إضافي">
        <label className="flex items-start gap-3 cursor-pointer">
          <Checkbox checked={v.isYmyl ?? false} className="mt-0.5"
            onCheckedChange={(c) => {
              const on = c === true;
              setValue("isYmyl", on, { shouldValidate: true, shouldDirty: true });
              if (!on) { setValue("ymylCategory", null); setValue("ymylData", null); }
            }} />
          <div>
            <div className="text-sm font-semibold">اعتبر هذا العميل ضمن مجالات YMYL</div>
            <div className="text-xs text-muted-foreground mt-0.5">يفعّل حقول التوثيق ويربط نشر المقالات بمراجع مؤهّل + رخصة كاملة</div>
          </div>
        </label>

        {v.isYmyl && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4 pt-4 border-t">
            {(Object.keys(YMYL_CATEGORIES) as YmylCategory[]).map((key) => {
              const cfg = YMYL_CATEGORIES[key];
              const selected = v.ymylCategory === key;
              return (
                <button key={key} type="button"
                  onClick={() => {
                    if (v.ymylCategory && v.ymylCategory !== key) setValue("ymylData", {}, { shouldDirty: true });
                    setValue("ymylCategory", key, { shouldValidate: true, shouldDirty: true });
                  }}
                  className={`text-start p-3 rounded-lg border transition-all ${
                    selected ? "border-primary bg-primary/5 ring-2 ring-primary/20" : "border-border hover:border-primary/50"
                  }`}>
                  <div className="flex items-center gap-2">
                    <span className={`h-3.5 w-3.5 rounded-full border-2 ${selected ? "border-primary bg-primary" : "border-muted-foreground"}`} />
                    <span className="text-sm font-semibold">{cfg.label.en}</span>
                    <span className="text-xs text-muted-foreground">· {cfg.label.ar}</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-snug mt-1">{cfg.description.ar}</p>
                </button>
              );
            })}
          </div>
        )}

        {v.isYmyl && (
          <p className="text-[11px] text-muted-foreground bg-amber-500/10 border border-amber-500/20 rounded-md px-3 py-2 mt-3">
            ℹ️ الأدمن يحدّد التصنيف فقط. حقول التوثيق (رقم الرخصة، الجهة…) يملأها العميل من الكونسول.
          </p>
        )}
      </Card>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="submit" disabled={loading} className="gap-2">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          {loading ? "جاري الإنشاء…" : "إنشاء العميل"}
        </Button>
      </div>
    </form>

    {/* Post-create: confirm sending login credentials to the client before navigating. */}
    <AlertDialog open={created !== null}>
      <AlertDialogContent dir="rtl">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <span className="h-8 w-8 rounded-lg grid place-items-center bg-emerald-500/12 text-emerald-600 dark:text-emerald-400 [&_svg]:h-4 [&_svg]:w-4">
              <Mail />
            </span>
            تم إنشاء «{created?.name}» ✅
          </AlertDialogTitle>
          <AlertDialogDescription>
            ترسل بيانات الدخول (الإيميل وكلمة المرور) إلى{" "}
            <span dir="ltr" className="font-mono">{created?.email}</span>؟
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={finishToList} disabled={sending}>تخطّي</AlertDialogCancel>
          <AlertDialogAction onClick={(e) => { e.preventDefault(); handleSendWelcome(); }} disabled={sending} className="gap-2">
            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
            {sending ? "جاري الإرسال…" : "إرسال الآن"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </>
  );
}

/* ── Local presentational helpers (create-only) ───────────────────────── */

const TONE: Record<string, string> = {
  blue: "bg-primary/10 text-primary",
  green: "bg-emerald-500/12 text-emerald-600 dark:text-emerald-400",
  violet: "bg-violet-500/12 text-violet-600 dark:text-violet-400",
};

function Card({ icon, tone, title, desc, pill, headerRight, highlight, children }: {
  icon: React.ReactNode; tone: keyof typeof TONE | string; title: string; desc: string;
  pill?: string; headerRight?: React.ReactNode; highlight?: boolean; children: React.ReactNode;
}) {
  return (
    <section className={`rounded-xl border bg-card overflow-hidden ${highlight ? "border-primary/30 bg-primary/[0.03]" : ""}`}>
      <div className="flex items-center gap-3 px-4 py-3.5 border-b">
        <span className={`h-8 w-8 rounded-lg grid place-items-center shrink-0 [&_svg]:h-4 [&_svg]:w-4 ${TONE[tone] ?? TONE.blue}`}>{icon}</span>
        <div className="min-w-0">
          <div className="text-sm font-bold">{title}</div>
          <div className="text-[11.5px] text-muted-foreground truncate">{desc}</div>
        </div>
        {headerRight ? (
          <div className="ms-auto shrink-0">{headerRight}</div>
        ) : pill ? (
          <span className="ms-auto font-mono text-[11px] px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 truncate max-w-[280px]">
            {pill}
          </span>
        ) : null}
      </div>
      <div className="p-4">{children}</div>
    </section>
  );
}

function Field({ label, required, optional, error, className, children }: {
  label: string; required?: boolean; optional?: boolean; error?: string; className?: string; children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <Label className="text-xs font-semibold mb-1.5 block">
        {label}
        {required && <span className="text-destructive ms-1">*</span>}
        {optional && <span className="text-muted-foreground/70 font-normal text-[10.5px] ms-1.5">(اختياري)</span>}
      </Label>
      {children}
      {error && <p className="text-[11px] text-destructive mt-1">{error}</p>}
    </div>
  );
}

function Help({ children }: { children: React.ReactNode }) {
  return <p className="text-[10.5px] text-muted-foreground mt-1.5">{children}</p>;
}
