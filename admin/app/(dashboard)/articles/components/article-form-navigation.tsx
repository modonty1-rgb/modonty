'use client';

import { useArticleForm } from './article-form-context';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Save, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { messages } from '@/lib/messages';
import { cn } from '@/lib/utils';

export function ArticleFormNavigation() {
  const {
    currentStep,
    totalSteps,
    save,
    isSaving,
    isDirty,
    overallProgress,
    mode,
    seoScore,
    lastAutoSaved,
  } = useArticleForm();
  const { toast } = useToast();

  const handleSave = async () => {
    try {
      const result = await save();

      if (result.success) {
        const savedArticleId = result.article?.id;
        const articleTitle = result.article?.title;
        const articleStatus = result.article?.status;

        const detailsParts: string[] = [];
        if (savedArticleId) detailsParts.push(`ID: ${savedArticleId}`);
        if (articleTitle) detailsParts.push(`Title: "${articleTitle}"`);
        if (articleStatus) detailsParts.push(`Status: ${articleStatus}`);

        toast({
          title: messages.success.saved,
          description:
            detailsParts.length > 0
              ? `تم حفظ المقال بنجاح.\n${detailsParts.join(' — ')}`
              : 'تم حفظ المقال بنجاح وهو في انتظار معاينة المدير',
          variant: 'success',
        });

        // Use window.location for reliable redirect (router.push can race with beforeunload)
        if (mode === 'new') {
          window.location.href = '/articles';
        } else if (mode === 'edit' && savedArticleId) {
          window.location.href = `/articles/${savedArticleId}`;
        }
      } else {
        toast({
          title: messages.error.server_error,
          description: result.error || messages.descriptions.article_save_error,
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: messages.error.save_failed,
        description: error instanceof Error ? error.message : messages.descriptions.unexpected_error,
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b shadow-sm">
        <div className="max-w-[1200px] mx-auto px-4 py-2">
          <div className="space-y-2">
            <div className="grid grid-cols-[1fr_auto] items-center gap-4">
              <div className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground font-medium">
                  Step {currentStep} of {totalSteps}
                </span>
                <Badge
                  variant={seoScore >= 80 ? "default" : seoScore >= 60 ? "secondary" : "destructive"}
                  className={cn(
                    "text-[10px] px-2 py-0 h-4 font-bold uppercase tracking-wider transition-colors",
                    seoScore >= 80 && "bg-emerald-500 hover:bg-emerald-600",
                    seoScore >= 60 && "bg-amber-500 hover:bg-amber-600 text-white",
                  )}
                >
                  SEO Health: {seoScore}%
                </Badge>
                <div className="flex items-center gap-1">
                  <div
                    className={cn(
                      "h-1.5 w-1.5 rounded-full animate-pulse",
                      seoScore >= 80 ? "bg-emerald-500" : seoScore >= 60 ? "bg-amber-500" : "bg-red-500",
                    )}
                  />
                  <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-tighter">
                    Live Analysis
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 justify-end">
                <div className="hidden md:flex flex-col items-end gap-0.5">
                  <span className="text-xs font-medium text-muted-foreground">
                    {overallProgress}% Complete
                  </span>
                  {lastAutoSaved && !isDirty && (
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400">
                      Auto-saved {lastAutoSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSave}
                    disabled={isSaving}
                    className="h-9 px-4 gap-2 transition-all hover:scale-105"
                  >
                    {isSaving ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    <span>{mode === 'edit' ? 'Update' : 'Save Draft'}</span>
                  </Button>
                </div>
              </div>
            </div>

            <div className="w-full">
              <Progress
                value={overallProgress}
                className="h-1 transition-all duration-300"
                aria-label={`Overall progress: ${overallProgress}%`}
              />
            </div>
          </div>
        </div>
      </div>
  );
}
