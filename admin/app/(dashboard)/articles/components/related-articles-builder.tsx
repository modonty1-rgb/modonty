'use client';

import { useEffect, useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { ArticleSelectionTable } from './article-selection-table';
import { getArticlesForSelection, ArticleSelectionItem } from '../actions/articles-actions';
import { useArticleForm } from './article-form-context';

export interface RelatedArticleItem {
  relatedId: string;
  relationshipType?: 'related' | 'similar' | 'recommended';
}

interface RelatedArticlesBuilderProps {
  relatedArticles: RelatedArticleItem[];
  onChange: (articles: RelatedArticleItem[]) => void;
  excludeArticleId?: string;
  maxArticles?: number;
}

export function RelatedArticlesBuilder({
  relatedArticles,
  onChange,
  excludeArticleId,
  maxArticles,
}: RelatedArticlesBuilderProps) {
  const { categories, tags, formData } = useArticleForm();
  const [availableArticles, setAvailableArticles] = useState<ArticleSelectionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState<string | undefined>(
    formData.categoryId || undefined
  );
  const [tagFilter, setTagFilter] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Sync category filter when article category changes
  useEffect(() => {
    if (formData.categoryId) {
      setCategoryFilter(formData.categoryId);
    }
  }, [formData.categoryId]);

  useEffect(() => {
    async function loadArticles() {
      try {
        setLoading(true);
        const articles = await getArticlesForSelection({
          excludeArticleId,
          categoryId: categoryFilter,
          tagIds: tagFilter.length > 0 ? tagFilter : undefined,
          search: searchQuery || undefined,
        });
        setAvailableArticles(articles);
      } catch (error) {
        console.error('Error loading articles:', error);
      } finally {
        setLoading(false);
      }
    }
    const timeoutId = setTimeout(loadArticles, 300);
    return () => clearTimeout(timeoutId);
  }, [excludeArticleId, categoryFilter, tagFilter, searchQuery]);

  const selectedArticleIds = relatedArticles.map((rel) => rel.relatedId);

  const handleSelectionChange = (articleIds: string[]) => {
    const existingMap = new Map(
      relatedArticles.map((rel) => [rel.relatedId, rel])
    );

    // Enforce max-articles limit when set
    const cappedIds =
      typeof maxArticles === 'number' && articleIds.length > maxArticles
        ? articleIds.slice(0, maxArticles)
        : articleIds;

    const updatedArticles = cappedIds.map((id) => {
      const existing = existingMap.get(id);
      if (existing) {
        return existing;
      }
      return {
        relatedId: id,
        relationshipType: 'related' as const,
      };
    });

    onChange(updatedArticles);
  };

  const handleRelationshipTypeChange = (relatedId: string, relationshipType: 'related' | 'similar' | 'recommended') => {
    onChange(
      relatedArticles.map((rel) =>
        rel.relatedId === relatedId ? { ...rel, relationshipType } : rel
      )
    );
  };

  const isFull = typeof maxArticles === 'number' && relatedArticles.length >= maxArticles;

  return (
    <div className="space-y-3">
      {isFull && (
        <div className="flex items-start gap-2 rounded-md border border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/20 p-2.5">
          <AlertCircle className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" />
          <p className="text-xs text-emerald-800 dark:text-emerald-200">
            وصلت للحدّ الأقصى ({maxArticles}). أزل واحدة لإضافة أخرى — هذا الحدّ مُوصى به لـ SEO.
          </p>
        </div>
      )}

      <ArticleSelectionTable
        articles={availableArticles}
        selectedArticleIds={selectedArticleIds}
        onSelectionChange={handleSelectionChange}
        categories={categories}
        tags={tags}
        loading={loading}
        onCategoryFilterChange={setCategoryFilter}
        onTagFilterChange={setTagFilter}
        onSearchChange={setSearchQuery}
        defaultCategoryId={formData.categoryId || undefined}
        defaultTagIds={[]}
        relatedArticles={relatedArticles}
        onRelationshipTypeChange={handleRelationshipTypeChange}
        maxArticles={maxArticles}
      />
    </div>
  );
}
