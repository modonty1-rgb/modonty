"use client";

import { UseFormReturn } from "react-hook-form";
import type { ClientFormSchemaType } from "../../helpers/client-form-schema";
import { SubscriptionTier } from "@prisma/client";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { resolvePricing } from "../../../subscription-tiers/lib/pricing";

/** SA for Saudi/Gulf, EG for Egypt — decides which price column the client sees. */
function countryOf(addressCountry?: string | null): "SA" | "EG" {
  const c = (addressCountry ?? "").toLowerCase();
  return /مصر|egypt|\beg\b/.test(c) ? "EG" : "SA";
}

interface SubscriptionSectionProps {
  form: UseFormReturn<ClientFormSchemaType>;
  isEditMode?: boolean;
  /** The client's country — the price shown follows it (Egyptian client → EGP prices). */
  addressCountry?: string | null;
  /** Sales reps for the header picker (edit mode surfaces the rep in the money section). */
  salesReps?: Array<{ id: string; name: string }>;
  tierConfigs?: Array<{
    id: string;
    tier: SubscriptionTier;
    name: string;
    articlesPerMonth: number;
    price: number;
    isPopular: boolean;
    /** { SA: {mo,yr}, EG: {mo,yr} } — the per-country price table. */
    pricing?: unknown;
  }>;
}

/**
 * The client's money section — one language with the CREATE form (Khalid 2026-07-25:
 * «نفس الفكرة»): sales rep in the header, compact tier cards, a fourth «internal/free»
 * card, and the billing-cycle + currency row. Price follows country + cycle. «مميّز»
 * stays in the sticky bar; «داخلي» lives here as the fourth card. NOTE: dates + article
 * count come from the invoice workflow (Accounts), not this section.
 */
export function SubscriptionSection({
  form,
  addressCountry,
  tierConfigs = [],
  salesReps = [],
}: SubscriptionSectionProps) {
  const { watch, setValue, formState: { errors } } = form;
  const subscriptionTier = watch("subscriptionTier");
  const isInternal = watch("isInternal");
  const salesRepId = watch("salesRepId");
  const billingCycle = watch("billingCycle") === "monthly" ? "monthly" : "annual";

  const country = countryOf(addressCountry);
  const currencyWord = country === "EG" ? "جنيه" : "ريال";

  return (
    <div className="space-y-3">
      {/* Header row — the label and the sales rep on opposite ends. */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-semibold text-muted-foreground">الباقة</p>
        <div className="flex items-center gap-2">
          <Label className="text-xs font-bold whitespace-nowrap">المندوب</Label>
          <Select value={salesRepId || undefined} onValueChange={(val) => setValue("salesRepId", val || null, { shouldValidate: true })}>
            <SelectTrigger className={`h-9 w-[180px] ${errors.salesRepId ? "border-destructive ring-1 ring-destructive/40" : ""}`}>
              <SelectValue placeholder="اختر المندوب…" />
            </SelectTrigger>
            <SelectContent>
              {salesReps.map((rep) => <SelectItem key={rep.id} value={rep.id}>{rep.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Tier cards + the fourth internal/free card. */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {tierConfigs.map((cfg) => {
          const bucket = resolvePricing(cfg.name, cfg.pricing)[country];
          const amount = billingCycle === "monthly" ? bucket.mo : bucket.yr;
          const selected = subscriptionTier === cfg.tier;
          return (
            <button
              key={cfg.tier}
              type="button"
              onClick={() => {
                setValue("subscriptionTier", cfg.tier, { shouldValidate: true });
                setValue("articlesPerMonth", cfg.articlesPerMonth, { shouldValidate: true });
              }}
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
                <span className="text-[10px] font-medium text-muted-foreground"> {currencyWord}</span>
                <div className="text-[9px] font-normal text-muted-foreground">/شهر</div>
              </div>
            </button>
          );
        })}

        {/* Fourth card — internal/platform account (free, excluded from all billing). */}
        <button
          type="button"
          onClick={() => setValue("isInternal", !isInternal, { shouldDirty: true })}
          className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-start transition-all ${
            isInternal ? "border-primary bg-primary/[0.07] ring-2 ring-primary/20" : "border-dashed border-input hover:border-primary/40"
          }`}
        >
          <span className="text-[13px] font-bold truncate">🏛️ حساب داخلي</span>
          <span className="ms-auto shrink-0 text-[10px] font-medium text-muted-foreground">مجاني</span>
        </button>
      </div>
      {errors.subscriptionTier && <p className="text-xs text-destructive">{errors.subscriptionTier.message}</p>}

      {/* Billing cycle + currency. */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-3">
        <div>
          <Label className="text-xs font-semibold mb-1.5 block">دورة الفوترة</Label>
          <div className="grid grid-cols-2 gap-2">
            {([["annual", "سنوي"], ["monthly", "شهري"]] as const).map(([val, label]) => {
              const on = billingCycle === val;
              return (
                <button
                  key={val}
                  type="button"
                  onClick={() => setValue("billingCycle", val, { shouldDirty: true, shouldValidate: true })}
                  className={`rounded-lg border py-2 text-sm font-semibold transition ${
                    on ? "border-primary bg-primary/[0.07] ring-2 ring-primary/20" : "border-input hover:border-primary/40"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
        <div>
          <Label className="text-xs font-semibold mb-1.5 block">العملة</Label>
          <div className="flex h-[42px] items-center rounded-lg border border-input bg-muted/30 px-3">
            <span className="text-sm font-semibold">
              {country === "EG" ? "جنيه مصري (EGP)" : "ريال سعودي (SAR)"}
            </span>
            <span className="ms-auto text-[11px] text-muted-foreground">تُحدَّد من الدولة</span>
          </div>
        </div>
      </div>
    </div>
  );
}
