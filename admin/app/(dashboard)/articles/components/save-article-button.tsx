'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Loader2, Save } from 'lucide-react';
import { useArticleForm } from './article-form-context';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

export function SaveArticleButton() {
  const { save, isSaving, isDirty, mode } = useArticleForm();
  const router = useRouter();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const result = await save();

      if (result.success) {
        const articleId = result.article?.id;
        const articleTitle = result.article?.title;
        const articleStatus = result.article?.status;

        const detailsParts: string[] = [];
        if (articleId) detailsParts.push(`المعرّف: ${articleId}`);
        if (articleTitle) detailsParts.push(`العنوان: "${articleTitle}"`);
        if (articleStatus) detailsParts.push(`الحالة: ${articleStatus}`);

        toast({
          title: 'تم الحفظ بنجاح',
          description:
            detailsParts.length > 0
              ? `تم حفظ المقال بنجاح.\n${detailsParts.join(' — ')}`
              : 'تم حفظ المقال بنجاح وهو في انتظار معاينة المدير',
        });

        // For new articles, redirect to articles list or stay on page
        // The article is saved with WRITING status
        if (mode === 'new') {
          // Redirect to articles list after successful save
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

  const isDisabled = saving || isSaving;

  return (
    <Button
      onClick={handleSave}
      disabled={isDisabled}
      size="default"
      className="gap-2"
    >
      {(saving || isSaving) ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>جاري الحفظ...</span>
        </>
      ) : (
        <>
          <Save className="h-4 w-4" />
          <span>حفظ</span>
        </>
      )}
    </Button>
  );
}