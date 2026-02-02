'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Loader2, Save, CheckCircle2, AlertCircle } from 'lucide-react';
import { useArticleForm } from './article-form-context';
import { useState, useEffect, useMemo } from 'react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { getSectionStatus } from '../helpers/section-status';

// Only count data-input sections for progress (basic, content, seo)
// Exclude optional/display sections: media, tags, seo-validation
const DATA_INPUT_SECTION_IDS = ['basic', 'content', 'seo'];

export function StickySaveButton() {
  const { save, isSaving, isDirty, mode, formData, errors, sections } = useArticleForm();
  const router = useRouter();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      const result = await save();

      if (result.success) {
        setSaved(true);
        toast({
          title: 'تم الحفظ بنجاح',
          description: 'تم حفظ المقال بنجاح وهو في انتظار معاينة المدير',
        });

        if (mode === 'new') {
          router.push('/articles');
          router.refresh();
        }
      } else {
        toast({
          title: 'فشل الحفظ',
          description: result.error || 'حدث خطأ أثناء حفظ المقال',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'فشل الحفظ',
        description: error instanceof Error ? error.message : 'حدث خطأ غير متوقع',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    if (saved) {
      const timer = setTimeout(() => setSaved(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [saved]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        if (!saving && !isSaving) {
          handleSave();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [saving, isSaving]); // eslint-disable-line react-hooks/exhaustive-deps

  const isDisabled = saving || isSaving;
  const showUnsavedIndicator = isDirty && !saving && !isSaving && !saved;

  const saveButtonLabel = (saving || isSaving)
    ? 'جاري الحفظ...'
    : saved
      ? 'تم الحفظ'
      : 'حفظ المقال';

  const sectionStatus = useMemo(() => {
    if (!sections || sections.length === 0) return [];
    return sections.map((section) => ({
      id: section.id,
      ...getSectionStatus(section.id, formData, errors),
    }));
  }, [formData, errors, sections]);

  const progressPercentage = useMemo(() => {
    if (!sectionStatus || sectionStatus.length === 0) return 0;
    const dataInputSections = sectionStatus.filter((s) =>
      DATA_INPUT_SECTION_IDS.includes(s.id)
    );
    if (dataInputSections.length === 0) return 0;
    const completedCount = dataInputSections.filter((s) => s.completed).length;
    return Math.round((completedCount / dataInputSections.length) * 100);
  }, [sectionStatus]);

  const hasErrors = sectionStatus.some((s) => s.hasErrors);

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-[100] h-[60px] border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-lg"
      role="region"
      aria-label="أدوات حفظ المقال"
    >
      <div className="container mx-auto max-w-6xl h-full px-4 md:px-6">
        <div className="grid grid-cols-3 gap-4 h-full items-center">
          {/* Column 1: Other (Status Badges) */}
          <div className="flex justify-start items-center gap-2" role="status" aria-live="polite" aria-atomic="true">
            {showUnsavedIndicator && (
              <Badge variant="outline" className="flex items-center gap-1.5">
                <AlertCircle className="h-3 w-3 text-amber-500" aria-hidden="true" />
                <span className="text-xs">غير محفوظة</span>
              </Badge>
            )}
            {saved && (
              <Badge variant="default" className="flex items-center gap-1.5 bg-green-600">
                <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
                <span className="text-xs">تم الحفظ</span>
              </Badge>
            )}
            {isSaving && (
              <Badge variant="outline" className="flex items-center gap-1.5">
                <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" />
                <span className="text-xs">جاري الحفظ...</span>
              </Badge>
            )}
          </div>

          {/* Column 2: Progress */}
          <div className="flex flex-col justify-center gap-1">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-medium">تقدم الإكمال</span>
              <span className="text-xs text-muted-foreground" aria-live="polite">
                {progressPercentage}%
              </span>
            </div>
            <Progress
              value={progressPercentage}
              className="h-1.5 w-full"
              aria-label={`${progressPercentage}% من النموذج مكتمل`}
            />
            {hasErrors && (
              <span className="text-[10px] text-destructive" role="alert">
                يوجد أخطاء
              </span>
            )}
          </div>

          {/* Column 3: CTA (Save Button) */}
          <div className="flex justify-end">
            <Button
              onClick={handleSave}
              disabled={isDisabled}
              size="lg"
              className={cn(
                "gap-2 min-w-[140px]",
                isDirty && "bg-primary"
              )}
              aria-label={saveButtonLabel}
            >
              {(saving || isSaving) ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  <span>جاري الحفظ...</span>
                </>
              ) : saved ? (
                <>
                  <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                  <span>تم الحفظ</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" aria-hidden="true" />
                  <span>حفظ</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
