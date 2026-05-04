'use client';

import { useArticleForm } from './article-form-context';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Save, Loader2, FileText, Clock, CheckCircle2, AlertCircle, Eye } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';
import { messages } from '@/lib/messages';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';

function formatTimeAgo(date: Date | null): string {
  if (!date) return '';
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 10) return 'الآن';
  if (seconds < 60) return `قبل ${seconds} ث`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `قبل ${minutes} د`;
  const hours = Math.floor(minutes / 60);
  return `قبل ${hours} س`;
}

export function ArticleFormActionBar() {
  const {
    formData,
    save,
    isSaving,
    isDirty,
    lastAutoSaved,
    mode,
    articleId,
    overallProgress,
    seoScore,
    goToStep,
  } = useArticleForm();
  const { toast } = useToast();
  const [, setTick] = useState(0);

  useEffect(() => {
    if (!lastAutoSaved) return;
    const interval = setInterval(() => setTick((t) => t + 1), 15000);
    return () => clearInterval(interval);
  }, [lastAutoSaved]);

  const wordCount = (() => {
    const html = formData.content || '';
    const text = html.replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ');
    const words = text.trim().split(/\s+/).filter(Boolean);
    return words.length;
  })();

  const readingMinutes = Math.max(1, Math.ceil(wordCount / 200));

  const handleSave = async () => {
    try {
      const result = await save();
      if (result.success) {
        const savedArticleId = result.article?.id;
        toast({
          title: messages.success.saved,
          description: 'تم حفظ المقال بنجاح',
          variant: 'success',
        });
        if (mode === 'new') {
          window.location.href = '/articles';
        } else if (mode === 'edit' && savedArticleId) {
          window.location.href = `/articles/${savedArticleId}`;
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

  let saveStatus: { icon: React.ReactNode; text: string; tone: string };
  if (isSaving) {
    saveStatus = {
      icon: <Loader2 className="h-3.5 w-3.5 animate-spin" />,
      text: 'جارٍ الحفظ…',
      tone: 'text-amber-600 dark:text-amber-400',
    };
  } else if (isDirty) {
    saveStatus = {
      icon: <AlertCircle className="h-3.5 w-3.5" />,
      text: 'تغييرات غير محفوظة',
      tone: 'text-amber-600 dark:text-amber-400',
    };
  } else if (lastAutoSaved) {
    saveStatus = {
      icon: <CheckCircle2 className="h-3.5 w-3.5" />,
      text: `محفوظ ${formatTimeAgo(lastAutoSaved)}`,
      tone: 'text-emerald-600 dark:text-emerald-400',
    };
  } else {
    saveStatus = {
      icon: <FileText className="h-3.5 w-3.5" />,
      text: 'مسودة جديدة',
      tone: 'text-muted-foreground',
    };
  }

  return (
    <div className="sticky bottom-0 z-40 bg-background/95 backdrop-blur-sm border-t shadow-[0_-2px_8px_rgba(0,0,0,0.04)]">
      <Progress
        value={overallProgress}
        className="h-1 rounded-none transition-all duration-300"
        aria-label={`Overall progress: ${overallProgress}%`}
      />
      <div className="container mx-auto max-w-6xl px-4 md:px-6 py-2.5">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3 text-xs flex-wrap">
            <button
              type="button"
              onClick={() => goToStep(3)}
              aria-label="Jump to SEO tab"
              className="inline-flex"
            >
              <Badge
                variant={seoScore >= 80 ? 'default' : seoScore >= 60 ? 'secondary' : 'destructive'}
                className={cn(
                  'text-[10px] px-2 py-0 h-5 font-bold uppercase tracking-wider transition-colors cursor-pointer',
                  seoScore >= 80 && 'bg-emerald-500 hover:bg-emerald-600',
                  seoScore >= 60 && seoScore < 80 && 'bg-amber-500 hover:bg-amber-600 text-white',
                )}
              >
                SEO {seoScore}%
              </Badge>
            </button>
            <span className="text-muted-foreground tabular-nums">
              {overallProgress}% Complete
            </span>
            <span className="text-muted-foreground/40">·</span>
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <FileText className="h-3.5 w-3.5" />
              <span className="font-medium tabular-nums">{wordCount}</span>
              <span>كلمة</span>
            </span>
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              <span>~{readingMinutes} د قراءة</span>
            </span>
            <span className={cn('flex items-center gap-1.5 font-medium', saveStatus.tone)}>
              {saveStatus.icon}
              <span>{saveStatus.text}</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <TooltipProvider delayDuration={200}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span>
                    <Button
                      variant="outline"
                      size="sm"
                      asChild={!!articleId && !isDirty}
                      disabled={!articleId || isDirty}
                      className="h-9 px-4 gap-2"
                    >
                      {articleId && !isDirty ? (
                        <a
                          href={`/articles/${articleId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Eye className="h-4 w-4" />
                          <span>معاينة</span>
                        </a>
                      ) : (
                        <span className="inline-flex items-center gap-2">
                          <Eye className="h-4 w-4" />
                          <span>معاينة</span>
                        </span>
                      )}
                    </Button>
                  </span>
                </TooltipTrigger>
                <TooltipContent side="top">
                  {!articleId
                    ? 'احفظ المقال أولاً لمعاينته'
                    : isDirty
                    ? 'احفظ التغييرات أولاً ليتم تطبيقها في المعاينة'
                    : 'افتح صفحة معاينة المقال'}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <Button
              variant="default"
              size="sm"
              onClick={handleSave}
              disabled={isSaving || !isDirty}
              className="h-9 px-5 gap-2"
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              <span>{mode === 'edit' ? 'تحديث' : 'حفظ كمسودة'}</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
