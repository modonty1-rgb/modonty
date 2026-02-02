'use client';

import { useState, useEffect } from 'react';
import type { Article, Client, Category, Author, ArticleFAQ, ArticleTag, Tag, Media, ArticleMedia } from '@prisma/client';
import type { FullPageValidationResult } from '@/lib/seo/types';
import { ArticlePreviewSection } from './article-preview-section';
import { MetaInformationSection } from './meta-information-section';
import { RelationsSection } from './relations-section';
import { ValidationResults } from './validation-results';
import { PreviewActionButtons } from './preview-action-buttons';
import { Loader2 } from 'lucide-react';

type ArticleWithRelations = Article & {
  client: Client;
  category: Category | null;
  author: Author;
  tags: Array<ArticleTag & { tag: Tag }>;
  faqs: ArticleFAQ[];
  featuredImage: Media | null;
  gallery: Array<ArticleMedia & { media: Media }>;
};

interface ArticlePreviewPageProps {
  article: ArticleWithRelations;
}

export function ArticlePreviewPage({ article }: ArticlePreviewPageProps) {
  const [validationResults, setValidationResults] = useState<FullPageValidationResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  useEffect(() => {
    const validateArticle = async () => {
      setIsValidating(true);
      try {
        const response = await fetch(`/api/articles/${article.id}/validate`, {
          method: 'POST',
        });
        
        if (response.ok) {
          const result: FullPageValidationResult = await response.json();
          setValidationResults(result);
        } else {
          console.error('Validation failed:', response.statusText);
        }
      } catch (error) {
        console.error('Error validating article:', error);
      } finally {
        setIsValidating(false);
      }
    };

    validateArticle();
  }, [article.id]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{article.title}</h1>
          <p className="text-muted-foreground mt-1">Preview and Review Article</p>
        </div>
      </div>

      <PreviewActionButtons article={article} />

      <div className="grid gap-6">
        <ArticlePreviewSection article={article} />
        <MetaInformationSection article={article} />
        <RelationsSection article={article} />
        
        {isValidating ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            <span className="ml-2 text-muted-foreground">Validating article...</span>
          </div>
        ) : validationResults ? (
          <ValidationResults validationResults={validationResults} />
        ) : null}
      </div>
    </div>
  );
}