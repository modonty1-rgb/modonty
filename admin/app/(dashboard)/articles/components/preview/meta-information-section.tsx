'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Article } from '@prisma/client';

interface MetaInformationSectionProps {
  article: Article;
}

export function MetaInformationSection({ article }: MetaInformationSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Meta Information</CardTitle>
        <CardDescription>SEO metadata and social media tags</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="text-sm font-semibold mb-2">Basic SEO</h3>
          <div className="space-y-2 text-sm">
            <div>
              <span className="text-muted-foreground">SEO Title:</span>
              <p className="font-medium">{article.seoTitle || article.title || 'Not set'}</p>
            </div>
            <div>
              <span className="text-muted-foreground">SEO Description:</span>
              <p className="font-medium">{article.seoDescription || article.excerpt || 'Not set'}</p>
              {article.seoDescription && (
                <p className="text-xs text-muted-foreground mt-1">
                  {article.seoDescription.length} characters (optimal: 155-160)
                </p>
              )}
            </div>
            <div>
              <span className="text-muted-foreground">Meta Robots:</span>
              <Badge variant="outline" className="ml-2">
                index, follow
              </Badge>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold mb-2">Open Graph</h3>
          <div className="space-y-2 text-sm">
            <div>
              <span className="text-muted-foreground">OG Title:</span>
              <p className="font-medium">{article.seoTitle || article.title || 'Not set'}</p>
            </div>
            <div>
              <span className="text-muted-foreground">OG Description:</span>
              <p className="font-medium">{article.seoDescription || article.excerpt || 'Not set'}</p>
            </div>
            <div>
              <span className="text-muted-foreground">OG URL:</span>
              <p className="font-medium">{article.canonicalUrl || article.mainEntityOfPage || 'Not set'}</p>
            </div>
            <div>
              <span className="text-muted-foreground">OG Site Name:</span>
              <p className="font-medium">{article.clientId ? 'Client site' : 'Not set'}</p>
            </div>
            <div>
              <span className="text-muted-foreground">OG Locale:</span>
              <Badge variant="outline" className="ml-2">
                ar_SA
              </Badge>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold mb-2">Twitter Card</h3>
          <div className="space-y-2 text-sm">
            <div>
              <span className="text-muted-foreground">Twitter Card Type:</span>
              <Badge variant="outline" className="ml-2">
                summary_large_image
              </Badge>
            </div>
            <div>
              <span className="text-muted-foreground">Twitter Title:</span>
              <p className="font-medium">{article.seoTitle || article.title || 'Not set'}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Twitter Description:</span>
              <p className="font-medium">{article.seoDescription || article.excerpt || 'Not set'}</p>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold mb-2">Technical SEO</h3>
          <div className="space-y-2 text-sm">
            <div>
              <span className="text-muted-foreground">Canonical URL:</span>
              <p className="font-medium">{article.mainEntityOfPage || 'Not set'}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Sitemap Priority:</span>
              <Badge variant="outline" className="ml-2">
                0.5
              </Badge>
            </div>
            <div>
              <span className="text-muted-foreground">Change Frequency:</span>
              <Badge variant="outline" className="ml-2">
                weekly
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}