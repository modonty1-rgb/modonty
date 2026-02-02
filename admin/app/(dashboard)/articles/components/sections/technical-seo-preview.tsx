'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useArticleForm } from '../article-form-context';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Copy, CheckCircle2, AlertCircle, ScanSearch } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { openInspect } from '@/app/(dashboard)/inspect/helpers/open-inspect';
import { SEOPreviewCard } from '../seo-preview-card';
import { SocialSection } from './social-section';
import { getMediaById } from '@/app/(dashboard)/media/actions/get-media-by-id';
import { generateBreadcrumbStructuredData } from '@/lib/seo';

interface FeaturedMedia {
  url: string;
  altText: string | null;
  width: number | null;
  height: number | null;
}

export function TechnicalSeoPreview() {
  const router = useRouter();
  const pathname = usePathname();
  const { formData, clients, categories, tags, authors } = useArticleForm();
  const { toast } = useToast();
  const [featuredMedia, setFeaturedMedia] = useState<FeaturedMedia | null>(null);
  const [loadingMedia, setLoadingMedia] = useState(false);

  // Fetch featured image metadata
  useEffect(() => {
    const fetchMedia = async () => {
      if (!formData.featuredImageId || !formData.clientId) {
        setFeaturedMedia(null);
        return;
      }

      setLoadingMedia(true);
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
      } catch (error) {
        console.error('Error fetching featured media:', error);
        setFeaturedMedia(null);
      } finally {
        setLoadingMedia(false);
      }
    };

    fetchMedia();
  }, [formData.featuredImageId, formData.clientId]);

  // Resolve effective values with fallbacks
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://modonty.com';
  
  // Normalize canonical URL - replace localhost with correct domain
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
  const effectiveCanonical = normalizeUrl(
    formData.canonicalUrl,
    `/articles/${formData.slug}`
  );
  const selectedClient = clients.find((c) => c.id === formData.clientId);
  const selectedCategory = categories.find((c) => c.id === formData.categoryId);
  const selectedAuthor = authors.find((a) => a.id === formData.authorId);
  const selectedTagNames = useMemo(() => {
    if (!formData.tags || formData.tags.length === 0) return [];
    return tags.filter((t) => formData.tags?.includes(t.id)).map((t) => t.name);
  }, [formData.tags, tags]);

  // Build Open Graph metadata
  const openGraphMeta = useMemo(() => {
    const ogUrl = normalizeUrl(
      formData.canonicalUrl,
      `/articles/${formData.slug}`
    );

    const og: any = {
      type: formData.ogType || 'article',
      title: effectiveTitle,
      description: effectiveDescription,
      url: ogUrl,
      siteName: formData.ogSiteName || selectedClient?.name || 'مودونتي',
      locale: formData.ogLocale || formData.inLanguage || 'ar_SA',
    };

    // Article-specific OG fields
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

    // Image
    if (featuredMedia?.url) {
      og.images = [
        {
          url: featuredMedia.url,
          width: featuredMedia.width || 1200,
          height: featuredMedia.height || 630,
          alt: featuredMedia.altText || effectiveTitle,
        },
      ];
    }

    return og;
  }, [
    formData,
    effectiveTitle,
    effectiveDescription,
    selectedClient,
    selectedCategory,
    selectedAuthor,
    selectedTagNames,
    featuredMedia,
  ]);

  // Build Twitter metadata
  const twitterMeta = useMemo(() => {
    return {
      card: formData.twitterCard || 'summary_large_image',
      title: effectiveTitle,
      description: effectiveDescription,
      site: formData.twitterSite || undefined,
      creator: formData.twitterCreator || selectedAuthor?.name || undefined,
      images: featuredMedia?.url ? [featuredMedia.url] : undefined,
      label1: undefined,
      data1: undefined,
    };
  }, [formData, effectiveTitle, effectiveDescription, selectedAuthor, featuredMedia]);

  // Build JSON-LD preview
  const jsonLdPreview = useMemo(() => {
    // effectiveCanonical is already normalized above
    const articleUrl = effectiveCanonical;

    const graph: any[] = [];

    // Article
    const article: any = {
      '@type': 'Article',
      '@id': `${articleUrl}#article`,
      headline: effectiveTitle,
      description: effectiveDescription,
      datePublished: formData.datePublished
        ? new Date(formData.datePublished).toISOString()
        : formData.scheduledAt
          ? new Date(formData.scheduledAt).toISOString()
          : new Date().toISOString(),
      dateModified: formData.ogArticleModifiedTime
        ? new Date(formData.ogArticleModifiedTime).toISOString()
        : new Date().toISOString(),
      author: {
        '@type': 'Person',
        name: selectedAuthor?.name || formData.ogArticleAuthor || 'Modonty',
      },
      publisher: {
        '@type': 'Organization',
        name: selectedClient?.name || 'مودونتي',
      },
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': articleUrl,
      },
      inLanguage: formData.inLanguage || 'ar',
      isAccessibleForFree: formData.isAccessibleForFree ?? true,
    };

    if (selectedCategory?.name) {
      article.articleSection = selectedCategory.name;
    }

    if (selectedTagNames.length > 0) {
      article.keywords = selectedTagNames;
    }

    if (featuredMedia?.url) {
      article.image = {
        '@type': 'ImageObject',
        url: featuredMedia.url,
        width: featuredMedia.width || 1200,
        height: featuredMedia.height || 630,
      };
    }

    if (formData.wordCount) {
      article.wordCount = formData.wordCount;
    }

    if (formData.license && formData.license !== "none") {
      article.license = formData.license;
    }

    graph.push(article);

    // WebPage
    graph.push({
      '@type': 'WebPage',
      '@id': articleUrl,
      url: articleUrl,
      name: effectiveTitle,
      description: effectiveDescription,
      isPartOf: {
        '@type': 'WebSite',
        name: selectedClient?.name || 'مودونتي',
        url: siteUrl,
      },
      breadcrumb: {
        '@id': `${articleUrl}#breadcrumb`,
      },
    });

    // BreadcrumbList
    const breadcrumbItems = [
      { name: 'الرئيسية', url: '/' },
      ...(selectedCategory
        ? [{ name: selectedCategory.name, url: `/categories/${selectedCategory.slug}` }]
        : []),
      { name: effectiveTitle, url: effectiveCanonical },
    ];

    const breadcrumb = generateBreadcrumbStructuredData(breadcrumbItems) as Record<string, unknown>;
    breadcrumb['@id'] = `${articleUrl}#breadcrumb`;
    graph.push(breadcrumb);

    // Organization (if client selected)
    if (selectedClient) {
      graph.push({
        '@type': 'Organization',
        '@id': `${siteUrl}#organization`,
        name: selectedClient.name,
        url: siteUrl,
      });
    }

    return {
      '@context': 'https://schema.org',
      '@graph': graph,
    };
  }, [
    formData,
    effectiveTitle,
    effectiveDescription,
    effectiveCanonical,
    selectedClient,
    selectedCategory,
    selectedAuthor,
    selectedTagNames,
    featuredMedia,
  ]);

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: 'تم النسخ',
        description: `تم نسخ ${label} بنجاح`,
      });
    } catch {
      toast({
        title: 'فشل النسخ',
        description: 'فشل في نسخ المحتوى',
        variant: 'destructive',
      });
    }
  };

  const metadataJson = JSON.stringify(
    {
      title: effectiveTitle,
      description: effectiveDescription,
      openGraph: openGraphMeta,
      twitter: twitterMeta,
    },
    null,
    2
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>معاينة SEO التقني</CardTitle>
        <CardDescription>
          معاينة مباشرة لبيانات SEO ووسائل التواصل الاجتماعي وJSON-LD بناءً على البيانات الحالية
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="meta" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="meta">A) Meta SEO</TabsTrigger>
            <TabsTrigger value="social">B) Social Meta</TabsTrigger>
            <TabsTrigger value="jsonld">C) JSON-LD</TabsTrigger>
          </TabsList>

          {/* Section A: SEO Meta Preview */}
          <TabsContent value="meta" className="mt-6 space-y-4">
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-semibold">Title</h4>
                  <Badge variant={effectiveTitle.length > 60 ? 'destructive' : 'secondary'}>
                    {effectiveTitle.length} / 60
                  </Badge>
                </div>
                <div className="p-3 bg-muted rounded-md text-sm">{effectiveTitle || 'غير محدد'}</div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-semibold">Description</h4>
                  <Badge
                    variant={
                      effectiveDescription.length < 120 || effectiveDescription.length > 160
                        ? 'destructive'
                        : 'secondary'
                    }
                  >
                    {effectiveDescription.length} / 160
                  </Badge>
                </div>
                <div className="p-3 bg-muted rounded-md text-sm">
                  {effectiveDescription || 'غير محدد'}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold mb-2">Canonical URL</h4>
                <div className="p-3 bg-muted rounded-md text-sm font-mono break-all">
                  {effectiveCanonical || 'غير محدد'}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold mb-2">Meta Robots</h4>
                <div className="flex gap-2">
                  <Badge variant="outline">{formData.metaRobots || 'index, follow'}</Badge>
                </div>
              </div>

              <SocialSection />
            </div>
          </TabsContent>

          {/* Section B: Social Meta Preview */}
          <TabsContent value="social" className="mt-6 space-y-6">
            {/* Visual Preview */}
            <div>
              <h4 className="text-sm font-semibold mb-4">معاينة بصرية</h4>
              <SEOPreviewCard
                title={openGraphMeta.title}
                description={openGraphMeta.description}
                url={openGraphMeta.url}
                image={featuredMedia?.url}
                siteName={openGraphMeta.siteName}
              />
            </div>

            {/* Metadata JSON */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-semibold">Metadata JSON</h4>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      router.push(
                        openInspect({
                          source: "Articles → Edit → Metadata JSON",
                          content: metadataJson,
                          sourceType: "preview",
                          description: "Article metadata (title, Open Graph, Twitter)",
                          returnUrl: pathname ?? "/articles",
                        })
                      );
                    }}
                  >
                    <ScanSearch className="h-4 w-4 mr-2" />
                    Inspect
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(metadataJson, "Metadata JSON")}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    نسخ
                  </Button>
                </div>
              </div>
              <pre className="p-4 bg-muted rounded-md overflow-auto max-h-96 text-xs">
                <code>{metadataJson}</code>
              </pre>
            </div>

            {/* Open Graph Details */}
            <div>
              <h4 className="text-sm font-semibold mb-3">تفاصيل Open Graph</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">og:type</span>
                  <code className="bg-muted px-2 py-1 rounded">{openGraphMeta.type}</code>
                </div>
                {openGraphMeta.publishedTime && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">og:article:published_time</span>
                    <code className="bg-muted px-2 py-1 rounded text-xs">
                      {new Date(openGraphMeta.publishedTime).toLocaleString('ar-SA')}
                    </code>
                  </div>
                )}
                {openGraphMeta.modifiedTime && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">og:article:modified_time</span>
                    <code className="bg-muted px-2 py-1 rounded text-xs">
                      {new Date(openGraphMeta.modifiedTime).toLocaleString('ar-SA')}
                    </code>
                  </div>
                )}
                {openGraphMeta.authors && openGraphMeta.authors.length > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">og:article:author</span>
                    <code className="bg-muted px-2 py-1 rounded">{openGraphMeta.authors.join(', ')}</code>
                  </div>
                )}
                {openGraphMeta.section && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">og:article:section</span>
                    <code className="bg-muted px-2 py-1 rounded">{openGraphMeta.section}</code>
                  </div>
                )}
                {openGraphMeta.tags && openGraphMeta.tags.length > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">og:article:tag</span>
                    <div className="flex gap-1 flex-wrap">
                      {openGraphMeta.tags.map((tag: string, idx: number) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                {openGraphMeta.images && openGraphMeta.images.length > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">og:image</span>
                    <code className="bg-muted px-2 py-1 rounded text-xs break-all max-w-xs">
                      {openGraphMeta.images[0].url}
                    </code>
                  </div>
                )}
              </div>
            </div>

            {/* Twitter Details */}
            <div>
              <h4 className="text-sm font-semibold mb-3">تفاصيل Twitter Cards</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">twitter:card</span>
                  <code className="bg-muted px-2 py-1 rounded">{twitterMeta.card}</code>
                </div>
                {twitterMeta.site && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">twitter:site</span>
                    <code className="bg-muted px-2 py-1 rounded">{twitterMeta.site}</code>
                  </div>
                )}
                {twitterMeta.creator && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">twitter:creator</span>
                    <code className="bg-muted px-2 py-1 rounded">{twitterMeta.creator}</code>
                  </div>
                )}
                {twitterMeta.label1 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">twitter:label1</span>
                    <code className="bg-muted px-2 py-1 rounded">{twitterMeta.label1}</code>
                  </div>
                )}
                {twitterMeta.data1 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">twitter:data1</span>
                    <code className="bg-muted px-2 py-1 rounded">{twitterMeta.data1}</code>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Section C: JSON-LD Preview */}
          <TabsContent value="jsonld" className="mt-6 space-y-4">
            <div className="p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-md">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5" />
                <p className="text-sm text-blue-900 dark:text-blue-100">
                  هذه معاينة JSON-LD بناءً على البيانات الحالية. سيتم توليد الرسم البياني الكامل للمعرفة
                  (Knowledge Graph) بعد حفظ المقال على الخادم.
                </p>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-semibold">JSON-LD Preview (@graph)</h4>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      router.push(
                        openInspect({
                          source: "Articles → Edit → JSON-LD",
                          content: JSON.stringify(jsonLdPreview, null, 2),
                          sourceType: "preview",
                          description: "Article JSON-LD (Schema.org)",
                          returnUrl: pathname ?? "/articles",
                        })
                      );
                    }}
                  >
                    <ScanSearch className="h-4 w-4 mr-2" />
                    Inspect
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(JSON.stringify(jsonLdPreview, null, 2), "JSON-LD")}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    نسخ
                  </Button>
                </div>
              </div>
              <pre className="p-4 bg-muted rounded-md overflow-auto max-h-96 text-xs">
                <code>{JSON.stringify(jsonLdPreview, null, 2)}</code>
              </pre>
            </div>

            <div>
              <h4 className="text-sm font-semibold mb-3">ملخص الكيانات</h4>
              <div className="space-y-2">
                {jsonLdPreview['@graph'].map((item: any, idx: number) => (
                  <div key={idx} className="flex items-center gap-2 p-2 bg-muted rounded-md">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <code className="text-sm">{item['@type']}</code>
                    {item['@id'] && (
                      <span className="text-xs text-muted-foreground">({item['@id']})</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
