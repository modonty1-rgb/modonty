"use client";

/**
 * YMYL (Your Money Your Life) verification section — ADMIN.
 *
 * Admin owns ONLY two decisions:
 *  1. Checkbox: "Is this client YMYL?"
 *  2. Radio (when checked): medical / legal / financial
 *
 * The actual verification fields (license number, authority, specialty, image)
 * are filled by the CLIENT via the console — NOT here. Admin sees only a
 * read-only completion status so they know whether the client has finished.
 */

import { useMemo } from "react";
import { UseFormReturn } from "react-hook-form";
import { Shield, CheckCircle2, Clock } from "lucide-react";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

import {
  YMYL_CATEGORIES,
  type YmylCategory,
} from "@/lib/seo/ymyl-config";

import type { ClientFormSchemaType } from "../../helpers/client-form-schema";

interface YmylSectionProps {
  form: UseFormReturn<ClientFormSchemaType>;
}

export function YmylSection({ form }: YmylSectionProps) {
  const { watch, setValue } = form;

  const isYmyl = watch("isYmyl") ?? false;
  const category = watch("ymylCategory") as YmylCategory | null | undefined;
  const ymylData = (watch("ymylData") ?? {}) as Record<string, unknown>;

  const config = useMemo(() => {
    if (!category) return null;
    return YMYL_CATEGORIES[category];
  }, [category]);

  // Read-only completion check: how many required fields the client has filled
  const completionStatus = useMemo(() => {
    if (!config) return null;
    const required = config.fields.filter((f) => f.required);
    const filled = required.filter((f) => {
      const value = ymylData[f.key];
      return value !== undefined && value !== null && value !== "";
    });
    return { total: required.length, filled: filled.length, complete: filled.length === required.length };
  }, [config, ymylData]);

  const handleCategoryChange = (next: YmylCategory) => {
    if (category && category !== next) {
      // Category change resets ymylData — old shape doesn't fit new category
      setValue("ymylData", {}, { shouldValidate: true, shouldDirty: true });
    }
    setValue("ymylCategory", next, { shouldValidate: true, shouldDirty: true });
  };

  const handleToggleYmyl = (checked: boolean) => {
    setValue("isYmyl", checked, { shouldValidate: true, shouldDirty: true });
    if (!checked) {
      // Disabling YMYL clears category and data
      setValue("ymylCategory", null, { shouldValidate: true, shouldDirty: true });
      setValue("ymylData", null, { shouldValidate: true, shouldDirty: true });
    }
  };

  return (
    <div className="space-y-5">
      {/* Header: explanation */}
      <div className="rounded-lg border bg-muted/30 p-4">
        <div className="flex items-start gap-3">
          <Shield className="h-5 w-5 text-primary mt-0.5 shrink-0" />
          <div className="space-y-1">
            <p className="text-sm font-medium">YMYL Verification (Your Money Your Life)</p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Enable for medical, legal, or financial businesses. Google applies extra E-E-A-T scrutiny
              to these categories — verified license + qualified reviewer boost trust signals significantly.
            </p>
          </div>
        </div>
      </div>

      {/* Step 1: isYmyl checkbox */}
      <label className="flex items-start gap-3 cursor-pointer p-4 rounded-lg border hover:bg-muted/30 transition-colors">
        <Checkbox
          checked={isYmyl}
          onCheckedChange={(checked) => handleToggleYmyl(checked === true)}
          className="mt-0.5"
        />
        <div className="space-y-1">
          <p className="text-sm font-medium">Mark as YMYL client</p>
          <p className="text-xs text-muted-foreground">
            Activates verification fields below and gates article publishing on reviewer + license completeness.
          </p>
        </div>
      </label>

      {/* Step 2: category radio (only when YMYL is on) */}
      {isYmyl && (
        <div className="space-y-3 pl-4 border-l-2 border-primary/30">
          <Label className="text-sm font-medium">YMYL Category</Label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {(Object.keys(YMYL_CATEGORIES) as YmylCategory[]).map((key) => {
              const cfg = YMYL_CATEGORIES[key];
              const selected = category === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleCategoryChange(key)}
                  className={`text-left p-3 rounded-lg border transition-all ${
                    selected
                      ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                      : "border-border hover:border-primary/50 hover:bg-muted/30"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`h-3.5 w-3.5 rounded-full border-2 ${
                        selected ? "border-primary bg-primary" : "border-muted-foreground"
                      }`}
                    />
                    <span className="text-sm font-medium">{cfg.label.en}</span>
                    <span className="text-xs text-muted-foreground">· {cfg.label.ar}</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-snug">{cfg.description.ar}</p>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Step 3: read-only completion status (client fills the actual fields via console) */}
      {isYmyl && config && completionStatus && (
        <div className="space-y-3 pl-4 border-l-2 border-primary/30">
          <Label className="text-sm font-medium">Client Completion Status</Label>

          <div
            className={`flex items-start gap-3 p-4 rounded-lg border ${
              completionStatus.complete
                ? "bg-emerald-50 border-emerald-200"
                : "bg-amber-50 border-amber-200"
            }`}
          >
            {completionStatus.complete ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-600 mt-0.5 shrink-0" />
            ) : (
              <Clock className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
            )}
            <div className="space-y-1">
              <p
                className={`text-sm font-medium ${
                  completionStatus.complete ? "text-emerald-900" : "text-amber-900"
                }`}
              >
                {completionStatus.complete
                  ? `Client completed verification (${completionStatus.filled}/${completionStatus.total} required fields)`
                  : `Awaiting client (${completionStatus.filled}/${completionStatus.total} required fields filled)`}
              </p>
              <p
                className={`text-xs ${
                  completionStatus.complete ? "text-emerald-700" : "text-amber-700"
                }`}
              >
                {completionStatus.complete
                  ? "All verification fields filled. Articles can be published with reviewer attached."
                  : "Client needs to fill the verification fields via the console. Articles won't publish until complete."}
              </p>
            </div>
          </div>

          <p className="text-[11px] text-muted-foreground">
            Verification fields ({config.fields.length} total) are owned by the client and entered through the console
            — not editable here.
          </p>
        </div>
      )}
    </div>
  );
}
