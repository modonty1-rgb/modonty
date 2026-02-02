'use client';

import { useEffect, useState } from 'react';
import { Label } from '@/components/ui/label';
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
}

export function RelatedArticlesBuilder({
  relatedArticles,
  onChange,
  excludeArticleId,
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

    const updatedArticles = articleIds.map((id) => {
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

  return (
    <div className="space-y-6">
      <div>
        <Label className="text-base font-semibold mb-4 block">اختيار المقالات ذات الصلة</Label>
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
        />
      </div>

      {relatedArticles.length === 0 && !loading && (
        <div className="text-center py-12 text-muted-foreground">
          <p className="text-sm font-medium mb-1">لا توجد مقالات محددة</p>
          <p className="text-xs">استخدم الجدول أعلاه لاختيار المقالات ذات الصلة</p>
        </div>
      )}
    </div>
  );
}
