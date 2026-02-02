'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Article, Client, Category, Author, ArticleFAQ, ArticleTag, Tag, Media } from '@prisma/client';

type ArticleWithRelations = Article & {
  client: Client;
  category: Category | null;
  author: Author;
  tags: Array<ArticleTag & { tag: Tag }>;
  faqs: ArticleFAQ[];
  featuredImage: Media | null;
};

interface RelationsSectionProps {
  article: ArticleWithRelations;
}

export function RelationsSection({ article }: RelationsSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Relations</CardTitle>
        <CardDescription>Article relationships and metadata</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="text-sm font-semibold mb-2">Client</h3>
          <div className="text-sm">
            {article.client ? (
              <div>
                <p className="font-medium">{article.client.name}</p>
                {article.client.slug && (
                  <p className="text-muted-foreground text-xs">/{article.client.slug}</p>
                )}
              </div>
            ) : (
              <p className="text-muted-foreground">Not set</p>
            )}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold mb-2">Category</h3>
          <div className="text-sm">
            {article.category ? (
              <div>
                <p className="font-medium">{article.category.name}</p>
                {article.category.slug && (
                  <p className="text-muted-foreground text-xs">/{article.category.slug}</p>
                )}
              </div>
            ) : (
              <p className="text-muted-foreground">Not set</p>
            )}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold mb-2">Author</h3>
          <div className="text-sm">
            {article.author ? (
              <p className="font-medium">{article.author.name}</p>
            ) : (
              <p className="text-muted-foreground">Not set</p>
            )}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold mb-2">Tags</h3>
          <div className="flex flex-wrap gap-2">
            {article.tags && article.tags.length > 0 ? (
              article.tags.map((articleTag) => (
                <Badge key={articleTag.id} variant="secondary">
                  {articleTag.tag.name}
                </Badge>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No tags</p>
            )}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold mb-2">Featured Image</h3>
          <div className="text-sm">
            {article.featuredImage ? (
              <div>
                <Badge variant="outline">{article.featuredImage.filename}</Badge>
                {article.featuredImage.url && (
                  <img
                    src={article.featuredImage.url}
                    alt={article.featuredImage.altText || article.title}
                    className="mt-2 rounded-lg max-w-xs"
                  />
                )}
              </div>
            ) : (
              <p className="text-muted-foreground">Not set</p>
            )}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold mb-2">FAQs</h3>
          <div className="space-y-3">
            {article.faqs && article.faqs.length > 0 ? (
              article.faqs.map((faq) => (
                <div key={faq.id} className="p-3 rounded-lg border bg-muted/50">
                  <p className="text-sm font-medium mb-1">{faq.question}</p>
                  <p className="text-xs text-muted-foreground">{faq.answer}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No FAQs</p>
            )}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold mb-2">Status</h3>
          <div className="text-sm">
            <Badge variant={article.status === 'PUBLISHED' ? 'default' : 'outline'}>
              {article.status}
            </Badge>
            {article.featured && (
              <Badge variant="secondary" className="ml-2">
                Featured
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}