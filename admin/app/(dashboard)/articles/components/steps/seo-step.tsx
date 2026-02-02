'use client';

import { useState, useEffect, useMemo } from 'react';
import { useArticleForm } from '../article-form-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  ChevronDown, 
  AlertCircle, 
  ImageIcon,
  Globe,
  Twitter,
  Search
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getMediaById } from '@/app/(dashboard)/media/actions/get-media-by-id';
import { TechnicalSEOGuidance } from '../sections/technical-seo-guidance';
import { TechnicalSection } from '../sections/technical-section';
import { SocialSection } from '../sections/social-section';
import { FormNativeSelect } from '@/components/admin/form-field';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { LICENSE_OPTIONS } from '@/lib/constants/licenses';

interface FeaturedMedia {
  url: string;
  altText: string | null;
  width: number | null;
  height: number | null;
}

export function SEOStep() {
  const { formData, updateField, clients, categories, authors, tags } = useArticleForm();
  const [featuredMedia, setFeaturedMedia] = useState<FeaturedMedia | null>(null);
  const [previewsOpen, setPreviewsOpen] = useState(true);

  // Fetch featured image metadata
  useEffect(() => {
    const fetchMedia = async () => {
      if (!formData.featuredImageId || !formData.clientId) {
        setFeaturedMedia(null);
        return;
      }
      try {
        const media = await getMediaById(formData.featuredImageId, formData.clientId);
        if (media) {
          setFeaturedMedia({
            url: media.url,
            altText: media.altText,
            width: media.width,
            height: media.height,
          });
        } else {
          setFeaturedMedia(null);
        }
      } catch {
        setFeaturedMedia(null);
      }
    };
    fetchMedia();
  }, [formData.featuredImageId, formData.clientId]);

  // Resolve effective values
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://modonty.com';

  const normalizeUrl = (url: string | undefined, fallback: string): string => {
    if (!url) return `${siteUrl}${fallback}`;
    if (url.startsWith(siteUrl)) return url;
    try {
      const urlObj = new URL(url);
      const path = urlObj.pathname + urlObj.search + urlObj.hash;
      return `${siteUrl}${path}`;
    } catch {
      const cleanPath = url.startsWith('/') ? url : `/${url}`;
      return `${siteUrl}${cleanPath}`;
    }
  };

  const effectiveTitle = formData.seoTitle || formData.title || '';
  const effectiveDescription = formData.seoDescription || formData.excerpt || '';
  const effectiveCanonical = normalizeUrl(formData.canonicalUrl, `/articles/${formData.slug}`);
  const selectedClient = clients.find((c) => c.id === formData.clientId);
  const selectedCategory = categories.find((c) => c.id === formData.categoryId);
  const selectedAuthor = authors.find((a) => a.id === formData.authorId);
  const selectedTagNames = useMemo(() => {
    if (!formData.tags || formData.tags.length === 0) return [];
    return tags.filter((t) => formData.tags?.includes(t.id)).map((t) => t.name);
  }, [formData.tags, tags]);

  // Build Open Graph metadata
  const openGraphMeta = useMemo(() => {
    const ogUrl = normalizeUrl(formData.canonicalUrl, `/articles/${formData.slug}`);
    const og: Record<string, unknown> = {
      type: formData.ogType || 'article',
      title: formData.ogTitle || effectiveTitle,
      description: formData.ogDescription || effectiveDescription,
      url: ogUrl,
      siteName: formData.ogSiteName || selectedClient?.name || 'مودونتي',
      locale: formData.ogLocale || formData.inLanguage || 'ar_SA',
    };

    if (og.type === 'article') {
      if (formData.ogArticlePublishedTime) {
        og.publishedTime = new Date(formData.ogArticlePublishedTime).toISOString();
      } else if (formData.datePublished) {
        og.publishedTime = new Date(formData.datePublished).toISOString();
      } else if (formData.scheduledAt) {
        og.publishedTime = new Date(formData.scheduledAt).toISOString();
      }

      if (formData.ogArticleModifiedTime) {
        og.modifiedTime = new Date(formData.ogArticleModifiedTime).toISOString();
      } else {
        og.modifiedTime = new Date().toISOString();
      }

      if (formData.ogArticleAuthor || selectedAuthor?.name) {
        og.authors = [formData.ogArticleAuthor || selectedAuthor?.name || ''];
      }

      if (formData.ogArticleSection || selectedCategory?.name) {
        og.section = formData.ogArticleSection || selectedCategory?.name || '';
      }

      if (formData.ogArticleTag && formData.ogArticleTag.length > 0) {
        og.tags = formData.ogArticleTag;
      } else if (selectedTagNames.length > 0) {
        og.tags = selectedTagNames;
      }
    }

    if (featuredMedia?.url) {
      og.images = [{
        url: featuredMedia.url,
        width: featuredMedia.width || 1200,
        height: featuredMedia.height || 630,
        alt: featuredMedia.altText || effectiveTitle,
      }];
    }

    return og;
  }, [formData, effectiveTitle, effectiveDescription, selectedClient, selectedCategory, selectedAuthor, selectedTagNames, featuredMedia]);

  // Build Twitter metadata
  const twitterMeta = useMemo(() => ({
    card: formData.twitterCard || 'summary_large_image',
    title: effectiveTitle,
    description: effectiveDescription,
    site: formData.twitterSite || undefined,
    creator: formData.twitterCreator || selectedAuthor?.name || undefined,
    images: featuredMedia?.url ? [featuredMedia.url] : undefined,
    label1: undefined,
    data1: undefined,
  }), [formData, effectiveTitle, effectiveDescription, selectedAuthor, featuredMedia]);

  const hasRequiredData = effectiveTitle && effectiveDescription;

  return (
    <div className="space-y-4">
      <TechnicalSEOGuidance />
      <TechnicalSection />

      {/* Search & Social Previews */}
      <Collapsible open={previewsOpen} onOpenChange={setPreviewsOpen}>
        <Card>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5" />
                  Search & Social Previews
                </CardTitle>
                <ChevronDown className={cn("h-5 w-5 transition-transform", previewsOpen && "rotate-180")} />
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="space-y-6">
              {!hasRequiredData ? (
                <div className="flex items-center gap-2 p-4 bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-200 dark:border-amber-800">
                  <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                  <span className="text-sm text-amber-900 dark:text-amber-100">
                    Add SEO title and description in Meta Tags step to see previews
                  </span>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-3">
                  {/* Google Preview */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold flex items-center gap-2">
                      <Globe className="h-4 w-4" /> Google
                    </h4>
                    <div className="border rounded-lg p-3 space-y-1">
                      <div className="text-xs text-green-700 dark:text-green-400 truncate">{effectiveCanonical}</div>
                      <div className="text-sm text-blue-600 dark:text-blue-400 font-medium line-clamp-1 hover:underline cursor-pointer">
                        {effectiveTitle}
                      </div>
                      <div className="text-xs text-muted-foreground line-clamp-2">{effectiveDescription}</div>
                    </div>
                  </div>

                  {/* Facebook Preview */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold flex items-center gap-2">
                      <Globe className="h-4 w-4" /> Facebook
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
                        <div className="text-[10px] text-muted-foreground uppercase">{openGraphMeta.siteName as string}</div>
                        <div className="text-xs font-semibold line-clamp-1">{effectiveTitle}</div>
                        <div className="text-[10px] text-muted-foreground line-clamp-1">{effectiveDescription}</div>
                      </div>
                    </div>
                  </div>

                  {/* Twitter Preview */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold flex items-center gap-2">
                      <Twitter className="h-4 w-4" /> Twitter
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
                        <div className="text-xs font-semibold line-clamp-1">{twitterMeta.title}</div>
                        <div className="text-[10px] text-muted-foreground line-clamp-1">{twitterMeta.description}</div>
                        <div className="text-[10px] text-muted-foreground truncate">{effectiveCanonical}</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {!featuredMedia?.url && hasRequiredData && (
                <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg border border-dashed">
                  <ImageIcon className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Add a featured image in Media step for better social sharing
                  </span>
                </div>
              )}
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Social Media */}
      <SocialSection />
    </div>
  );
}
