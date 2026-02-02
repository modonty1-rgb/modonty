"use client";

import { useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { FormSelect, FormInput } from "@/components/admin/form-field";
import { SelectItem } from "@/components/ui/select";
import { SubscriptionTierCards } from "../subscription-tier-cards";
import type { ClientFormSchemaType } from "../../helpers/client-form-schema";
import { SubscriptionTier } from "@prisma/client";
import { ChevronDown, AlertCircle, Asterisk } from "lucide-react";

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
  const subscriptionStartDate = watch("subscriptionStartDate");
  const subscriptionEndDate = watch("subscriptionEndDate");

  const selectedTierConfig = tierConfigs.find((config) => config.tier === subscriptionTier);

  const requiredCounts = {
    plan: 1,
    period: 0,
  } as const;

  const [openSections, setOpenSections] = useState({
    plan: false,
    period: false,
  });

  const sectionHasErrors = (keys: (keyof ClientFormSchemaType)[]) =>
    keys.some((key) => Boolean(errors[key]));

  const hasPlanErrors = sectionHasErrors(["subscriptionTier"]);
  const hasPeriodErrors = sectionHasErrors([
    "subscriptionStartDate",
    "subscriptionEndDate",
    "subscriptionStatus",
    "paymentStatus",
  ]);

  const hasAnyErrors = hasPlanErrors || hasPeriodErrors;

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  return (
    <div className="space-y-6">
      {/* Section header with status icons */}
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <h2 className="text-sm font-medium text-foreground">
            Subscription
          </h2>
          <p className="text-xs text-muted-foreground">
            Choose a plan, set its active period, and (on edit) track status and billing.
          </p>
        </div>
        <div className="flex items-center gap-1 mt-0.5">
          {hasAnyErrors && (
            <AlertCircle className="h-3.5 w-3.5 text-destructive" aria-hidden="true" />
          )}
          {requiredCounts.plan > 0 && (
            <span className="inline-flex items-center justify-center rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
              <Asterisk className="h-3 w-3 mr-1" aria-hidden="true" />
              {requiredCounts.plan}
            </span>
          )}
        </div>
      </div>

      {/* Plan selection + duration */}
      <div className="space-y-4">
        <div className="flex flex-col space-y-3 border rounded-md p-3">
          <div className="space-y-1">
            <label className="text-sm font-medium text-foreground block">
              Subscription Tier<span className="text-destructive ml-0.5">*</span>
            </label>
            <p className="text-xs text-muted-foreground">
              Pick the plan that matches this client&apos;s content volume.
            </p>
          </div>
          <SubscriptionTierCards
            selectedTier={subscriptionTier || ""}
            onSelect={(tier) => setValue("subscriptionTier", tier as SubscriptionTier, { shouldValidate: true })}
            tiers={tierConfigs.map((config) => ({
              value: config.tier,
              name: config.name,
              price: config.price,
              articlesPerMonth: config.articlesPerMonth,
              popular: config.isPopular,
            }))}
          />
          {errors.subscriptionTier && (
            <p className="text-xs text-destructive mt-1">{errors.subscriptionTier.message}</p>
          )}
          {selectedTierConfig && (
            <p className="text-xs text-muted-foreground mt-1">
              Selected plan: <span className="font-medium">{selectedTierConfig.name}</span> ·{" "}
              {selectedTierConfig.articlesPerMonth} articles/month ·{" "}
              {selectedTierConfig.price.toLocaleString(undefined, { maximumFractionDigits: 2 })} SAR.
            </p>
          )}
        </div>
        <div className="flex flex-col gap-2 border rounded-md p-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <FormInput
              name="subscriptionStartDate"
              label="Start Date"
              type="date"
              value={watch("subscriptionStartDate") ? new Date(watch("subscriptionStartDate")!).toISOString().split("T")[0] : ""}
              onChange={(e) => {
                const date = e.target.value ? new Date(e.target.value) : null;
                setValue("subscriptionStartDate", date, { shouldValidate: true });
              }}
              error={errors.subscriptionStartDate?.message}
            />
            <FormInput
              name="subscriptionEndDate"
              label="End Date"
              type="date"
              value={watch("subscriptionEndDate") ? new Date(watch("subscriptionEndDate")!).toISOString().split("T")[0] : ""}
              onChange={(e) => {
                const date = e.target.value ? new Date(e.target.value) : null;
                setValue("subscriptionEndDate", date, { shouldValidate: true });
              }}
              error={errors.subscriptionEndDate?.message}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            End date is usually auto-calculated (+18 months from start) based on the selected tier. You can override it if needed.
          </p>
        </div>
      </div>
      {isEditMode && (
        <p className="text-xs text-muted-foreground">
          Subscription and payment status controls have moved to the Settings tab.
        </p>
      )}

      {/* Read-only summary */}
      <div className="border rounded-md p-3 bg-muted/40 text-xs text-muted-foreground">
        {subscriptionTier ? (
          <p>
            Subscription summary:{" "}
            {selectedTierConfig ? (
              <>
                <span className="font-medium">{selectedTierConfig.name}</span> ·{" "}
                {selectedTierConfig.articlesPerMonth} articles/month
              </>
            ) : (
              <span className="font-medium">{String(subscriptionTier)}</span>
            )}
            {subscriptionStartDate && (
              <>
                {" "}
                · starts{" "}
                <span className="font-medium">
                  {new Date(subscriptionStartDate as Date).toISOString().split("T")[0]}
                </span>
              </>
            )}
            {subscriptionEndDate && (
              <>
                {" "}
                · ends{" "}
                <span className="font-medium">
                  {new Date(subscriptionEndDate as Date).toISOString().split("T")[0]}
                </span>
              </>
            )}
          </p>
        ) : (
          <p>No subscription plan selected yet. Choose a plan to see a quick summary here.</p>
        )}
      </div>
    </div>
  );
}
