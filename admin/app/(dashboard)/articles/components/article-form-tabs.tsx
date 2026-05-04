"use client";

import { useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Check, AlertCircle, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useArticleForm } from "./article-form-context";
import {
  STEP_CONFIGS,
  getStepStatus,
  getMissingRequiredFields,
  getMissingOptionalFields,
} from "../helpers/step-validation-helpers";
import type { StepConfig, StepValidation } from "../helpers/step-validation-helpers";
import { analyzeArticleSEO } from "../analyzer";
import type { ArticleSEOScoreResult } from "../analyzer";
import { BasicStep } from "./steps/basic-step";
import { ContentStep } from "./steps/content-step";
import { MediaStep } from "./steps/media-step";
import { FAQsStep } from "./steps/faqs-step";
import { RelatedArticlesStep } from "./steps/related-articles-step";
import { SEOStep } from "./steps/seo-step";

const SEO_CATEGORY_LABELS: Record<string, string> = {
  metaTags: "العنوان والوصف",
  content: "المحتوى",
  images: "الصور",
  structuredData: "البيانات المهيكلة",
  technical: "الإعدادات التقنية",
  social: "التواصل الاجتماعي",
};

function getStepHint(
  step: StepConfig,
  validation: StepValidation,
  formData: ReturnType<typeof useArticleForm>["formData"],
): string {
  if (validation.completionPercentage === 100 && !validation.hasErrors)
    return "مكتمل ✓";
  const missingReq = getMissingRequiredFields(step.number, formData).map(
    (x) => x.label,
  );
  const missingOpt = getMissingOptionalFields(step.number, formData).map(
    (x) => x.label,
  );
  const parts: string[] = [];
  if (missingReq.length)
    parts.push(`مطلوب: ${missingReq.join("، ")}`);
  if (missingOpt.length)
    parts.push(`اختياري: ${missingOpt.join("، ")}`);
  if (validation.errors.length)
    parts.push(`تنبيه: ${validation.errors[0] ?? "راجع النموذج"}`);
  return parts.join(" · ") || "مكتمل ✓";
}

function getSeoStepHint(seo: ArticleSEOScoreResult | null): string {
  if (!seo || seo.percentage === 100) return "مكتمل ✓";
  const parts: string[] = [];
  const cats = seo.categories as Record<string, { items?: { passed: boolean; label: string; reason?: string }[] }>;
  for (const [key, cat] of Object.entries(cats)) {
    const label = SEO_CATEGORY_LABELS[key] ?? key;
    const failed = (cat?.items ?? []).filter((i) => !i.passed);
    for (const f of failed) {
      parts.push(`${label}: ${f.reason ?? f.label}`);
    }
  }
  return parts.length ? parts.join(" · ") : "مكتمل ✓";
}

