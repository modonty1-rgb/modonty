'use client';

import { useArticleForm } from '../article-form-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Info, Globe, ImageIcon } from 'lucide-react';
import { useMemo, useState, useEffect } from 'react';
import { getMediaById } from '@/app/(dashboard)/media/actions/get-media-by-id';

interface FeaturedMedia {
  url: string;
  altText: string | null;
}

export function SEOSection() {
  const { formData, clients, categories, authors, tags } = useArticleForm();
  const [featuredMedia, setFeaturedMedia] = useState<FeaturedMedia | null>(null);

  useEffect(() => {
    const fetchMedia = async () => {
      if (!formData.featuredImageId || !formData.clientId) {
        setFeaturedMedia(null);
        return;
      }
      try {
        const media = await getMediaById(formData.featuredImageId, formData.clientId);
        if (media) {
          setFeaturedMedia({ url: media.url, altText: media.altText });
        }
      } catch {
        setFeaturedMedia(null);
      }
    };
    fetchMedia();
  }, [formData.featuredImageId, formData.clientId]);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://modonty.com';
  const effectiveTitle = formData.seoTitle || formData.title || '';
  const effectiveDescription = formData.seoDescription || formData.excerpt || '';
  const effectiveCanonical = formData.canonicalUrl || `${siteUrl}/articles/${formData.slug}`;
  const selectedClient = clients.find((c) => c.id === formData.clientId);

  const hasRequiredData = effectiveTitle && effectiveDescription;

  return (
    <div className="space-y-4">
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          SEO title, description, and canonical URL can be edited in the <strong>Settings</strong> step.
          This section shows a preview of how your article will appear in search results.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Search Preview</CardTitle>
        </CardHeader>
        <CardContent>
          {!hasRequiredData ? (
            <div className="flex items-center gap-2 p-4 bg-muted/50 rounded-lg border border-dashed">
              <Info className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Add SEO title and description in Settings step to see preview
              </span>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {/* Google Preview */}
              <div className="space-y-2">
                <h4 className="text-sm font-semibold flex items-center gap-2">
                  <Globe className="h-4 w-4" /> Google
                </h4>
                <div className="border rounded-lg p-3 space-y-1">
                  <div className="text-xs text-green-700 dark:text-green-400 truncate">{effectiveCanonical}</div>
                  <div className="text-sm text-blue-600 dark:text-blue-400 font-medium line-clamp-1">
                    {effectiveTitle}
                  </div>
                  <div className="text-xs text-muted-foreground line-clamp-2">{effectiveDescription}</div>
                </div>
              </div>

              {/* Social Preview */}
              <div className="space-y-2">
                <h4 className="text-sm font-semibold flex items-center gap-2">
                  <Globe className="h-4 w-4" /> Social
                </h4>
                <div className="border rounded-lg overflow-hidden">
                  {featuredMedia?.url ? (
                    <img src={featuredMedia.url} alt={effectiveTitle} className="w-full aspect-video object-cover" />
                  ) : (
                    <div className="w-full aspect-video bg-muted/50 flex items-center justify-center">
                      <ImageIcon className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}
                  <div className="p-2 space-y-1">
                    <div className="text-[10px] text-muted-foreground uppercase">
                      {selectedClient?.name || 'مودونتي'}
                    </div>
                    <div className="text-xs font-semibold line-clamp-1">{effectiveTitle}</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Current SEO Values</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between py-1.5 border-b">
              <span className="text-muted-foreground">Title</span>
              <div className="flex items-center gap-2">
                <span className="max-w-xs truncate">{effectiveTitle || 'Not set'}</span>
                <Badge variant={effectiveTitle.length > 60 ? 'destructive' : 'secondary'}>
                  {effectiveTitle.length}/60
                </Badge>
              </div>
            </div>
            <div className="flex items-center justify-between py-1.5 border-b">
              <span className="text-muted-foreground">Description</span>
              <Badge variant={effectiveDescription.length < 120 || effectiveDescription.length > 160 ? 'destructive' : 'secondary'}>
                {effectiveDescription.length}/160
              </Badge>
            </div>
            <div className="flex items-center justify-between py-1.5 border-b">
              <span className="text-muted-foreground">Canonical URL</span>
              <code className="text-xs bg-muted px-2 py-1 rounded max-w-xs truncate">
                {effectiveCanonical}
              </code>
            </div>
            <div className="flex items-center justify-between py-1.5 border-b">
              <span className="text-muted-foreground">Meta Robots</span>
              <Badge variant="outline">{formData.metaRobots || 'index, follow'}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
