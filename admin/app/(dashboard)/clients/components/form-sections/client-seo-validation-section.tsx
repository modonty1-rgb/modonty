'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Loader2,
  ScanSearch,
} from 'lucide-react';
import { openInspect } from '@/app/(dashboard)/inspect/helpers/open-inspect';
import { validateClientJsonLdComplete } from '../../helpers/client-seo-config/client-jsonld-validator';
import type { ValidationReport } from '@/lib/seo/jsonld-validator';
import { format } from 'date-fns';

interface ClientSEOValidationSectionProps {
  formData: Record<string, unknown>;
  clientId?: string;
  mode?: 'new' | 'edit';
}

export function ClientSEOValidationSection({ 
  formData, 
  clientId, 
  mode = 'new' 
}: ClientSEOValidationSectionProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [validationReport, setValidationReport] = useState<ValidationReport | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [jsonLd, setJsonLd] = useState<object | null>(null);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://modonty.com';

  // Generate JSON-LD preview from form data (live from context, new and edit)
  useEffect(() => {
    if (!formData.name) {
      setJsonLd(null);
      return;
    }
    const toAbs = (url: string) =>
      url.startsWith('http') ? url : url.startsWith('/') ? `${siteUrl}${url}` : `https://${url}`;
    const mapLang = (l: string) => {
      const x = String(l).toLowerCase();
      if (/arabic|^ar$/.test(x)) return 'ar';
      if (/english|^en$/.test(x)) return 'en';
      return l;
    };
    const slug = (formData.slug as string) || 'client';
    const clientPageUrl = (formData.canonicalUrl as string) || `${siteUrl}/clients/${slug}`;
    const desc = (formData.seoDescription as string) || (formData.description as string) || undefined;
    const logo = formData.logoMedia as { url?: string; altText?: string; width?: number; height?: number } | null;
    const ogImg = formData.ogImageMedia as { url?: string; altText?: string; width?: number; height?: number } | null;
    const parent = formData.parentOrganization as { name?: string; url?: string; slug?: string } | null;
    const lat = formData.addressLatitude as number | null | undefined;
    const lng = formData.addressLongitude as number | null | undefined;

    const orgNode: Record<string, unknown> = {
      '@type': (formData.organizationType as string) || 'Organization',
      '@id': `${siteUrl}/clients/${slug}#organization`,
      name: formData.name as string,
      ...(formData.legalName ? { legalName: formData.legalName } : {}),
      ...(formData.url ? { url: formData.url } : {}),
      ...(desc ? { description: desc } : {}),
      ...(formData.foundingDate
        ? {
            foundingDate:
              formData.foundingDate instanceof Date
                ? formData.foundingDate.toISOString().split('T')[0]
                : String(formData.foundingDate).split('T')[0],
          }
        : {}),
      ...(formData.email
        ? {
            contactPoint: {
              '@type': 'ContactPoint',
              email: formData.email,
              ...(formData.phone ? { telephone: formData.phone } : {}),
            },
          }
        : {}),
      ...(formData.addressStreet || formData.addressCity
        ? {
            address: {
              '@type': 'PostalAddress',
              ...(formData.addressStreet ? { streetAddress: formData.addressStreet } : {}),
              ...(formData.addressCity ? { addressLocality: formData.addressCity } : {}),
              ...(formData.addressCountry ? { addressCountry: formData.addressCountry } : {}),
              ...(formData.addressPostalCode ? { postalCode: formData.addressPostalCode } : {}),
            },
          }
        : {}),
    };
    if (logo?.url) {
      orgNode.logo = {
        '@type': 'ImageObject',
        url: toAbs(logo.url),
        ...(logo.width ? { width: logo.width >= 112 ? logo.width : 112 } : {}),
        ...(logo.height ? { height: logo.height >= 112 ? logo.height : 112 } : {}),
      };
    }
    const knows = formData.knowsLanguage as string[] | undefined;
    if (Array.isArray(knows) && knows.length > 0) {
      orgNode.knowsLanguage = knows.map(mapLang);
    }
    if (lat != null && lng != null && !Number.isNaN(lat) && !Number.isNaN(lng)) {
      orgNode.geo = { '@type': 'GeoCoordinates', latitude: lat, longitude: lng };
    }
    const bac = formData.businessActivityCode as string | undefined;
    if (bac && String(bac).trim()) {
      orgNode.businessActivityCode = String(bac).trim();
    }
    if (parent?.name) {
      let parentId: string | undefined;
      if (parent.slug) {
        parentId = `${siteUrl}/clients/${parent.slug}#organization`;
      } else if (parent.url) {
        parentId = toAbs(parent.url);
      }
      orgNode.parentOrganization = {
        '@type': 'Organization',
        name: parent.name,
        ...(parentId && { '@id': parentId }),
        ...(parent.url && { url: toAbs(parent.url) }),
      };
    }

    const webPageNode: Record<string, unknown> = {
      '@type': 'WebPage',
      '@id': clientPageUrl,
      url: clientPageUrl,
      name: (formData.seoTitle as string) || (formData.name as string),
      description: desc,
    };
    if (ogImg?.url) {
      const u = toAbs(ogImg.url);
      webPageNode.primaryImageOfPage = {
        '@type': 'ImageObject',
        url: u,
        contentUrl: u,
        width: ogImg.width && ogImg.width >= 1200 ? ogImg.width : 1200,
        height: ogImg.height && ogImg.height >= 630 ? ogImg.height : 630,
        ...(ogImg.altText && { caption: ogImg.altText }),
      };
    } else if (logo?.url) {
      const u = toAbs(logo.url);
      webPageNode.primaryImageOfPage = {
        '@type': 'ImageObject',
        url: u,
        contentUrl: u,
        width: logo.width && logo.width >= 112 ? logo.width : 112,
        height: logo.height && logo.height >= 112 ? logo.height : 112,
        ...(logo.altText && { caption: logo.altText }),
      };
    }

    setJsonLd({ '@context': 'https://schema.org', '@graph': [orgNode, webPageNode] });
  }, [formData, siteUrl]);

  const metaPreview = useMemo(() => {
    const name = (formData.name as string) ?? '';
    const title = ((formData.seoTitle as string) || name || '').trim();
    const description = ((formData.seoDescription as string) || (formData.description as string) || '').trim();
    const robots = ((formData.metaRobots as string)?.trim()) || 'index, follow';
    const slug = (formData.slug as string) || 'client';
    const canonical = (formData.canonicalUrl as string) || `${siteUrl}/clients/${slug}`;
    const defaultAlt = `${name || 'Organization'} - Organization`;

    const toAbsolute = (url: string) =>
      url.startsWith('http') ? url : url.startsWith('/') ? `${siteUrl}${url}` : `https://${url}`;
    const makeOgImg = (u: string, alt: string, w?: number, h?: number) => ({
      url: u,
      secure_url: u.replace('http://', 'https://'),
      type: 'image/jpeg',
      width: w && w >= 1200 ? w : 1200,
      height: h && h >= 630 ? h : 630,
      alt: alt || defaultAlt,
    });

    const og: {
      title: string;
      description: string;
      type: string;
      url: string;
      siteName: string;
      locale: string;
      localeAlternate?: string[];
      images?: Array<{ url: string; secure_url: string; type: string; width: number; height: number; alt: string }>;
    } = {
      title: title || '(no name)',
      description: description || '',
      type: 'website',
      url: canonical,
      siteName: 'Modonty',
      locale: 'ar_SA',
    };

    const ogImg = formData.ogImageMedia as { url?: string; altText?: string; width?: number; height?: number } | null;
    const logo = formData.logoMedia as { url?: string; altText?: string; width?: number; height?: number } | null;
    if (ogImg?.url) {
      og.images = [makeOgImg(toAbsolute(ogImg.url), (ogImg.altText as string) || defaultAlt, ogImg.width, ogImg.height)];
    } else if (logo?.url) {
      og.images = [makeOgImg(toAbsolute(logo.url), (logo.altText as string) || defaultAlt, logo.width, logo.height)];
    }

    const knowsLang = formData.knowsLanguage as string[] | undefined;
    if (Array.isArray(knowsLang) && knowsLang.length > 1) {
      const hasEn = knowsLang.some((l) => /english|en/i.test(String(l)));
      if (hasEn) og.localeAlternate = ['en_US'];
    }

    const twImg = formData.twitterImageMedia as { url?: string; altText?: string } | null;
    const ogImageUrl = og.images?.[0]?.secure_url || og.images?.[0]?.url;
    const ogImageAlt = og.images?.[0]?.alt;
    const hasAnyImage = !!(twImg?.url || ogImageUrl);
    const card = (formData.twitterCard as string) || (hasAnyImage ? 'summary_large_image' : 'summary');

    const twitter: {
      card: string;
      title: string;
      description: string;
      image?: string;
      imageAlt?: string;
      site?: string;
      creator?: string;
    } = {
      card,
      title: (formData.twitterTitle as string) || title || '(no name)',
      description: (formData.twitterDescription as string) || description || '',
    };
    if (twImg?.url) {
      twitter.image = toAbsolute(twImg.url);
      twitter.imageAlt = (twImg.altText as string) || defaultAlt;
    } else if (card === 'summary_large_image' && ogImageUrl) {
      twitter.image = ogImageUrl;
      twitter.imageAlt = ogImageAlt || defaultAlt;
    }
    const twSite = formData.twitterSite as string | undefined;
    if (twSite) {
      twitter.site = twSite;
      twitter.creator = twSite;
    }

    return { title: title || '(no name)', description, robots, author: name || '', canonical, openGraph: og, twitter };
  }, [formData, siteUrl]);

  const criticalNotes = useMemo(() => {
    const notes: string[] = [];
    const ogImg = formData.ogImageMedia as { url?: string } | null;
    const logo = formData.logoMedia as { url?: string } | null;
    const twImg = formData.twitterImageMedia as { url?: string } | null;
    const twSite = formData.twitterSite as string | undefined;
    const hasOg = !!ogImg?.url;
    const hasLogo = !!logo?.url;
    const hasTwImg = !!twImg?.url;
    const ogFromLogo = !hasOg && hasLogo;
    const twFromFallback = !hasTwImg && (hasOg || hasLogo);

    if (!hasOg && !hasLogo) {
      notes.push('Critical: No OG image or logo. Add in Media for og:image. Social shares will have no image. Logo also required for JSON-LD.');
    } else if (ogFromLogo) {
      notes.push('Note: No OG image – using logo fallback for og:image.');
    } else if (!hasLogo) {
      notes.push('Critical: No logo. Required for JSON-LD; used as meta image fallback when OG/Twitter image missing.');
    }
    if (!hasTwImg && !hasOg && !hasLogo) {
      notes.push('Critical: No Twitter image. Add Twitter image, OG image, or logo for Twitter Cards.');
    } else if (twFromFallback) {
      notes.push('Note: No Twitter image – using OG/logo fallback.');
    }
    if (!twSite) {
      notes.push('Note: Set Twitter site (@username) for attribution (twitter:site, twitter:creator).');
    }
    return notes;
  }, [formData]);

  const jsonLdCriticalNotes = useMemo(() => {
    const notes: string[] = [];
    notes.push('Note: Preview is minimal. Full JSON-LD (WebSite, full Organization, ContactPoint, companyRegistration, etc.) is generated on save.');
    const logo = formData.logoMedia as { url?: string } | null;
    if (!logo?.url) {
      notes.push('Critical: No logo. Required for Organization rich results; add in Media.');
    }
    const knows = formData.knowsLanguage as string[] | undefined;
    if (!Array.isArray(knows) || knows.length === 0) {
      notes.push('Note: Add knowsLanguage for BCP 47 codes in JSON-LD (improves Schema.org compliance).');
    }
    const parent = formData.parentOrganization as { slug?: string; url?: string } | null;
    if (parent && !parent.slug && !parent.url) {
      notes.push('Note: Parent organization has no slug or URL – @id will be omitted. Set parent URL or use same-site parent for resolvable @id.');
    }
    return notes;
  }, [formData]);

  // Validate JSON-LD
  const handleValidate = async () => {
    if (!jsonLd) return;

    setIsValidating(true);
    try {
      const report = await validateClientJsonLdComplete(jsonLd, {
        requireLogo: true, // Require logo for Organization rich results
        requireAddress: false, // Address optional but validated if present
        requireContactPoint: false, // ContactPoint optional but validated if present
        minNameLength: 2,
        maxNameLength: 100,
      });
      setValidationReport(report);
    } catch (error) {
      console.error('Validation failed:', error);
    } finally {
      setIsValidating(false);
    }
  };

  // Auto-validate when JSON-LD changes
  useEffect(() => {
    if (jsonLd) {
      handleValidate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jsonLd]);

  const adobeErrors = validationReport?.adobe?.errors || [];
  const adobeWarnings = validationReport?.adobe?.warnings || [];
  const ajvErrors = validationReport?.ajv?.errors || [];
  const ajvWarnings = validationReport?.ajv?.warnings || [];
  const customErrors = validationReport?.custom?.errors || [];
  const customWarnings = validationReport?.custom?.warnings || [];
  const isValid = adobeErrors.length === 0 && ajvErrors.length === 0 && customErrors.length === 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>SEO & Validation</CardTitle>
            <CardDescription>
              Advanced SEO validation using Adobe Structured Data Validator
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button type="button" size="sm" onClick={handleValidate} disabled={!jsonLd || isValidating}>
              {isValidating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Validating...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Re-validate
                </>
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {!jsonLd ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>Complete basic fields (name) to generate JSON-LD</p>
          </div>
        ) : (
          <Tabs defaultValue="validation" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="validation">Validation</TabsTrigger>
              <TabsTrigger value="meta">Meta</TabsTrigger>
              <TabsTrigger value="jsonld">JSON-LD</TabsTrigger>
              <TabsTrigger value="summary">Summary</TabsTrigger>
            </TabsList>

            {/* Validation Tab */}
            <TabsContent value="validation" className="space-y-4 mt-4">
              <div className="p-3 bg-muted rounded-md text-sm text-muted-foreground">
                <p className="font-medium mb-1">Note:</p>
                <p>
                  This is a preview validation. Full validation with all relations happens after saving the client.
                </p>
              </div>

              {/* Validation Status */}
              <div className="flex items-center gap-3 p-4 rounded-lg border">
                {isValid ? (
                  <>
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <div>
                      <p className="font-medium">Validation Passed</p>
                      <p className="text-sm text-muted-foreground">
                        Client is ready for rich results
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <XCircle className="h-5 w-5 text-destructive" />
                    <div>
                      <p className="font-medium">Validation Failed</p>
                      <p className="text-sm text-muted-foreground">
                        {adobeErrors.length + ajvErrors.length + customErrors.length} error(s) found
                      </p>
                    </div>
                  </>
                )}
              </div>

              {/* Adobe Validation Errors */}
              {adobeErrors.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium text-destructive flex items-center gap-2">
                    <XCircle className="h-4 w-4" />
                    Schema.org Errors ({adobeErrors.length})
                  </h4>
                  <div className="space-y-2">
                    {adobeErrors.map((error, idx) => (
                      <div
                        key={idx}
                        className="p-3 bg-destructive/10 border border-destructive/20 rounded-md"
                      >
                        <p className="text-sm font-medium">{error.message}</p>
                        {error.path && <p className="text-xs text-muted-foreground mt-1">Path: {error.path}</p>}
                        {error.property && (
                          <p className="text-xs text-muted-foreground">Property: {error.property}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Adobe Validation Warnings */}
              {adobeWarnings.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium text-yellow-500 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    Schema.org Warnings ({adobeWarnings.length})
                  </h4>
                  <div className="space-y-2">
                    {adobeWarnings.map((warning, idx) => (
                      <div
                        key={idx}
                        className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-md"
                      >
                        <p className="text-sm font-medium">{warning.message}</p>
                        {warning.recommendation && (
                          <p className="text-xs text-muted-foreground mt-1">{warning.recommendation}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Ajv Validation Errors */}
              {ajvErrors.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium text-destructive flex items-center gap-2">
                    <XCircle className="h-4 w-4" />
                    Schema Validation Errors ({ajvErrors.length})
                  </h4>
                  <div className="space-y-2">
                    {ajvErrors.map((error, idx) => (
                      <div
                        key={idx}
                        className="p-3 bg-destructive/10 border border-destructive/20 rounded-md"
                      >
                        <p className="text-sm">{error}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Ajv Validation Warnings */}
              {ajvWarnings.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium text-yellow-500 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    Schema Validation Warnings ({ajvWarnings.length})
                  </h4>
                  <div className="space-y-2">
                    {ajvWarnings.map((warning, idx) => (
                      <div
                        key={idx}
                        className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-md"
                      >
                        <p className="text-sm">{warning}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Custom Business Rules Errors */}
              {customErrors.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium text-destructive flex items-center gap-2">
                    <XCircle className="h-4 w-4" />
                    Business Rules Errors ({customErrors.length})
                  </h4>
                  <div className="space-y-2">
                    {customErrors.map((error, idx) => (
                      <div
                        key={idx}
                        className="p-3 bg-destructive/10 border border-destructive/20 rounded-md"
                      >
                        <p className="text-sm">{error}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Custom Business Rules Warnings */}
              {customWarnings.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium text-yellow-500 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    Business Rules Warnings ({customWarnings.length})
                  </h4>
                  <div className="space-y-2">
                    {customWarnings.map((warning, idx) => (
                      <div
                        key={idx}
                        className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-md"
                      >
                        <p className="text-sm">{warning}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* All Clear */}
              {isValid && adobeWarnings.length === 0 && ajvWarnings.length === 0 && customWarnings.length === 0 && (
                <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-md text-center">
                  <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                  <p className="font-medium">Perfect! All validations passed</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Your client is optimized for search engines
                  </p>
                </div>
              )}
            </TabsContent>

            {/* Meta Tab */}
            <TabsContent value="meta" className="mt-4 space-y-4">
              {criticalNotes.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-500" />
                    Critical notes
                  </h4>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                    {criticalNotes.map((note, i) => (
                      <li key={i} className={note.startsWith('Critical:') ? 'text-destructive' : ''}>
                        {note}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <div className="relative">
                <pre className="p-4 bg-muted rounded-md overflow-auto max-h-96 text-xs">
                  <code>{JSON.stringify(metaPreview, null, 2)}</code>
                </pre>
                <div className="absolute top-2 right-2 flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      router.push(
                        openInspect({
                          source: "Clients → Edit → Meta",
                          content: JSON.stringify(metaPreview, null, 2),
                          sourceType: "preview",
                          description: "Client meta tags (title, Open Graph, Twitter)",
                          returnUrl: pathname ?? "/clients",
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
                    onClick={() => navigator.clipboard.writeText(JSON.stringify(metaPreview, null, 2))}
                  >
                    Copy
                  </Button>
                </div>
              </div>
            </TabsContent>

            {/* JSON-LD Tab */}
            <TabsContent value="jsonld" className="mt-4 space-y-4">
              {jsonLdCriticalNotes.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-500" />
                    Critical notes
                  </h4>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                    {jsonLdCriticalNotes.map((note, i) => (
                      <li key={i} className={note.startsWith('Critical:') ? 'text-destructive' : ''}>
                        {note}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <div className="relative">
                <pre className="p-4 bg-muted rounded-md overflow-auto max-h-96 text-xs">
                  <code>{JSON.stringify(jsonLd, null, 2)}</code>
                </pre>
                <div className="absolute top-2 right-2 flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      router.push(
                        openInspect({
                          source: "Clients → Edit → JSON-LD",
                          content: JSON.stringify(jsonLd, null, 2),
                          sourceType: "preview",
                          description: "Client JSON-LD (Organization schema)",
                          returnUrl: pathname ?? "/clients",
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
                    onClick={() => navigator.clipboard.writeText(JSON.stringify(jsonLd, null, 2))}
                  >
                    Copy
                  </Button>
                </div>
              </div>
            </TabsContent>

            {/* Summary Tab */}
            <TabsContent value="summary" className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Schema.org Validation</p>
                  <p className="text-2xl font-bold">
                    {validationReport?.adobe?.valid ? (
                      <span className="text-green-500">Valid</span>
                    ) : (
                      <span className="text-destructive">Invalid</span>
                    )}
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Total Errors</p>
                  <p className="text-2xl font-bold text-destructive">
                    {adobeErrors.length + ajvErrors.length + customErrors.length}
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Total Warnings</p>
                  <p className="text-2xl font-bold text-yellow-500">
                    {adobeWarnings.length + ajvWarnings.length + customWarnings.length}
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Last Validated</p>
                  <p className="text-sm font-medium">
                    {validationReport?.adobe?.timestamp
                      ? format(new Date(validationReport.adobe.timestamp), 'PPp')
                      : 'Never'}
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
}
