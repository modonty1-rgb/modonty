'use client';

import { useArticleForm } from '../article-form-context';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RelatedArticlesBuilder } from '../related-articles-builder';
import { Link2 } from 'lucide-react';

function SectionHeader({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-2.5 pb-1">
      <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
        <Icon className="h-3.5 w-3.5" />
      </div>
      <div className="space-y-0.5">
        <p className="text-xs font-semibold text-foreground uppercase tracking-wider">{title}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

const MAX_RELATED = 5;

export function RelatedArticlesSection() {
  const { formData, updateField, articleId } = useArticleForm();
  const relatedArticles = formData.relatedArticles || [];
  const isFull = relatedArticles.length >= MAX_RELATED;

  return (
    <Card>
      <CardContent className="space-y-4 pt-6">
        <div className="flex items-start justify-between gap-4">
          <SectionHeader
            icon={Link2}
            title="مقالات ذات صلة"
            description="اقترح ٣–٥ مقالات لزيادة وقت القارئ على الموقع وتقوية الـ internal linking لـ SEO"
          />
          <Badge
            variant="outline"
            className={
              isFull
                ? 'font-mono text-xs shrink-0 border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                : 'font-mono text-xs shrink-0'
            }
          >
            {relatedArticles.length} / {MAX_RELATED}
            {isFull && ' · مكتمل'}
          </Badge>
        </div>

        <RelatedArticlesBuilder
          relatedArticles={relatedArticles}
          onChange={(next) => updateField('relatedArticles', next)}
          excludeArticleId={articleId}
          maxArticles={MAX_RELATED}
        />
      </CardContent>
    </Card>
  );
}
