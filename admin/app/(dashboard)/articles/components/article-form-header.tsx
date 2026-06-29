'use client';

import { useState, useEffect } from 'react';
import { TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { TechnicalSEOGuidance } from './sections/technical-seo-guidance';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Check,
  AlertCircle,
  AlertTriangle,
  Eye,
  Save,
  Loader2,
  FileText,
  CheckCircle2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useArticleForm } from './article-form-context';
import {
  STEP_CONFIGS,
  getStepStatus,
  getMissingRequiredFields,
  getMissingOptionalFields,
} from '../helpers/step-validation-helpers';
import type { StepConfig, StepValidation } from '../helpers/step-validation-helpers';
import { useToast } from '@/hooks/use-toast';
import { messages } from '@/lib/messages';

// ── Helpers ────────────────────────────────────────────────────────────────

function formatTimeAgo(date: Date | null): string {
  if (!date) return '';
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 10) return 'الآن';
  if (seconds < 60) return `قبل ${seconds} ث`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `قبل ${minutes} د`;
  return `قبل ${Math.floor(minutes / 60)} س`;
}

function getStepHint(
  step: StepConfig,
  validation: StepValidation,
  formData: ReturnType<typeof useArticleForm>['formData'],
): string {
  if (validation.completionPercentage === 100 && !validation.hasErrors) return 'مكتمل ✓';
  const missingReq = getMissingRequiredFields(step.number, formData).map((x) => x.label);
  const missingOpt = getMissingOptionalFields(step.number, formData).map((x) => x.label);
  const parts: string[] = [];
  if (missingReq.length) parts.push(`مطلوب: ${missingReq.join('، ')}`);
  if (missingOpt.length) parts.push(`اختياري: ${missingOpt.join('، ')}`);
  if (validation.errors.length) parts.push(`تنبيه: ${validation.errors[0] ?? 'راجع النموذج'}`);
  return parts.join(' · ') || 'مكتمل ✓';
}

// ── Component ──────────────────────────────────────────────────────────────

