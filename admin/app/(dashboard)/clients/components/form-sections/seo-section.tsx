"use client";

import { UseFormReturn } from "react-hook-form";
import { FormInput, FormTextarea } from "@/components/admin/form-field";
import { CharacterCounter } from "@/components/shared/character-counter";
import type { ClientFormSchemaType } from "../../helpers/client-form-schema";
import { getSEOSettings, type SEOSettings } from "@/app/(dashboard)/settings/actions/settings-actions";
import { useState, useEffect } from "react";
import { ChevronDown, AlertCircle, AlertTriangle } from "lucide-react";

interface SEOSectionProps {
  form: UseFormReturn<ClientFormSchemaType>;
}

export function SEOSection({ form }: SEOSectionProps) {
  const { watch, setValue, formState: { errors } } = form;
  const [seoSettings, setSeoSettings] = useState<SEOSettings | null>(null);
  const [openSections, setOpenSections] = useState({
    metaBasics: false,
  });

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };
  
  const seoTitleHint = seoSettings
    ? `عنوان SEO — الحد الأقصى 51 حرف (العنوان النهائي في جوجل: 60 حرف)`
    : "عنوان SEO — الحد الأقصى 51 حرف (يُضاف '- مودونتي' تلقائياً)";

  const seoDescriptionHint = seoSettings
    ? `وصف SEO — الطول الأمثل ${seoSettings.seoDescriptionMin}-${seoSettings.seoDescriptionMax} حرف`
    : "وصف SEO — الطول الأمثل 120-160 حرف";

  useEffect(() => {
    async function loadSettings() {
      try {
        const settings = await getSEOSettings();
        setSeoSettings(settings);
      } catch (error) {
        console.error("Failed to load SEO settings:", error);
      }
    }
    loadSettings();
  }, []);

  const seoTitleValue = (watch("seoTitle") || "") as string;
  const seoDescriptionValue = (watch("seoDescription") || "") as string;

  const hasMetaBasicsErrors = Boolean(errors.seoTitle || errors.seoDescription);

  const seoTitleLength = seoTitleValue.trim().length;
  const seoDescriptionLength = seoDescriptionValue.trim().length;

  const seoTitleMin = seoSettings?.seoTitleMin ?? 30;
  const seoTitleMax = seoSettings?.seoTitleMax ?? 60;
  const seoDescriptionMin = seoSettings?.seoDescriptionMin ?? 120;
  const seoDescriptionMax = seoSettings?.seoDescriptionMax ?? 160;

  const warningCounts = {
    metaBasics:
      // SEO title: warn when empty OR outside recommended range
      (seoTitleLength === 0
        ? 1
        : seoTitleLength < seoTitleMin || seoTitleLength > seoTitleMax
        ? 1
        : 0) +
      // SEO description: warn when empty OR outside recommended range
      (seoDescriptionLength === 0
        ? 1
        : seoDescriptionLength < seoDescriptionMin || seoDescriptionLength > seoDescriptionMax
        ? 1
        : 0),
  } as const;

  return (
    <div className="space-y-6">
      {/* Meta basics */}
      <div className="space-y-3">
        <button
          type="button"
          onClick={() => toggleSection("metaBasics")}
          className="flex flex-col gap-1 mb-1 w-full text-left"
        >
          <div className="flex items-center gap-2 w-full">
            <div className="flex items-center gap-2">
              <ChevronDown
                className={`h-3 w-3 text-muted-foreground transition-transform ${
                  openSections.metaBasics ? "rotate-0" : "-rotate-90"
                }`}
              />
              <h3 className="text-xs font-extrabold text-foreground tracking-wide uppercase whitespace-nowrap">
                Meta basics
              </h3>
            </div>
            <div className="ml-auto flex items-center gap-1">
              {hasMetaBasicsErrors && (
                <AlertCircle className="h-3 w-3 text-destructive" aria-hidden="true" />
              )}
              {warningCounts.metaBasics > 0 && (
                <span className="inline-flex items-center justify-center rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-semibold text-amber-500 border border-amber-500/40">
                  <AlertTriangle className="h-3 w-3 mr-1" aria-hidden="true" />
                  {warningCounts.metaBasics}
                </span>
              )}
            </div>
          </div>
          <div className="h-px w-full bg-border" />
        </button>

        {openSections.metaBasics && (
          <div className="space-y-3">
            <div>
              <FormInput
                label="SEO Title"
                name="seoTitle"
                value={watch("seoTitle") || ""}
                onChange={(e) => setValue("seoTitle", e.target.value || null, { shouldValidate: true })}
                error={errors.seoTitle?.message}
                placeholder="e.g., Best Services in Saudi Arabia | Company Name"
                hint={seoTitleHint}
                maxLength={51}
              />
              {seoSettings && (
                <div className="mt-1">
                  <CharacterCounter
                    current={(watch("seoTitle") || "").length}
                    min={seoSettings.seoTitleMin}
                    max={seoSettings.seoTitleMax}
                    restrict={seoSettings.seoTitleRestrict}
                    className="ml-1"
                    belowMinHint="Below recommended length. Per Google Search Central, titles between 50-60 characters display fully in search results."
                    aboveMaxHint="Exceeds recommended length. Google typically truncates titles after ~60 characters in search results."
                  />
                </div>
              )}
            </div>
            <div>
              <FormTextarea
                label="SEO Description"
                name="seoDescription"
                value={watch("seoDescription") || ""}
                onChange={(e) => setValue("seoDescription", e.target.value || null, { shouldValidate: true })}
                rows={3}
                error={errors.seoDescription?.message}
                placeholder="e.g., Leading provider of professional services in Saudi Arabia. Trusted by thousands of clients..."
                hint={seoDescriptionHint}
              />
              {seoSettings && (
                <div className="mt-1">
                  <CharacterCounter
                    current={(watch("seoDescription") || "").length}
                    min={seoSettings.seoDescriptionMin}
                    max={seoSettings.seoDescriptionMax}
                    restrict={seoSettings.seoDescriptionRestrict}
                    className="ml-1"
                    belowMinHint="Description is too short. Ideal length is 120-158 characters for full display in search results (Google Search Central)."
                    aboveMaxHint="Exceeds recommended length. Keep it between 120-158 characters to avoid truncation in search results."
                  />
                </div>
              )}
            </div>
            {/* Meta Robots removed: index/noindex is a PLATFORM default from
                Settings (settings.defaultMetaRobots), not a per-client field. */}
          </div>
        )}
      </div>
    </div>
  );
}
