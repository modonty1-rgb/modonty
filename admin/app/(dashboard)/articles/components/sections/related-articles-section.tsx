'use client';

import { useArticleForm } from '../article-form-context';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RelatedArticlesBuilder } from '../related-articles-builder';
import { Badge } from '@/components/ui/badge';

export function RelatedArticlesSection() {
  const { formData, updateField } = useArticleForm();

  return (
    <Card>
      <CardContent className="space-y-6 pt-6">
        <div>
          {formData.relatedArticles && formData.relatedArticles.length > 0 && (
            <div className="flex items-center justify-end mb-2">
              <Badge variant="secondary">{formData.relatedArticles.length} مقال</Badge>
            </div>
          )}
          <RelatedArticlesBuilder
            relatedArticles={formData.relatedArticles || []}
            onChange={(articles) => updateField('relatedArticles', articles)}
          />
        </div>
      </CardContent>
    </Card>
  );
}