export function ArticleFormHeader() {
  const {
    currentStep,
    getStepValidation,
    formData,
    save,
    isSaving,
    isDirty,
    lastAutoSaved,
    mode,
    articleId,
    overallProgress,
    seoScore,
  } = useArticleForm();

  const { toast } = useToast();
  const [, setTick] = useState(0);

  // Re-render every 15 s so the "saved X min ago" label stays fresh
  useEffect(() => {
    if (!lastAutoSaved) return;
    const id = setInterval(() => setTick((t) => t + 1), 15_000);
    return () => clearInterval(id);
  }, [lastAutoSaved]);

  // Save status indicator
  const saveStatus = isSaving
    ? {
        icon: <Loader2 className="h-3.5 w-3.5 animate-spin" />,
        text: 'جارٍ الحفظ…',
        tone: 'text-amber-600 dark:text-amber-400',
      }
    : isDirty
      ? {
          icon: <AlertCircle className="h-3.5 w-3.5" />,
          text: 'غير محفوظ',
          tone: 'text-amber-600 dark:text-amber-400',
        }
      : lastAutoSaved
        ? {
            icon: <CheckCircle2 className="h-3.5 w-3.5" />,
            text: `محفوظ ${formatTimeAgo(lastAutoSaved)}`,
            tone: 'text-emerald-600 dark:text-emerald-400',
          }
        : {
            icon: <FileText className="h-3.5 w-3.5" />,
            text: 'مسودة جديدة',
            tone: 'text-muted-foreground',
          };

  const handleSave = async () => {
    try {
      const result = await save();
      if (result.success) {
        const savedId = result.article?.id;
        toast({ title: messages.success.saved, description: 'تم حفظ المقال بنجاح', variant: 'success' });
        if (mode === 'new') {
          window.location.href = '/articles';
        } else if (mode === 'edit' && savedId) {
          window.location.href = `/articles/${savedId}`;
        }
      } else {
        toast({
          title: result.error ? messages.error.cannot_publish : messages.error.save_failed,
          description: result.error || messages.descriptions.article_save_error,
          variant: 'destructive',
        });
      }
    } catch {
      toast({
        title: messages.error.save_failed,
        description: messages.descriptions.unexpected_error,
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="shrink-0 border-b bg-background/95 backdrop-blur-sm z-30">
      <TooltipProvider delayDuration={300}>
        {/* ── Single unified row: tabs + actions ── */}
        <div className="flex items-center h-[52px] px-4 gap-1">

          {/* Tab navigation — takes all available space, scrolls on small screens */}
          <TabsList className="flex-1 flex flex-row h-[52px] w-auto bg-transparent p-0 gap-0 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {STEP_CONFIGS.map((step) => {
              const validation: StepValidation = getStepValidation(step.number);

              const status = getStepStatus(step.number, currentStep, validation);
              const isActive = status === 'active';
              const hasError = status === 'error';
              const baseWarning = status === 'warning';
              const metaTitleLen = (formData.seoTitle || '').length;
              const metaDescLen = (formData.seoDescription || '').length;
              // Show warning icon on Basic tab if meta title/desc lengths are out of optimal range
              const metaTagsWarning =
                step.id === 'basic' &&
                ((metaTitleLen > 0 && (metaTitleLen < 30 || metaTitleLen > 60)) ||
                  (metaDescLen > 0 && (metaDescLen < 120 || metaDescLen > 160)));
              const hasWarningIcon = baseWarning || metaTagsWarning;
              const isCompletedIcon = status === 'completed' && !hasWarningIcon;
              const hint = getStepHint(step, validation, formData);

              return (
                <Tooltip key={step.id}>
                  <TooltipTrigger asChild>
                    <TabsTrigger
                      value={step.id}
                      className={cn(
                        'relative h-[52px] gap-2 rounded-none border-b-2 border-transparent bg-transparent px-3 shrink-0',
                        'data-[state=active]:bg-transparent data-[state=active]:shadow-none whitespace-nowrap',
                        isActive && 'border-primary text-foreground',
                      )}
                      aria-label={`${step.label}: ${validation.completionPercentage}% complete. ${hint}`}
                      aria-current={isActive ? 'true' : undefined}
                    >
                      <span
                        className={cn(
                          'flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold transition-colors',
                          isActive && 'bg-primary text-primary-foreground',
                          isCompletedIcon && 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
                          hasError && 'bg-destructive/15 text-destructive',
                          hasWarningIcon && 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
                          !isActive && !isCompletedIcon && !hasError && !hasWarningIcon &&
                            'bg-muted text-muted-foreground',
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
                          'shrink-0 text-[11px] font-semibold tabular-nums',
                          validation.completionPercentage === 100
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-muted-foreground',
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

          {/* Divider */}
          <div className="w-px h-5 bg-border shrink-0 mx-1" aria-hidden="true" />

          {/* ── Action zone ── */}
          <div className="flex items-center gap-2 shrink-0">

            {/* Status + completion % (hidden on small screens) */}
            <div className="hidden md:flex items-center gap-2 text-xs">
              <span className="tabular-nums font-semibold text-muted-foreground">
                {overallProgress}%
              </span>
              <span className={cn('flex items-center gap-1', saveStatus.tone)}>
                {saveStatus.icon}
                <span className="hidden lg:inline">{saveStatus.text}</span>
              </span>
            </div>

            {/* SEO badge — click to open Technical SEO Guidance */}
            <Popover>
              <PopoverTrigger asChild>
                <Badge
                  variant="outline"
                  role="button"
                  className={cn(
                    'text-[10px] px-2 h-5 font-bold shrink-0 hidden md:flex cursor-pointer',
                    'hover:opacity-80 transition-opacity',
                    seoScore >= 80 &&
                      'bg-emerald-500/10 text-emerald-700 border-emerald-200 dark:text-emerald-400',
                    seoScore >= 60 &&
                      seoScore < 80 &&
                      'bg-amber-500/10 text-amber-700 border-amber-200 dark:text-amber-400',
                    seoScore < 60 &&
                      'bg-destructive/10 text-destructive border-destructive/20',
                  )}
                >
                  SEO {seoScore}%
                </Badge>
              </PopoverTrigger>
              <PopoverContent
                side="bottom"
                align="end"
                className="w-[420px] max-h-[70vh] overflow-y-auto p-4"
              >
                <TechnicalSEOGuidance />
              </PopoverContent>
            </Popover>

            {/* Preview */}
            <Tooltip>
              <TooltipTrigger asChild>
                <span>
                  <Button
                    variant="outline"
                    size="sm"
                    asChild={!!articleId && !isDirty}
                    disabled={!articleId || isDirty}
                    className="h-8 px-3 gap-1.5"
                  >
                    {articleId && !isDirty ? (
                      <a
                        href={`/articles/${articleId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">معاينة</span>
                      </a>
                    ) : (
                      <>
                        <Eye className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">معاينة</span>
                      </>
                    )}
                  </Button>
                </span>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                {!articleId
                  ? 'احفظ المقال أولاً لمعاينته'
                  : isDirty
                    ? 'احفظ التغييرات أولاً'
                    : 'فتح المعاينة'}
              </TooltipContent>
            </Tooltip>

            {/* Save / Update */}
            <Button
              size="sm"
              onClick={handleSave}
              disabled={isSaving || !isDirty}
              className="h-8 px-4 gap-1.5"
            >
              {isSaving ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Save className="h-3.5 w-3.5" />
              )}
              <span>{mode === 'edit' ? 'تحديث' : 'حفظ'}</span>
            </Button>

          </div>
        </div>
      </TooltipProvider>

      {/* ── Overall progress strip (2 px) ── */}
      <Progress
        value={overallProgress}
        className="h-0.5 rounded-none"
        aria-hidden="true"
      />
    </div>
  );
}
