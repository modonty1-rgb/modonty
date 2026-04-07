"use client";

import { UseFormReturn } from "react-hook-form";
import { Input } from "@/components/ui/input";
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

export function SubscriptionSection({
  form,
  isEditMode = false,
  tierConfigs = [],
}: SubscriptionSectionProps) {
  const { watch, setValue, formState: { errors } } = form;
  const subscriptionTier = watch("subscriptionTier");
  const articlesPerMonth = watch("articlesPerMonth");

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
                ? "border-violet-500 bg-violet-500/15 text-violet-300"
                : "border-input hover:border-violet-500/40 text-muted-foreground"
            }`}
          >
            {config.name} {config.price > 0 ? config.price.toLocaleString() : "Free"}
          </button>
        ))}
        <Input type="number" value={articlesPerMonth ?? ""} readOnly className="h-full w-14 text-center text-xs" placeholder="—" />
        <Input
          type="date"
          value={watch("subscriptionStartDate") ? new Date(watch("subscriptionStartDate")!).toISOString().split("T")[0] : ""}
          onChange={(e) => setValue("subscriptionStartDate", e.target.value ? new Date(e.target.value) : null, { shouldValidate: true })}
          className="h-full w-36 text-xs"
        />
        <Input
          type="date"
          value={watch("subscriptionEndDate") ? new Date(watch("subscriptionEndDate")!).toISOString().split("T")[0] : ""}
          onChange={(e) => setValue("subscriptionEndDate", e.target.value ? new Date(e.target.value) : null, { shouldValidate: true })}
          className="h-full w-36 text-xs"
        />
      </div>
      {errors.subscriptionTier && (
        <p className="text-xs text-destructive">{errors.subscriptionTier.message}</p>
      )}
    </div>
  );
}
