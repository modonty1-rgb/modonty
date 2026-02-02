'use client';

import { useState } from 'react';
import { FlaskConical, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useArticleForm } from './article-form-context';
import { generateTestData } from '../helpers/generate-test-data';
import { getTestDataSources } from '../actions/articles-actions/queries/get-test-data-sources';
import { useToast } from '@/hooks/use-toast';

export function TestDataButton() {
  const { updateFields, clients, categories, authors, tags } = useArticleForm();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }
  
  const handleFillTestData = async () => {
    // Check if we have basic data available
    if (clients.length === 0 || categories.length === 0 || authors.length === 0) {
      toast({
        title: 'لا توجد بيانات كافية',
        description: 'يرجى التأكد من وجود عملاء وفئات وكُتّاب في قاعدة البيانات',
        variant: 'destructive',
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Fetch media and articles from database
      const sources = await getTestDataSources();
      
      if (!sources.success) {
        const errorMsg = 'error' in sources ? sources.error : 'فشل في جلب البيانات';
        throw new Error(errorMsg as string);
      }
      
      // Generate and fill test data - filter out media with null clientId
      const validMedia: Array<{ id: string; clientId: string; url: string; altText?: string | null }> = [];
      for (const m of sources.media || []) {
        if (m.clientId !== null && typeof m.clientId === 'string') {
          validMedia.push({
            id: m.id,
            clientId: m.clientId as string,
            url: m.url,
            altText: m.altText ?? null,
          });
        }
      }
      
      const testData = generateTestData({ 
        clients, 
        categories, 
        authors, 
        tags,
        media: validMedia,
        articles: sources.articles,
      });
      
      updateFields(testData);
      
      // Success toast with details
      const details: string[] = [];
      if (sources.media.length > 0) details.push(`${sources.media.length} صورة متاحة`);
      if (sources.articles.length > 0) details.push(`${sources.articles.length} مقال مرتبط`);
      
      // Show warning if no media or articles
      const warnings: string[] = [];
      if (sources.media.length === 0) warnings.push('لا توجد صور');
      if (sources.articles.length === 0) warnings.push('لا توجد مقالات مرتبطة');
      
      const description = warnings.length > 0 
        ? `تم ملء البيانات الأساسية • ${warnings.join(' • ')}`
        : `تم ملء جميع الحقول بنجاح${details.length > 0 ? ` • ` + details.join(' • ') : ''}`;
      
      toast({
        title: '✓ تم ملء البيانات التجريبية',
        description,
        variant: warnings.length > 0 ? 'default' : 'default',
      });
    } catch (error) {
      console.error('Error filling test data:', error);
      toast({
        title: 'خطأ',
        description: 'حدث خطأ أثناء ملء البيانات التجريبية',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={handleFillTestData}
      disabled={isLoading}
      className="gap-2 border-dashed border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-100 dark:hover:bg-amber-900"
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <FlaskConical className="h-4 w-4" />
      )}
      <span className="hidden sm:inline">{isLoading ? 'جاري التحميل...' : 'Fill Test Data'}</span>
      <span className="sm:hidden">{isLoading ? '...' : 'Test'}</span>
    </Button>
  );
}