export function ArticleFormTabs() {
  const { currentStep, goToStep, getStepValidation, formData } = useArticleForm();
  const seoScoreResult = useMemo(
    () => analyzeArticleSEO(formData),
    [formData],
  );

  const activeTabId = STEP_CONFIGS[currentStep - 1]?.id ?? "basic";

  const handleTabChange = (value: string) => {
    const step = STEP_CONFIGS.find((s) => s.id === value);
    if (step) goToStep(step.number);
  };

  return (
    <Tabs value={activeTabId} onValueChange={handleTabChange} className="w-full">
      <div className="sticky top-0 z-30 -mx-4 sm:-mx-6 px-4 sm:px-6 mb-6 bg-background/95 backdrop-blur-sm border-b">
        <TooltipProvider delayDuration={300}>
          <TabsList className="flex flex-row h-auto w-full bg-transparent p-0 gap-1 justify-start overflow-x-auto">
            {STEP_CONFIGS.map((step) => {
              const baseValidation = getStepValidation(step.number);
              const isSeoStep = step.id === "seo";
              const validation: StepValidation = isSeoStep
                ? (() => {
                    const cats = seoScoreResult?.categories ?? {};
                    const seoPassed = Object.values(cats).filter(
                      (c) => c.percentage >= 80,
                    ).length;
                    const total = 6;
                    return {
                      ...baseValidation,
                      completionPercentage: seoScoreResult?.percentage ?? 0,
                      completedFields: seoPassed,
                      totalFields: total,
                    };
                  })()
                : baseValidation;
              const status = getStepStatus(step.number, currentStep, validation);
              const isActive = status === "active";
              const hasError = status === "error";
              const baseWarning = status === "warning";
              const seoWarning =
                isSeoStep && (seoScoreResult?.percentage ?? 0) < 100;
              const metaTitleLen = (formData.seoTitle || "").length;
              const metaDescLen = (formData.seoDescription || "").length;
              const metaTagsWarning =
                isSeoStep &&
                (
                  (metaTitleLen > 0 && (metaTitleLen < 30 || metaTitleLen > 60)) ||
                  (metaDescLen > 0 && (metaDescLen < 120 || metaDescLen > 160))
                );
              const hasWarningIcon = baseWarning || seoWarning || metaTagsWarning;
              const isCompletedIcon = status === "completed" && !hasWarningIcon;
              const hint = isSeoStep
                ? getSeoStepHint(seoScoreResult ?? null)
                : getStepHint(step, validation, formData);

              return (
                <Tooltip key={step.id}>
                  <TooltipTrigger asChild>
                    <TabsTrigger
                      value={step.id}
                      className={cn(
                        "relative h-auto gap-2 rounded-none border-b-2 border-transparent bg-transparent px-3 py-2.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none whitespace-nowrap",
                        isActive && "border-primary text-foreground",
                      )}
                      aria-label={`${step.label}: ${validation.completionPercentage}% complete. ${hint}`}
                      aria-current={isActive ? "true" : undefined}
                    >
                      <span
                        className={cn(
                          "flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold transition-colors",
                          isActive && "bg-primary text-primary-foreground",
                          isCompletedIcon && "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
                          hasError && "bg-destructive/15 text-destructive",
                          hasWarningIcon && "bg-amber-500/15 text-amber-600 dark:text-amber-400",
                          !isActive && !isCompletedIcon && !hasError && !hasWarningIcon && "bg-muted text-muted-foreground",
                        )}
                      >
                        {isCompletedIcon ? (
                          <Check className="h-3 w-3 stroke-[2.5]" />
                        ) : hasError ? (
                          <AlertCircle className="h-3 w-3 stroke-[2.5]" />
                        ) : hasWarningIcon ? (
                          <AlertTriangle className="h-3 w-3 stroke-[2.5]" />
                        ) : (
                          step.number
                        )}
                      </span>
                      <span className="text-sm font-medium">{step.label}</span>
                      <span
                        className={cn(
                          "shrink-0 text-[11px] font-semibold tabular-nums",
                          validation.completionPercentage === 100
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-muted-foreground",
                        )}
                      >
                        {validation.completionPercentage}%
                      </span>
                    </TabsTrigger>
                  </TooltipTrigger>
                  <TooltipContent
                    side="bottom"
                    className="max-w-xs text-balance bg-amber-50 dark:bg-amber-950/80 border-amber-200 dark:border-amber-800"
                  >
                    {hint}
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </TabsList>
        </TooltipProvider>
      </div>

      {/* Step 1: Basic */}
      <TabsContent value="basic" className="space-y-6 mt-0">
        <BasicStep />
      </TabsContent>

      {/* Step 2: Content (Editor + AI Assistant) */}
      <TabsContent value="content" className="space-y-6 mt-0">
        <ContentStep />
      </TabsContent>

      {/* Step 3: Media (Cover + Audio + Gallery) */}
      <TabsContent value="media" className="space-y-6 mt-0">
        <MediaStep />
      </TabsContent>

      {/* Step 4: SEO — unified (Meta + Keywords + Citations + Score + Advanced) */}
      <TabsContent value="seo" className="space-y-6 mt-0">
        <SEOStep />
      </TabsContent>

      {/* Step 5: FAQs (FAQ Schema for Google rich results) */}
      <TabsContent value="faqs" className="space-y-6 mt-0">
        <FAQsStep />
      </TabsContent>

      {/* Step 6: Related Articles (internal linking) */}
      <TabsContent value="related" className="space-y-6 mt-0">
        <RelatedArticlesStep />
      </TabsContent>
    </Tabs>
  );
}
