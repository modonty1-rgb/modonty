'use client';

import { useArticleForm } from './article-form-context';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Save, Loader2, FileText, Clock, Search, ChevronLeft, ClipboardCheck } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';
import { messages } from '@/lib/messages';
import { cn } from '@/lib/utils';

export function ArticleFormActionBar() {
  const {
    formData,
    save,
    isSaving,
    isDirty,
    mode,
    articleId,
    overallProgress,
    realSeoScore,
  } = useArticleForm();
  const { toast } = useToast();

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
            {/* Real SEO score — clickable, opens the full SEO guide (/technical). Same number as
                the tables and dashboard. Edit mode only — a new draft has nothing stored. */}
            {mode === 'edit' && articleId && (
              <a href={`/articles/${articleId}/technical`} title="افتح دليل السيو — وين الخلل وكيف تصلحه">
                <Badge
                  variant="outline"
                  className={cn(
                    'text-[10px] px-2 py-0 h-5 font-bold uppercase tracking-wider gap-1 cursor-pointer hover:opacity-90 transition-opacity',
                    realSeoScore >= 80 && 'bg-emerald-500 text-white border-transparent',
                    realSeoScore >= 60 && realSeoScore < 80 && 'bg-amber-500 text-white border-transparent',
                    realSeoScore < 60 && 'bg-destructive text-destructive-foreground border-transparent',
                  )}
                >
                  <Search className="h-3 w-3" />
                  SEO {realSeoScore}%
                  <ChevronLeft className="h-3 w-3 opacity-70" />
                </Badge>
              </a>
            )}
            <TooltipProvider delayDuration={200}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="flex items-center gap-1 text-muted-foreground tabular-nums cursor-default">
                    <ClipboardCheck className="h-3.5 w-3.5" />
                    {overallProgress}%
                  </span>
                </TooltipTrigger>
                <TooltipContent side="top">نسبة اكتمال تعبئة حقول النموذج</TooltipContent>
              </Tooltip>
            </TooltipProvider>
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
          </div>

          <div className="flex items-center gap-2">
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
