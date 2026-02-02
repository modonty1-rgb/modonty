'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useArticleForm } from '../article-form-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, Code, Copy, ScanSearch } from 'lucide-react';
import { JsonLdValidationButton } from '@/components/shared/jsonld-validation-button';
import { useToast } from '@/hooks/use-toast';
import { getMediaById } from '@/app/(dashboard)/media/actions/get-media-by-id';
import { generateBreadcrumbStructuredData } from '@/lib/seo';
import { openInspect } from '@/app/(dashboard)/inspect/helpers/open-inspect';

interface FeaturedMedia {
  url: string;
  altText: string | null;
  width: number | null;
  height: number | null;
}

export function MetaTagPreviewStep() {
  const router = useRouter();
  const pathname = usePathname();
  const { formData, clients, categories, authors, tags } = useArticleForm();
  const { toast } = useToast();
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

  const openGraphMeta = useMemo(() => {
    const ogUrl = normalizeUrl(formData.canonicalUrl, `/articles/${formData.slug}`);
    const og: Record<string, unknown> = {
      // Articles in this flow should always use the "article" Open Graph type
      type: 'article',
      title: effectiveTitle,
      description: effectiveDescription,
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

  const nextjsMetadataObject = useMemo(() => {
    const siteName = selectedClient?.name || 'مودونتي';
    const fullTitle = `${effectiveTitle} - ${siteName}`;
    const ogImage = featuredMedia?.url || `${siteUrl}/og-image.jpg`;

    const openGraphData: Record<string, unknown> = {
      title: fullTitle,
      description: effectiveDescription,
      url: effectiveCanonical,
      siteName: siteName,
      images: [{
        url: ogImage,
        width: featuredMedia?.width || 1200,
        height: featuredMedia?.height || 630,
        alt: effectiveTitle || siteName,
      }],
      locale: openGraphMeta.locale,
      type: openGraphMeta.type,
    };

    if (openGraphMeta.type === 'article') {
      if (openGraphMeta.publishedTime) {
        openGraphData.publishedTime = openGraphMeta.publishedTime;
      }
      if (openGraphMeta.modifiedTime) {
        openGraphData.modifiedTime = openGraphMeta.modifiedTime;
      }
      if (openGraphMeta.authors && (openGraphMeta.authors as string[]).length > 0) {
        openGraphData.authors = openGraphMeta.authors;
      }
      if (openGraphMeta.section) {
        openGraphData.section = openGraphMeta.section;
      }
      if (openGraphMeta.tags && (openGraphMeta.tags as string[]).length > 0) {
        openGraphData.tags = openGraphMeta.tags;
      }
    }

    const twitterData: Record<string, unknown> = {
      card: twitterMeta.card,
      title: fullTitle,
      description: effectiveDescription,
      images: [ogImage],
    };

    if (twitterMeta.creator) {
      twitterData.creator = twitterMeta.creator;
    }
    if (twitterMeta.site) {
      twitterData.site = twitterMeta.site;
    }

    const metadata: Record<string, unknown> = {
      title: fullTitle,
      description: effectiveDescription,
      alternates: {
        canonical: effectiveCanonical,
      },
      openGraph: openGraphData,
      twitter: twitterData,
      robots: {
        index: !formData.metaRobots?.includes('noindex'),
        follow: !formData.metaRobots?.includes('nofollow'),
        googleBot: {
          index: !formData.metaRobots?.includes('noindex'),
          follow: !formData.metaRobots?.includes('nofollow'),
          'max-video-preview': -1,
          'max-image-preview': 'large',
          'max-snippet': -1,
        },
      },
    };

    return metadata;
  }, [effectiveTitle, effectiveDescription, effectiveCanonical, formData.metaRobots, openGraphMeta, twitterMeta, featuredMedia, selectedClient, siteUrl]);

  const jsonLdPreview = useMemo(() => {
    const articleUrl = effectiveCanonical;
    const graph: Record<string, unknown>[] = [];
    const authorSlug = (selectedAuthor && 'slug' in selectedAuthor ? selectedAuthor.slug : undefined) || 'default-author';
    const clientSlug = selectedClient?.slug || 'modonty';
    const ids = {
      article: `${articleUrl}#article`,
      author: `${siteUrl}/authors/${authorSlug}#person`,
      publisher: `${siteUrl}/clients/${clientSlug}#organization`,
      breadcrumb: `${articleUrl}#breadcrumb`,
    };

    // Derive publish and modified dates with a guarantee that modified >= published
    const publishDateIso = formData.ogArticlePublishedTime
      ? new Date(formData.ogArticlePublishedTime).toISOString()
      : formData.datePublished
        ? new Date(formData.datePublished).toISOString()
        : formData.scheduledAt
          ? new Date(formData.scheduledAt).toISOString()
          : new Date().toISOString();

    const rawModifiedIso = formData.ogArticleModifiedTime
      ? new Date(formData.ogArticleModifiedTime).toISOString()
      : new Date().toISOString();

    const modifiedDateIso =
      new Date(rawModifiedIso).getTime() < new Date(publishDateIso).getTime()
        ? publishDateIso
        : rawModifiedIso;

    // Normalize language to a single valid code (e.g. "ar-SA"), even if the field contains comma-separated values
    const rawLanguage = (formData.inLanguage || '').trim();
    const normalizedLanguage = (() => {
      if (!rawLanguage) return 'ar-SA';
      if (rawLanguage.includes(',')) {
        const first = rawLanguage.split(',')[0]?.trim();
        return first || 'ar-SA';
      }
      return rawLanguage;
    })();

    const article: Record<string, unknown> = {
      '@type': 'Article',
      '@id': ids.article,
      headline: effectiveTitle,
      description: effectiveDescription,
      datePublished: publishDateIso,
      dateModified: modifiedDateIso,
      author: { '@id': ids.author },
      publisher: { '@id': ids.publisher },
      mainEntityOfPage: { '@type': 'WebPage', '@id': articleUrl },
      inLanguage: normalizedLanguage,
      isAccessibleForFree: formData.isAccessibleForFree ?? true,
    };

    if (selectedCategory?.name) article.articleSection = selectedCategory.name;

    const keywordSource =
      formData.ogArticleTag && formData.ogArticleTag.length > 0
        ? formData.ogArticleTag
        : selectedTagNames;
    if (keywordSource.length > 0) {
      article.keywords = keywordSource;
    }
    if (featuredMedia?.url) {
      article.image = {
        '@type': 'ImageObject',
        url: featuredMedia.url,
        width: featuredMedia.width || 1200,
        height: featuredMedia.height || 630,
      };
    }
    if (formData.wordCount) article.wordCount = formData.wordCount;
    if (formData.license && formData.license !== "none")
      article.license = formData.license;
    if (formData.articleBodyText) {
      article.articleBody = formData.articleBodyText;
    }

    graph.push(article);

    graph.push({
      '@type': 'WebPage',
      '@id': articleUrl,
      url: articleUrl,
      name: effectiveTitle,
      description: effectiveDescription,
      isPartOf: { '@type': 'WebSite', name: selectedClient?.name || 'مودونتي', url: siteUrl },
      breadcrumb: { '@id': ids.breadcrumb },
    });

    // Breadcrumb items expect relative paths so generateBreadcrumbStructuredData
    // can safely prefix the siteUrl without creating duplicate domains.
    const articlePath = (() => {
      try {
        const u = new URL(effectiveCanonical);
        return u.pathname || '/';
      } catch {
        return effectiveCanonical.startsWith('/') ? effectiveCanonical : `/${effectiveCanonical}`;
      }
    })();

    const breadcrumbItems = [
      { name: 'الرئيسية', url: '/' },
      ...(selectedCategory ? [{ name: selectedCategory.name, url: `/categories/${selectedCategory.slug}` }] : []),
      { name: effectiveTitle, url: articlePath },
    ];
    const breadcrumb = generateBreadcrumbStructuredData(breadcrumbItems) as Record<string, unknown>;
    delete breadcrumb['@context'];
    breadcrumb['@id'] = ids.breadcrumb;
    graph.push(breadcrumb);

    const organizationNode: Record<string, unknown> = {
      '@type': 'Organization',
      '@id': ids.publisher,
      name: selectedClient?.name || 'مودونتي',
      url: (selectedClient && 'url' in selectedClient ? selectedClient.url : undefined) || siteUrl,
    };

    if (selectedClient?.logoMedia?.url) {
      organizationNode.logo = {
        '@type': 'ImageObject',
        url: selectedClient.logoMedia.url,
        ...(selectedClient.logoMedia.width && { width: selectedClient.logoMedia.width }),
        ...(selectedClient.logoMedia.height && { height: selectedClient.logoMedia.height }),
      };
    }

    graph.push(organizationNode);

    const personNode: Record<string, unknown> = {
      '@type': 'Person',
      '@id': ids.author,
      name: selectedAuthor?.name || 'كاتب',
    };
    if (selectedAuthor && 'bio' in selectedAuthor && selectedAuthor.bio) personNode.description = selectedAuthor.bio;
    if (selectedAuthor && 'image' in selectedAuthor && selectedAuthor.image) personNode.image = selectedAuthor.image;
    if (selectedAuthor && 'url' in selectedAuthor && selectedAuthor.url) personNode.url = selectedAuthor.url;
    graph.push(personNode);

    return { '@context': 'https://schema.org', '@graph': graph };
  }, [formData, effectiveTitle, effectiveDescription, effectiveCanonical, selectedClient, selectedCategory, selectedAuthor, selectedTagNames, featuredMedia, siteUrl]);

  // Hints to guide the editor to 100% MetaTag coverage for article pages
  const perfectionHints = useMemo(() => {
    const hints: string[] = [];

    const hasPublishSource =
      !!formData.ogArticlePublishedTime ||
      !!formData.datePublished ||
      !!formData.scheduledAt;
    if (!hasPublishSource) {
      hints.push('Add a publish or scheduled date so Open Graph can include article:published_time.');
    }

    const hasAuthorSource =
      !!formData.ogArticleAuthor ||
      !!selectedAuthor?.name;
    if (!hasAuthorSource) {
      hints.push('Set an article author so Open Graph can include article:author.');
    }

    const hasSectionSource =
      !!formData.ogArticleSection ||
      !!selectedCategory?.name;
    if (!hasSectionSource) {
      hints.push('Assign a category/section so Open Graph can include article:section.');
    }

    const hasTagsSource =
      (formData.ogArticleTag && formData.ogArticleTag.length > 0) ||
      selectedTagNames.length > 0;
    if (!hasTagsSource) {
      hints.push('Add article tags or SEO keywords so Open Graph can include article:tag list.');
    }

    return hints;
  }, [formData, selectedAuthor, selectedCategory, selectedTagNames]);

  // Hints to guide the editor to 100% JSON-LD coverage for article pages
  const jsonLdHints = useMemo(() => {
    const hints: string[] = [];

    const hasPublishSource =
      !!formData.ogArticlePublishedTime ||
      !!formData.datePublished ||
      !!formData.scheduledAt;
    if (!hasPublishSource) {
      hints.push('Add a publish or scheduled date so JSON-LD can include a reliable datePublished.');
    }

    const hasModifiedSource = !!formData.ogArticleModifiedTime;
    if (!hasModifiedSource) {
      hints.push('Set an explicit modified date so JSON-LD can include a stable dateModified.');
    }

    const hasAuthorSource =
      !!formData.ogArticleAuthor ||
      !!selectedAuthor?.name;
    if (!hasAuthorSource) {
      hints.push('Set an article author so JSON-LD can reference a Person node.');
    }

    const hasSectionSource =
      !!formData.ogArticleSection ||
      !!selectedCategory?.name;
    if (!hasSectionSource) {
      hints.push('Assign a category/section so JSON-LD can set articleSection.');
    }

    const hasKeywordsSource =
      (formData.ogArticleTag && formData.ogArticleTag.length > 0) ||
      selectedTagNames.length > 0;
    if (!hasKeywordsSource) {
      hints.push('Add article tags or SEO keywords so JSON-LD can include keywords.');
    }

    const hasImageSource = !!featuredMedia?.url;
    if (!hasImageSource) {
      hints.push('Choose a featured image so JSON-LD can include a hero ImageObject.');
    }

    const hasArticleBody = !!formData.articleBodyText;
    if (!hasArticleBody) {
      hints.push('Provide articleBody text so JSON-LD can describe the full article content.');
    }

    return hints;
  }, [formData, selectedAuthor, selectedCategory, selectedTagNames, featuredMedia]);

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({ title: 'تم النسخ', description: `تم نسخ ${label} بنجاح` });
    } catch {
      toast({ title: 'فشل النسخ', description: 'فشل في نسخ المحتوى', variant: 'destructive' });
    }
  };

  const hasRequiredData = effectiveTitle && effectiveDescription;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Code className="h-4 w-4" />
            MetaTag & JSON-LD
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!hasRequiredData ? (
            <div className="flex items-center gap-2 p-4 bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-200 dark:border-amber-800">
              <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              <span className="text-sm text-amber-900 dark:text-amber-100">
                Add SEO title and description in Meta Tags step to see meta tags and metadata object
              </span>
            </div>
          ) : (
            <>
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
                            content: JSON.stringify(nextjsMetadataObject, null, 2),
                            sourceType: "preview",
                            description: "Article metadata (title, Open Graph, Twitter, robots)",
                            returnUrl: pathname ?? "/articles",
                          })
                        );
                      }}
                    >
                      <ScanSearch className="h-4 w-4 mr-1" />
                      Inspect
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(JSON.stringify(nextjsMetadataObject, null, 2), "Metadata JSON")}
                    >
                      <Copy className="h-4 w-4 mr-1" />
                      Copy
                    </Button>
                  </div>
                </div>
                <pre className="p-3 bg-muted rounded-md overflow-auto max-h-96 text-xs">
                  <code>{JSON.stringify(nextjsMetadataObject, null, 2)}</code>
                </pre>

                {perfectionHints.length > 0 && (
                  <div className="mt-3 rounded-md border border-dashed border-amber-300 bg-amber-50 dark:bg-amber-950/30 p-3 text-xs text-amber-900 dark:text-amber-50 space-y-1">
                    <p className="font-semibold">
                      To reach 100% MetaTag coverage for this article, consider:
                    </p>
                    <ul className="list-disc pl-4 space-y-1">
                      {perfectionHints.map((hint, index) => (
                        <li key={index}>{hint}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-semibold">JSON-LD Preview</h4>
                  <div className="flex gap-2">
                    <JsonLdValidationButton
                      jsonLd={jsonLdPreview}
                      entityType="article"
                      options={{
                        requirePublisherLogo: true,
                        requireHeroImage: true,
                        requireAuthorBio: false,
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        router.push(
                          openInspect({
                            source: "Articles → Edit → MetaTag & JSON-LD",
                            content: JSON.stringify(jsonLdPreview, null, 2),
                            sourceType: "preview",
                            description: "Article JSON-LD (Schema.org)",
                            returnUrl: pathname ?? "/articles",
                          })
                        );
                      }}
                    >
                      <ScanSearch className="h-4 w-4 mr-1" />
                      Inspect
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(JSON.stringify(jsonLdPreview, null, 2), "JSON-LD")}
                    >
                      <Copy className="h-4 w-4 mr-1" />
                      Copy
                    </Button>
                  </div>
                </div>
                <pre className="p-3 bg-muted rounded-md overflow-auto max-h-64 text-xs">
                  <code>{JSON.stringify(jsonLdPreview, null, 2)}</code>
                </pre>

                {jsonLdHints.length > 0 && (
                  <div className="mt-3 rounded-md border border-dashed border-sky-300 bg-sky-50 dark:bg-sky-950/30 p-3 text-xs text-sky-900 dark:text-sky-50 space-y-1">
                    <p className="font-semibold">
                      To reach 100% JSON-LD coverage for this article, consider:
                    </p>
                    <ul className="list-disc pl-4 space-y-1">
                      {jsonLdHints.map((hint, index) => (
                        <li key={index}>{hint}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
