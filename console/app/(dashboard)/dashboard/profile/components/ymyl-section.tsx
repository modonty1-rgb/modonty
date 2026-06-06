"use client";

/**
 * YMYL Verification — CLIENT-side (console).
 *
 * Rendering rules:
 *  - If client.isYmyl === false: render nothing (admin hasn't activated YMYL for this client).
 *  - If client.isYmyl === true + ymylCategory set: render the dynamic field grid built from
 *    YMYL_CATEGORIES[ymylCategory].fields. Client edits + saves their own verification data.
 *
 * The category is admin-controlled (read-only display only). The client owns the data values.
 */

import { useMemo, useState, useTransition } from "react";
import { ShieldCheck, AlertTriangle, Loader2, CheckCircle2 } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

import { YMYL_CATEGORIES, type YmylCategory } from "@/lib/seo/ymyl-config";
import { getAuthorityOptions, validateYmylData } from "@/lib/seo/ymyl-helpers";

import { updateYmylData } from "../actions/profile-actions";
import { CloudinaryLicenseUpload } from "./cloudinary-license-upload";

interface YmylSectionProps {
  isYmyl: boolean;
  ymylCategory: string | null;
  ymylData: Record<string, unknown> | null;
  country: string | null;
}

export function YmylSection({ isYmyl, ymylCategory, ymylData: initialData, country }: YmylSectionProps) {
  const [data, setData] = useState<Record<string, unknown>>(initialData ?? {});
  const [pending, startTransition] = useTransition();
  const [savedAt, setSavedAt] = useState<Date | null>(null);

  const config = useMemo(() => {
    if (!ymylCategory || !(ymylCategory in YMYL_CATEGORIES)) return null;
    return YMYL_CATEGORIES[ymylCategory as YmylCategory];
  }, [ymylCategory]);

  // Don't render at all when YMYL is not enabled for this client.
  if (!isYmyl || !config) return null;

  const validation = validateYmylData(ymylCategory, data, { country });
  const requiredFields = config.fields.filter((f) => f.required);
  const filledCount = requiredFields.filter((f) => {
    const v = data[f.key];
    return v !== undefined && v !== null && v !== "";
  }).length;

  const updateField = (key: string, value: unknown) => {
    setData((prev) => ({ ...prev, [key]: value }));
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = Object.fromEntries(
      Object.entries(data).filter(([, v]) => v !== "" && v !== null && v !== undefined)
    );
    startTransition(async () => {
      const result = await updateYmylData(cleaned);
      if (result.success) {
        setSavedAt(new Date());
        toast.success("تم حفظ بيانات التوثيق بنجاح");
      } else {
        toast.error(result.error ?? "فشل الحفظ");
      }
    });
  };

  const isComplete = filledCount === requiredFields.length;

  return (
    <Card>
      <form onSubmit={onSubmit}>
        {/* Section header — matches the visual style of other profile sections */}
        <div className="flex items-start gap-3 px-6 pt-6 pb-3 border-b">
          <div
            className={`flex-shrink-0 w-10 h-10 rounded-xl grid place-items-center ${
              isComplete ? "bg-emerald-100 text-emerald-700" : "bg-primary/10 text-primary"
            }`}
          >
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold">بيانات التوثيق المهني</h3>
              {isComplete && <CheckCircle2 className="h-4 w-4 text-emerald-600" aria-label="مكتمل" />}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {config.label.ar} — {config.description.ar}
            </p>
          </div>
          <span
            className={`flex-shrink-0 text-xs px-2 py-1 rounded-full font-medium ${
              isComplete
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                : "bg-amber-50 text-amber-700 border border-amber-200"
            }`}
          >
            {filledCount}/{requiredFields.length}
          </span>
        </div>

        <div className="p-6 space-y-5">
          {/* Why this matters explanation */}
          <div className="rounded-lg border bg-muted/30 p-3 text-xs text-muted-foreground leading-relaxed">
            هذه البيانات تظهر لـ Google كإثبات على مصداقيتك المهنية (E-E-A-T). كل ما كانت كاملة، كل ما زادت ثقة Google
            في محتواك وارتفع ترتيبك في نتائج البحث.
          </div>

          {/* Country warning */}
          {!country && (
            <div className="flex items-start gap-2 text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-md p-2.5">
              <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>
                حدّد دولتك في قسم العنوان أولاً — قائمة الجهات المُرخِّصة تتغيّر حسب الدولة (السعودية / مصر /
                الإمارات).
              </span>
            </div>
          )}

          {/* Dynamic field grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {config.fields.map((field) => {
              const value = data[field.key];
              const error = validation.errors[field.key];

              if (field.type === "text") {
                return (
                  <div key={field.key} className="space-y-1.5">
                    <Label className="text-sm font-medium">
                      {field.label.ar}
                      {field.required && <span className="text-destructive ms-1">*</span>}
                    </Label>
                    <Input
                      value={typeof value === "string" ? value : ""}
                      onChange={(e) => updateField(field.key, e.target.value)}
                      placeholder={field.helpText?.ar ?? field.label.en}
                      aria-invalid={Boolean(error)}
                    />
                    {field.helpText && (
                      <p className="text-[11px] text-muted-foreground">{field.helpText.ar}</p>
                    )}
                    {error && <p className="text-[11px] text-destructive">{error}</p>}
                  </div>
                );
              }

              if (field.type === "dropdown") {
                const options = getAuthorityOptions(ymylCategory, country, field.key);
                return (
                  <div key={field.key} className="space-y-1.5">
                    <Label className="text-sm font-medium">
                      {field.label.ar}
                      {field.required && <span className="text-destructive ms-1">*</span>}
                    </Label>
                    <Select
                      value={typeof value === "string" ? value : undefined}
                      onValueChange={(v) => updateField(field.key, v)}
                      disabled={options.length === 0}
                    >
                      <SelectTrigger>
                        <SelectValue
                          placeholder={
                            options.length === 0
                              ? "حدّد الدولة في قسم العنوان أولاً"
                              : `اختر ${field.label.ar}`
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {options.map((opt) => (
                          <SelectItem key={opt} value={opt}>
                            {opt}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {field.helpText && (
                      <p className="text-[11px] text-muted-foreground">{field.helpText.ar}</p>
                    )}
                    {error && <p className="text-[11px] text-destructive">{error}</p>}
                  </div>
                );
              }

              if (field.type === "specialty") {
                return (
                  <div key={field.key} className="space-y-1.5 md:col-span-2">
                    <Label className="text-sm font-medium">
                      {field.label.ar}
                      {field.required && <span className="text-destructive ms-1">*</span>}
                    </Label>
                    <Select
                      value={typeof value === "string" ? value : undefined}
                      onValueChange={(v) => updateField(field.key, v)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={`اختر ${field.label.ar}`} />
                      </SelectTrigger>
                      <SelectContent>
                        {(field.specialties ?? []).map((sp) => (
                          <SelectItem key={sp.value} value={sp.value}>
                            {sp.label.ar}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {field.helpText && (
                      <p className="text-[11px] text-muted-foreground">{field.helpText.ar}</p>
                    )}
                    {error && <p className="text-[11px] text-destructive">{error}</p>}
                  </div>
                );
              }

              if (field.type === "image") {
                return (
                  <div key={field.key} className="space-y-1.5 md:col-span-2">
                    <Label className="text-sm font-medium">
                      {field.label.ar}
                      {field.required && <span className="text-destructive ms-1">*</span>}
                    </Label>
                    <CloudinaryLicenseUpload
                      value={typeof value === "string" ? value : ""}
                      onChange={(url) => updateField(field.key, url)}
                    />
                    {field.helpText && (
                      <p className="text-[11px] text-muted-foreground">{field.helpText.ar}</p>
                    )}
                    {error && <p className="text-[11px] text-destructive">{error}</p>}
                  </div>
                );
              }

              return null;
            })}
          </div>

          {/* Sticky save bar */}
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="text-xs text-muted-foreground">
              {savedAt
                ? `آخر حفظ: ${savedAt.toLocaleTimeString("ar-SA")}`
                : isComplete
                  ? "كل الحقول مكتملة"
                  : `متبقي ${requiredFields.length - filledCount} حقل`}
            </div>
            <Button type="submit" disabled={pending}>
              {pending ? (
                <>
                  <Loader2 className="h-4 w-4 ms-2 animate-spin" />
                  جاري الحفظ...
                </>
              ) : (
                "حفظ بيانات التوثيق"
              )}
            </Button>
          </div>
        </div>
      </form>
    </Card>
  );
}
