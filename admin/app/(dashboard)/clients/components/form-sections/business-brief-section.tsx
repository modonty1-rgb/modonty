"use client";

import { UseFormReturn, useWatch } from "react-hook-form";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { Info } from "lucide-react";
import { Label } from "@/components/ui/label";
import { FormInput } from "@/components/admin/form-field";
import { CharacterCounter } from "@/components/shared/character-counter";
import type { ClientFormSchemaType } from "../../helpers/client-form-schema";

interface BusinessBriefSectionProps {
  form: UseFormReturn<ClientFormSchemaType>;
  showHeader?: boolean;
}

export function BusinessBriefSection({ form, showHeader = true }: BusinessBriefSectionProps) {
  const { setValue, watch, formState: { errors } } = form;
  const businessBrief = useWatch({ control: form.control, name: "businessBrief" }) || "";
  const slogan = watch("slogan");

  return (
    <div className="space-y-4">
      {showHeader && (
        <div className="flex items-center gap-3 mb-1">
          <h3 className="text-xs font-extrabold text-foreground tracking-wide uppercase whitespace-nowrap">
            Business Brief
          </h3>
          <div className="h-px w-full bg-border" />
        </div>
      )}
      <div className="space-y-5">
        <div>
          <Label className="flex items-center gap-1.5 mb-2 cursor-default">
            <span>Business Brief</span>
            <span className="text-destructive">*</span>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">Essential info for writers to create relevant, tailored articles — describes the client's business, products/services, target audience, and unique selling points</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </Label>
          <Textarea
            name="businessBrief"
            value={businessBrief}
            onChange={(e) => setValue("businessBrief", e.target.value || "", { shouldValidate: false })}
            onBlur={(e) => form.trigger("businessBrief")}
            rows={6}
            placeholder="Describe the client's business, products/services, target audience, and unique selling points. (Minimum 100 characters)"
            className={errors.businessBrief ? "border-destructive" : ""}
          />
          <div className="flex items-center justify-between mt-2">
            <CharacterCounter
              current={businessBrief.length}
              min={100}
              belowMinHint="At least 100 characters recommended for a clear business brief for writers and adequate Schema.org description."
            />
            {errors.businessBrief?.message && (
              <p className="text-xs text-destructive">{errors.businessBrief.message}</p>
            )}
          </div>
        </div>
        <div>
          <FormInput
            name="slogan"
            label="Slogan"
            value={slogan || ""}
            onChange={(e) => form.setValue("slogan", e.target.value || null, { shouldValidate: true })}
            error={errors.slogan?.message}
            placeholder="e.g., Innovation Beyond Boundaries"
            hint="Company tagline or marketing slogan — used in Schema.org structured data — should be short and memorable — recommended max 100 characters"
          />
          {slogan && (
            <div className="mt-1">
              <CharacterCounter
                current={(slogan || "").length}
                max={100}
                className="ml-1"
                aboveMaxHint="Exceeds recommended limit (100 chars). Keep it short and clear for better recall (Schema.org best practices)."
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
