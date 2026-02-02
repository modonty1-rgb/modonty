'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import type { Article, Client, Category, Author, ArticleFAQ, ArticleTag, Tag, Media } from '@prisma/client';

type ArticleWithRelations = Article & {
  client: Client;
  category: Category | null;
  author: Author;
  tags: Array<ArticleTag & { tag: Tag }>;
  faqs: ArticleFAQ[];
  featuredImage: Media | null;
};

interface ArticlePreviewSectionProps {
  article: ArticleWithRelations;
}

export function ArticlePreviewSection({ article }: ArticlePreviewSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Article Preview</CardTitle>
        <CardDescription>How your article will appear</CardDescription>
      </CardHeader>
      <CardContent>
        <article className="prose prose-sm dark:prose-invert max-w-none">
          <h1 className="text-2xl font-bold mb-4">{article.title || 'Untitled Article'}</h1>
          
          {article.excerpt && (
            <p className="text-lg text-muted-foreground mb-6 italic">{article.excerpt}</p>
          )}

          {article.content ? (
            <div
              className="article-content"
              dangerouslySetInnerHTML={{ __html: article.content }}
            />
          ) : (
            <p className="text-muted-foreground">No content yet</p>
          )}

          {article.tags && article.tags.length > 0 && (
            <div className="mt-6 pt-6 border-t">
              <p className="text-sm font-semibold mb-2">Tags:</p>
              <div className="flex flex-wrap gap-2">
                {article.tags.map((articleTag) => (
                  <span
                    key={articleTag.id}
                    className="px-2 py-1 text-xs rounded bg-muted text-muted-foreground"
                  >
                    {articleTag.tag.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {article.faqs && article.faqs.length > 0 && (
            <div className="mt-6 pt-6 border-t">
              <h2 className="text-xl font-semibold mb-4">Frequently Asked Questions</h2>
              <div className="space-y-4">
                {article.faqs.map((faq) => (
                  <div key={faq.id} className="space-y-2">
                    <h3 className="font-medium">{faq.question}</h3>
                    <p className="text-sm text-muted-foreground">{faq.answer}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </article>
      </CardContent>
    </Card>
  );
}