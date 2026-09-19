"use client";

import { UseFormReturn, useWatch } from "react-hook-form";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { FormInput } from "@/components/admin/form-field";
import { CharacterCounter } from "@/components/shared/character-counter";
import type { ClientFormSchemaType } from "../../helpers/client-form-schema";

interface BusinessBriefSectionProps {
  form: UseFormReturn<ClientFormSchemaType>;
  showHeader?: boolean;
  // businessBrief is intake-controlled (the client fills it via the console intake).
  // Show it only at CREATE (seeds the intake); hide at EDIT so admin saves never clobber it.
  isEditMode?: boolean;
}

export function BusinessBriefSection({ form, showHeader = true, isEditMode = false }: BusinessBriefSectionProps) {
  const { setValue, watch, formState: { errors } } = form;
  const businessBrief = useWatch({ control: form.control, name: "businessBrief" }) || "";

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
        {!isEditMode && (
          <div>
            <Label className="cursor-default">
              <span>Business Brief</span>
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
        )}
        {/**
          * **حقلُ نصّ النشرة سقط** (خالد ١٩ سبتمبر ٢٠٢٦: «الـCTA تبع النيوزليتر أخفيها
          * من الـupdate… نبغى نشيل النيوزليتر هذه كاملة»).
          *
          * وهو حقلٌ **بلا قارئ**: تلميحُه يقول «يظهر في صندوق الاشتراك على صفحات
          * المقالات»، ومقيسٌ حيّاً — صفرُ تطابقٍ لـ`newsletterCtaText` في `modonty/`
          * كلِّه. فكنّا نكتب نصّاً لا يراه أحد.
          *
          * والعمودُ باقٍ حتّى يُحذف مع النشرة كاملةً (بندٌ في ملفّ التاسك).
          */}
      </div>
    </div>
  );
}
