"use client";

import { UseFormReturn } from "react-hook-form";
import type { ClientFormSchemaType } from "../../helpers/client-form-schema";
import { SubscriptionTier } from "@prisma/client";

interface SubscriptionSectionProps {
  form: UseFormReturn<ClientFormSchemaType>;
  isEditMode?: boolean;
  tierConfigs?: Array<{
    id: string;
    tier: SubscriptionTier;
    name: string;
    articlesPerMonth: number;
    price: number;
    isPopular: boolean;
  }>;
}

// NOTE: dates + article count removed (2026-06-10) — dates come from the invoice
// workflow (Accounts), articles are derived from the tier config. Subscription is
// owned by the invoice flow; the read-only treatment of this tier is deferred to the
// dedicated edit-form UI/UX phase.
export function SubscriptionSection({
  form,
  tierConfigs = [],
}: SubscriptionSectionProps) {
  const { watch, setValue, formState: { errors } } = form;
  const subscriptionTier = watch("subscriptionTier");

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2 h-10">
        {tierConfigs.map((config) => (
          <button
            key={config.tier}
            type="button"
            onClick={() => {
              setValue("subscriptionTier", config.tier, { shouldValidate: true });
              setValue("articlesPerMonth", config.articlesPerMonth, { shouldValidate: true });
            }}
            className={`h-full rounded border px-3 text-[11px] font-medium transition-all whitespace-nowrap ${
              subscriptionTier === config.tier
                ? "border-violet-500 bg-violet-500/15 text-violet-700 dark:text-violet-300"
                : "border-input hover:border-violet-500/40 text-muted-foreground"
            }`}
          >
            {config.name} {config.price > 0 ? config.price.toLocaleString() : "Free"}
          </button>
        ))}
      </div>
      {errors.subscriptionTier && (
        <p className="text-xs text-destructive">{errors.subscriptionTier.message}</p>
      )}
    </div>
  );
}
