"use client";

import { useState, FormEvent, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Save, AlertCircle, Tag, Braces, Share2, Sparkles } from "lucide-react";
import { updatePage } from "../actions/page-actions";
import { generateModontyPageSEO } from "../actions/generate-modonty-page-seo";
import { type ValidateModontySEOReport } from "../actions/validate-modonty-seo";
import { BasicSection } from "./sections/basic-section";
import { MediaSection } from "./sections/media-section";
import { SEOSection } from "./sections/seo-section";
import { LivePreviewSection } from "./sections/live-preview-section";
import { GeneratedSEOSection } from "./sections/generated-seo-section";
import { ValidationReportSection } from "./sections/validation-report-section";
import { pageSchema, type PageFormData } from "../helpers/page-schema";
import { useToast } from "@/hooks/use-toast";

function deriveInLanguageFromOgLocale(ogLocale: string | null | undefined): string {
  return (ogLocale ?? "ar_SA").split("_")[0] || "ar";
}

function toBcp47FromLocale(locale: string): string {
  /**
   * Convert values like "ar_SA" / "ar-sa" to proper BCP‑47 ("ar-SA").
   * Google hreflang accepts BCP‑47 + the special "x-default" value.
   */
  const trimmed = locale.trim();
  if (!trimmed || trimmed.toLowerCase() === "x-default") return "x-default";

  const parts = trimmed.split(/[_-]/).filter(Boolean);
  if (parts.length === 0) return "";

  const language = parts[0].toLowerCase();
  const region = parts[1]?.toUpperCase();

  return region ? `${language}-${region}` : language;
}

function deriveAlternateLanguagesFromOgLocaleAlternate(
  ogLocaleAlternate: string | null | undefined,
  canonicalUrl: string,
  _slug: string,
  siteUrl: string
): Array<{ hreflang: string; url: string }> | undefined {
  const raw = (ogLocaleAlternate ?? "").trim();
  if (!raw) return undefined;
  let base: string;
  let pathname: string;
  try {
    const url = new URL(canonicalUrl || `${siteUrl}/`);
    base = url.origin;
    pathname = url.pathname || "/";
  } catch {
    base = siteUrl;
    pathname = "/";
  }
  const locales = raw.split(",").map((s) => s.trim()).filter(Boolean);
  if (locales.length === 0) return undefined;

  return locales
    .map((locale) => {
      const hreflang = toBcp47FromLocale(locale);
      if (!hreflang) return null;

      // URL path segment stays simple language ("/ar", "/en")
      const langSegment = hreflang.split("-")[0];
      const url =
        pathname === "/"
          ? `${base}/${langSegment}`
          : `${base}/${langSegment}${pathname.startsWith("/") ? pathname : `/${pathname}`}`;

      return { hreflang, url };
    })
    .filter((item): item is { hreflang: string; url: string } => item !== null);
}

export interface SettingsDefaults {
  siteUrl: string;
  twitterSite: string;
  twitterCreator: string;
  orgLogoUrl: string;
  defaultMetaRobots: string;
  defaultGooglebot: string;
  defaultOgType: string;
  defaultOgLocale: string;
  defaultOgDeterminer: string;
  defaultTwitterCard: string;
  defaultSitemapPriority: number;
  defaultSitemapChangeFreq: string;
}

interface PageFormProps {
  slug: string;
  onRegenerated?: () => void;
  settingsDefaults: SettingsDefaults;
  initialData?: {
    title?: string;
    content?: string;
    heroImage?: string | null;
    heroImageAlt?: string | null;
    heroImageCloudinaryPublicId?: string | null;
    seoTitle?: string | null;
    seoDescription?: string | null;
    metaRobots?: string | null;
    googlebot?: string | null;
    author?: string | null;
    socialImage?: string | null;
    socialImageAlt?: string | null;
    cloudinaryPublicId?: string | null;
    ogTitle?: string | null;
    ogDescription?: string | null;
    ogType?: string | null;
    ogUrl?: string | null;
    ogSiteName?: string | null;
    ogLocale?: string | null;
    ogImage?: string | null;
    ogImageAlt?: string | null;
    ogImageSecureUrl?: string | null;
    ogImageType?: string | null;
    ogImageWidth?: number | null;
    ogImageHeight?: number | null;
    ogLocaleAlternate?: string | null;
    ogDeterminer?: string | null;
    twitterCard?: string | null;
    twitterTitle?: string | null;
    twitterDescription?: string | null;
    twitterSite?: string | null;
    twitterCreator?: string | null;
    twitterImage?: string | null;
    twitterImageAlt?: string | null;
    canonicalUrl?: string | null;
    alternateLanguages?: any;
    sitemapPriority?: number | null;
    sitemapChangeFreq?: string | null;
    inLanguage?: string | null;
    metaTags?: unknown;
    jsonLdStructuredData?: string | null;
    jsonLdLastGenerated?: string | Date | null;
    jsonLdValidationReport?: unknown;
  };
}

export function PageForm({ slug, initialData, onRegenerated, settingsDefaults }: PageFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [seoGenerating, setSeoGenerating] = useState(false);
  const [validationReport, setValidationReport] = useState<ValidateModontySEOReport | null>(null);

  const defaultCanonical = `${settingsDefaults.siteUrl}/${slug}`;
  const [formData, setFormData] = useState<PageFormData>({
    title: initialData?.title || "",
    content: initialData?.content || "",
    heroImage: initialData?.heroImage || undefined,
    heroImageAlt: initialData?.heroImageAlt || undefined,
    heroImageCloudinaryPublicId: initialData?.heroImageCloudinaryPublicId || undefined,
    seoTitle: initialData?.seoTitle || undefined,
    seoDescription: initialData?.seoDescription || undefined,
    metaRobots: (initialData?.metaRobots as PageFormData["metaRobots"]) ?? (settingsDefaults.defaultMetaRobots as PageFormData["metaRobots"]),
    googlebot: initialData?.googlebot ?? settingsDefaults.defaultGooglebot,
    author: initialData?.author || undefined,
    socialImage: initialData?.socialImage || undefined,
    socialImageAlt: initialData?.socialImageAlt || undefined,
    cloudinaryPublicId: initialData?.cloudinaryPublicId || undefined,
    ogTitle: initialData?.ogTitle || undefined,
    ogDescription: initialData?.ogDescription || undefined,
    ogType: initialData?.ogType ?? settingsDefaults.defaultOgType,
    ogUrl: initialData?.ogUrl || undefined,
    ogSiteName: initialData?.ogSiteName || undefined,
    ogLocale: initialData?.ogLocale ?? settingsDefaults.defaultOgLocale,
    ogImage: initialData?.ogImage || undefined,
    ogImageAlt: initialData?.ogImageAlt || undefined,
    ogImageSecureUrl: initialData?.ogImageSecureUrl || undefined,
    ogImageType: initialData?.ogImageType || undefined,
    ogImageWidth: initialData?.ogImageWidth ?? undefined,
    ogImageHeight: initialData?.ogImageHeight ?? undefined,
    ogLocaleAlternate: initialData?.ogLocaleAlternate ?? "",
    ogDeterminer: initialData?.ogDeterminer ?? settingsDefaults.defaultOgDeterminer,
    twitterCard: (initialData?.twitterCard as PageFormData["twitterCard"]) ?? (settingsDefaults.defaultTwitterCard as PageFormData["twitterCard"]),
    twitterTitle: initialData?.twitterTitle || undefined,
    twitterDescription: initialData?.twitterDescription || undefined,
    twitterSite: initialData?.twitterSite ?? settingsDefaults.twitterSite ?? "",
    twitterCreator: initialData?.twitterCreator ?? settingsDefaults.twitterCreator ?? "",
    twitterImage: initialData?.twitterImage || undefined,
    twitterImageAlt: initialData?.twitterImageAlt || undefined,
    canonicalUrl: initialData?.canonicalUrl ?? defaultCanonical,
    alternateLanguages: initialData?.alternateLanguages || undefined,
    sitemapPriority: initialData?.sitemapPriority ?? settingsDefaults.defaultSitemapPriority,
    sitemapChangeFreq: (initialData?.sitemapChangeFreq as PageFormData["sitemapChangeFreq"]) ?? (settingsDefaults.defaultSitemapChangeFreq as PageFormData["sitemapChangeFreq"]),
    inLanguage: deriveInLanguageFromOgLocale(initialData?.ogLocale),
    organizationSeo: (() => {
      const m = (initialData?.metaTags as Record<string, unknown> | undefined)?.organizationSeo as PageFormData["organizationSeo"] | undefined;
      const defaultLogo = settingsDefaults.orgLogoUrl ?? "";
      if (m) return { ...m, organizationLogoUrl: m.organizationLogoUrl ?? defaultLogo };
      if (defaultLogo) return { organizationLogoUrl: defaultLogo };
      return undefined;
    })(),
  });

  // Reset form when slug or initialData or settingsDefaults changes
  useEffect(() => {
    const defaultCanonical = `${settingsDefaults.siteUrl}/${slug}`;
    setFormData({
      title: initialData?.title || "",
      content: initialData?.content || "",
      heroImage: initialData?.heroImage || undefined,
      heroImageAlt: initialData?.heroImageAlt || undefined,
      heroImageCloudinaryPublicId: initialData?.heroImageCloudinaryPublicId || undefined,
      seoTitle: initialData?.seoTitle || undefined,
      seoDescription: initialData?.seoDescription || undefined,
      metaRobots: (initialData?.metaRobots as PageFormData["metaRobots"]) ?? (settingsDefaults.defaultMetaRobots as PageFormData["metaRobots"]),
      googlebot: initialData?.googlebot ?? settingsDefaults.defaultGooglebot,
      author: initialData?.author || undefined,
      socialImage: initialData?.socialImage || undefined,
      socialImageAlt: initialData?.socialImageAlt || undefined,
      cloudinaryPublicId: initialData?.cloudinaryPublicId || undefined,
      ogTitle: initialData?.ogTitle || undefined,
      ogDescription: initialData?.ogDescription || undefined,
      ogType: initialData?.ogType ?? settingsDefaults.defaultOgType,
      ogUrl: initialData?.ogUrl || undefined,
      ogSiteName: initialData?.ogSiteName || undefined,
      ogLocale: initialData?.ogLocale ?? settingsDefaults.defaultOgLocale,
      ogImage: initialData?.ogImage || undefined,
      ogImageAlt: initialData?.ogImageAlt || undefined,
      ogImageSecureUrl: initialData?.ogImageSecureUrl || undefined,
      ogImageType: initialData?.ogImageType || undefined,
      ogImageWidth: initialData?.ogImageWidth ?? undefined,
      ogImageHeight: initialData?.ogImageHeight ?? undefined,
      ogLocaleAlternate: initialData?.ogLocaleAlternate ?? "",
      ogDeterminer: initialData?.ogDeterminer ?? settingsDefaults.defaultOgDeterminer,
      twitterCard: (initialData?.twitterCard as PageFormData["twitterCard"]) ?? (settingsDefaults.defaultTwitterCard as PageFormData["twitterCard"]),
      twitterTitle: initialData?.twitterTitle || undefined,
      twitterDescription: initialData?.twitterDescription || undefined,
      twitterSite: initialData?.twitterSite ?? settingsDefaults.twitterSite ?? "",
      twitterCreator: initialData?.twitterCreator ?? settingsDefaults.twitterCreator ?? "",
      twitterImage: initialData?.twitterImage || undefined,
      twitterImageAlt: initialData?.twitterImageAlt || undefined,
      canonicalUrl: initialData?.canonicalUrl ?? defaultCanonical,
      alternateLanguages: initialData?.alternateLanguages || undefined,
      sitemapPriority: initialData?.sitemapPriority ?? settingsDefaults.defaultSitemapPriority,
      sitemapChangeFreq: (initialData?.sitemapChangeFreq as PageFormData["sitemapChangeFreq"]) ?? (settingsDefaults.defaultSitemapChangeFreq as PageFormData["sitemapChangeFreq"]),
      inLanguage: deriveInLanguageFromOgLocale(initialData?.ogLocale),
      organizationSeo: (() => {
        const m = (initialData?.metaTags as Record<string, unknown> | undefined)?.organizationSeo as PageFormData["organizationSeo"] | undefined;
        const defaultLogo = settingsDefaults.orgLogoUrl ?? "";
        if (m) return { ...m, organizationLogoUrl: m.organizationLogoUrl ?? defaultLogo };
        if (defaultLogo) return { organizationLogoUrl: defaultLogo };
        return undefined;
      })(),
    });
    setError(null);
  }, [slug, initialData, settingsDefaults]);

  const handleRegenerate = async () => {
    setSeoGenerating(true);
    try {
      const result = await generateModontyPageSEO(slug);
      if (result.success) {
        toast({ title: "Success", description: "Meta tags and JSON-LD generated" });
        onRegenerated?.();
      } else {
        toast({ variant: "destructive", title: "Error", description: result.error });
      }
    } finally {
      setSeoGenerating(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (!formData.title.trim()) {
        setError("Title is required");
        setLoading(false);
        return;
      }

      if (!formData.content.trim()) {
        setError("Content is required");
        setLoading(false);
        return;
      }

      const derivedInLanguage = deriveInLanguageFromOgLocale(formData.ogLocale);
      const fallbackCanonical = formData.canonicalUrl || `${settingsDefaults.siteUrl}/${slug}`;
      const derivedAlternateLanguages = deriveAlternateLanguagesFromOgLocaleAlternate(
        formData.ogLocaleAlternate,
        fallbackCanonical,
        slug,
        settingsDefaults.siteUrl
      );
      const submitData: PageFormData = {
        ...formData,
        inLanguage: derivedInLanguage,
        alternateLanguages: derivedAlternateLanguages,
        organizationSeo:
          formData.organizationSeo != null
            ? { ...formData.organizationSeo, knowsLanguage: derivedInLanguage }
            : formData.organizationSeo,
      };

      const parsed = pageSchema.safeParse(submitData);
      if (!parsed.success) {
        const msg = parsed.error.flatten().fieldErrors;
        const first = Object.values(msg).flat().find(Boolean);
        setError(first as string || "Please fix validation errors");
        setLoading(false);
        return;
      }

      const result = await updatePage(slug, parsed.data);

      if (result.success) {
        toast({
          title: "Success",
          description: "Page updated successfully",
        });
        if (result.warning) {
          toast({
            variant: "destructive",
            title: "SEO Warning",
            description: result.warning,
          });
        }
        router.refresh();
      } else {
        setError(result.error || "Failed to update page");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="basic" className="w-full">
          <div className="flex gap-6">
            <div className="flex-1 min-w-0">
          <TabsContent value="basic" className="space-y-6 mt-0">
            <BasicSection
              title={formData.title}
              content={formData.content}
              onTitleChange={(value) => setFormData((prev) => ({ ...prev, title: value }))}
              onContentChange={(value) => setFormData((prev) => ({ ...prev, content: value }))}
              headerAction={
                <Button type="submit" disabled={loading} size="sm">
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Update
                    </>
                  )}
                </Button>
              }
            />
          </TabsContent>

          <TabsContent value="media" className="space-y-6 mt-0">
            <MediaSection
              heroImage={formData.heroImage || ""}
              heroImageAlt={formData.heroImageAlt || ""}
              onHeroImageChange={(value) => setFormData((prev) => ({ ...prev, heroImage: value }))}
              onHeroImageAltChange={(value) => setFormData((prev) => ({ ...prev, heroImageAlt: value }))}
              headerAction={
                <Button type="submit" disabled={loading} size="sm">
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Update
                    </>
                  )}
                </Button>
              }
            />
          </TabsContent>

          <TabsContent value="seo" className="space-y-6 mt-0">
            <SEOSection
              seoTitle={formData.seoTitle || ""}
              seoDescription={formData.seoDescription || ""}
              onSeoTitleChange={(value) => setFormData((prev) => ({ ...prev, seoTitle: value }))}
              onSeoDescriptionChange={(value) => setFormData((prev) => ({ ...prev, seoDescription: value }))}
              headerAction={
                <Button type="submit" disabled={loading} size="sm">
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Update
                    </>
                  )}
                </Button>
              }
            />
          </TabsContent>

          <TabsContent value="previews" className="space-y-6 mt-0">
            <LivePreviewSection
              seoTitle={formData.seoTitle || ""}
              seoDescription={formData.seoDescription || ""}
              canonicalUrl={formData.canonicalUrl || ""}
              socialImage={formData.socialImage || formData.ogImage || ""}
            />
          </TabsContent>

          <TabsContent value="generated-seo" className="space-y-6 mt-0">
            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                size="sm"
                variant={initialData?.metaTags != null || (initialData?.jsonLdStructuredData != null && initialData?.jsonLdStructuredData !== "") ? "outline" : "default"}
                onClick={handleRegenerate}
                disabled={seoGenerating}
              >
                {seoGenerating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                {initialData?.metaTags != null || (initialData?.jsonLdStructuredData != null && initialData?.jsonLdStructuredData !== "") ? "Regenerate" : "Generate Meta Tags & JSON-LD"}
              </Button>
            </div>
            <GeneratedSEOSection
              slug={slug}
              formData={formData}
              metaTags={initialData?.metaTags}
              jsonLdStructuredData={initialData?.jsonLdStructuredData}
              jsonLdLastGenerated={initialData?.jsonLdLastGenerated}
              onRegenerated={onRegenerated}
              onValidated={(report) => setValidationReport(report)}
              showRegenerateButton={false}
            />
            <ValidationReportSection slug={slug} report={validationReport} showValidateButton={false} />
          </TabsContent>

          <TabsContent value="default-value" className="space-y-6 mt-0">
            <div className="space-y-4">
              <p className="text-sm font-medium text-foreground">
                Where every default lives — meta, JSON-LD, or both. Ref: SEO-FULL-COVERAGE-100 (§1–6).
              </p>

              <Card className="border-primary/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Tag className="h-4 w-4 text-primary" />
                    Meta only — crawlers & social
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Document, OG, Twitter (§1.1–1.3). Not in JSON-LD.
                  </p>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <p className="text-muted-foreground">
                    <span className="font-medium text-foreground">Charset:</span> UTF-8 (app-level; within first 1024 bytes).
                    <span className="block text-xs text-muted-foreground mt-0.5">Ref: MDN, W3C (§1.1).</span>
                  </p>
                  <p className="text-muted-foreground">
                    <span className="font-medium text-foreground">Viewport:</span> width=device-width, initial-scale=1 (app-level).
                    <span className="block text-xs text-muted-foreground mt-0.5">Ref: MDN (§1.1).</span>
                  </p>
                  <p className="text-muted-foreground">
                    <span className="font-medium text-foreground">Meta Robots:</span> index, follow.
                    <span className="block text-xs text-muted-foreground mt-0.5">Ref: meta robots (§1.1).</span>
                  </p>
                  <p className="text-muted-foreground">
                    <span className="font-medium text-foreground">Googlebot:</span> index, follow.
                    <span className="block text-xs text-muted-foreground mt-0.5">Ref: meta googlebot (§1.1).</span>
                  </p>
                  <p className="text-muted-foreground">
                    <span className="font-medium text-foreground">Theme color:</span> #3030FF (from modonty globals.css --primary, light).
                    <span className="block text-xs text-muted-foreground mt-0.5">Ref: meta theme-color (§1.1).</span>
                  </p>
                  <p className="text-muted-foreground">
                    <span className="font-medium text-foreground">Author:</span> From app singleton.
                    <span className="block text-xs text-muted-foreground mt-0.5">Ref: meta author (§1.1).</span>
                  </p>
                  <p className="text-muted-foreground">
                    <span className="font-medium text-foreground">OG Type:</span> website.
                    <span className="block text-xs text-muted-foreground mt-0.5">Ref: og:type (§1.2).</span>
                  </p>
                  <p className="text-muted-foreground">
                    <span className="font-medium text-foreground">OG Determiner:</span> auto.
                    <span className="block text-xs text-muted-foreground mt-0.5">Ref: og:determiner (§1.2).</span>
                  </p>
                  <p className="text-muted-foreground">
                    <span className="font-medium text-foreground">OG Site Name:</span> Modonty.
                    <span className="block text-xs text-muted-foreground mt-0.5">Ref: og:site_name (§1.2).</span>
                  </p>
                  <p className="text-muted-foreground">
                    <span className="font-medium text-foreground">Twitter Card:</span> summary_large_image.
                    <span className="block text-xs text-muted-foreground mt-0.5">Ref: twitter:card (§1.3).</span>
                  </p>
                  <p className="text-muted-foreground">
                    <span className="font-medium text-foreground">Twitter Site / Creator:</span> Settings table (twitterSite, twitterCreator).
                    <span className="block text-xs text-muted-foreground mt-0.5">Ref: twitter:site, twitter:creator (§1.3).</span>
                  </p>
                  <p className="text-muted-foreground">
                    <span className="font-medium text-foreground">Twitter site:id / creator:id:</span> Optional (§1.3).
                  </p>
                  <p className="text-muted-foreground">
                    <span className="font-medium text-foreground">OG image type/width/height/secure_url:</span> Optional (§1.2).
                  </p>
                  <p className="text-muted-foreground">
                    <span className="font-medium text-foreground">Sitemap Priority:</span> 0.5.
                    <span className="block text-xs text-muted-foreground mt-0.5">Ref: sitemap.</span>
                  </p>
                  <p className="text-muted-foreground">
                    <span className="font-medium text-foreground">Sitemap Change Frequency:</span> monthly.
                    <span className="block text-xs text-muted-foreground mt-0.5">Ref: sitemap changefreq.</span>
                  </p>
                </CardContent>
              </Card>

              <Card className="border-primary/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Braces className="h-4 w-4 text-primary" />
                    JSON-LD only — structured data
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Org, WebSite, WebPage, address & geo (§2–5). Not in meta tags.
                  </p>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <p className="text-muted-foreground">
                    <span className="font-medium text-foreground">ContactPoint:</span> Settings table (orgContactType, orgContactEmail, orgContactTelephone).
                    <span className="block text-xs text-muted-foreground mt-0.5">Ref: §2, §3.</span>
                  </p>
                  <p className="text-muted-foreground">
                    <span className="font-medium text-foreground">PostalAddress:</span> Settings table (orgStreetAddress, orgAddressLocality, orgAddressRegion, orgAddressCountry, orgPostalCode).
                    <span className="block text-xs text-muted-foreground mt-0.5">Ref: §5.</span>
                  </p>
                  <p className="text-muted-foreground">
                    <span className="font-medium text-foreground">GeoCoordinates:</span> Settings table (orgGeoLatitude, orgGeoLongitude).
                    <span className="block text-xs text-muted-foreground mt-0.5">Ref: §5.</span>
                  </p>
                  <p className="text-muted-foreground">
                    <span className="font-medium text-foreground">Organization description:</span> .env NEXT_PUBLIC_BRAND_DESCRIPTION; JSON-LD Organization.description, WebSite.description.
                    <span className="block text-xs text-muted-foreground mt-0.5">Ref: §2; MODONTY-GENERATED-SEO-SPEC.</span>
                  </p>
                  <p className="text-muted-foreground">
                    <span className="font-medium text-foreground">Organization logo:</span> Settings table (logoUrl / orgLogoUrl). JSON-LD Organization.logo.
                    <span className="block text-xs text-muted-foreground mt-0.5">Ref: §2, §3.</span>
                  </p>
                  <p className="text-muted-foreground">
                    <span className="font-medium text-foreground">WebSite potentialAction:</span> Settings table (orgSearchUrlTemplate).
                    <span className="block text-xs text-muted-foreground mt-0.5">Ref: §2, §3, §4.</span>
                  </p>
                  <p className="text-muted-foreground">
                    <span className="font-medium text-foreground">Organization sameAs:</span> Settings table (social URLs: Facebook, Instagram, LinkedIn, TikTok, Snapchat, Twitter, YouTube, etc.).
                    <span className="block text-xs text-muted-foreground mt-0.5">Ref: §2, §3, §4.</span>
                  </p>
                  <p className="text-muted-foreground">
                    <span className="font-medium text-foreground">ContactPoint areaServed:</span> Settings table (orgAreaServed); default SA, AE, KW, BH, OM, QA, EG.
                    <span className="block text-xs text-muted-foreground mt-0.5">Ref: §2, §3.</span>
                  </p>
                  <p className="text-muted-foreground">
                    <span className="font-medium text-foreground">AboutPage headline:</span> SOT = SEO Title (SEO tab).
                    <span className="block text-xs text-muted-foreground mt-0.5">Ref: §3, §4.</span>
                  </p>
                  <p className="text-muted-foreground">
                    <span className="font-medium text-foreground">dateModified:</span> Server-generated from page updatedAt; ISO 8601 (e.g. 2025-01-29T00:00:00.000Z).
                    <span className="block text-xs text-muted-foreground mt-0.5">Ref: §2, §3; schema.org dateModified.</span>
                  </p>
                  <p className="text-muted-foreground">
                    <span className="font-medium text-foreground">BreadcrumbList (AboutPage):</span> Optional; not in current Modonty page JSON-LD.
                    <span className="block text-xs text-muted-foreground mt-0.5">Ref: §3.</span>
                  </p>
                  <p className="text-muted-foreground">
                    <span className="font-medium text-foreground">LocalBusiness:</span> Optional; not in current Modonty page JSON-LD. If added: address, telephone, openingHoursSpecification (opens/closes, dayOfWeek), image.
                    <span className="block text-xs text-muted-foreground mt-0.5">Ref: §5; schema.org LocalBusiness.</span>
                  </p>
                </CardContent>
              </Card>

              <Card className="border-primary/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Share2 className="h-4 w-4 text-primary" />
                    Shared — meta + JSON-LD + hreflang
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    One value, many outputs. Set in SEO or Media tab (or fixed default).
                  </p>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <p className="text-muted-foreground">
                    <span className="font-medium text-foreground">Canonical URL:</span> base + path (e.g. https://modonty.com/about).
                    <span className="block text-xs text-muted-foreground mt-0.5">Ref: Meta canonical (§1.1) + WebPage.url (§2, §3).</span>
                  </p>
                  <p className="text-muted-foreground">
                    <span className="font-medium text-foreground">OG Locale (SOT):</span> ar_SA. Feeds og:locale, WebPage.inLanguage, hreflang, Organization.knowsLanguage.
                    <span className="block text-xs text-muted-foreground mt-0.5">Ref: §1.2, §1.4, §2–4.</span>
                  </p>
                  <p className="text-muted-foreground">
                    <span className="font-medium text-foreground">OG Locale Alternate:</span> Optional (e.g. en_US). Feeds og:locale:alternate, hreflang.
                    <span className="block text-xs text-muted-foreground mt-0.5">Ref: §1.2, §1.4.</span>
                  </p>
                  <p className="text-muted-foreground">
                    <span className="font-medium text-foreground">hreflang:</span> Built from OG Locale + OG Locale Alternate + canonical.
                    <span className="block text-xs text-muted-foreground mt-0.5">Ref: §1.4.</span>
                  </p>
                  <p className="text-muted-foreground">
                    <span className="font-medium text-foreground">Title / SEO Title:</span> Meta title, og:title, twitter:title; WebPage.name, AboutPage.headline. Set in SEO tab.
                    <span className="block text-xs text-muted-foreground mt-0.5">Ref: §1.1–1.3, §2–4.</span>
                  </p>
                  <p className="text-muted-foreground">
                    <span className="font-medium text-foreground">Description / SEO Description:</span> Meta description, og:description, twitter:description; WebPage.description. Set in SEO tab.
                    <span className="block text-xs text-muted-foreground mt-0.5">Ref: §1.1–1.3, §2–4.</span>
                  </p>
                  <p className="text-muted-foreground">
                    <span className="font-medium text-foreground">Image (hero / social):</span> og:image, twitter:image; JSON-LD primaryImageOfPage. Set in Media tab.
                    <span className="block text-xs text-muted-foreground mt-0.5">Ref: §1.2, §1.3, §2, §3.</span>
                  </p>
                  <p className="text-muted-foreground">
                    <span className="font-medium text-foreground">Image alt:</span> og:image:alt, twitter:image:alt; accessibility. Set in Media tab.
                    <span className="block text-xs text-muted-foreground mt-0.5">Ref: §1.2, §1.3.</span>
                  </p>
                </CardContent>
              </Card>

              <Card className="border-primary/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    GEO (optional content) — §6
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Add when page has Q&A, steps, or blog. JSON-LD only; best practice per schema.org and doc.
                  </p>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <p className="text-muted-foreground">
                    <span className="font-medium text-foreground">FAQPage:</span> Add when page has Q&A. mainEntity: Question + acceptedAnswer (Answer with text). Answers 40–60 words recommended.
                    <span className="block text-xs text-muted-foreground mt-0.5">Ref: §6.2; schema.org FAQPage.</span>
                  </p>
                  <p className="text-muted-foreground">
                    <span className="font-medium text-foreground">HowTo:</span> Add when page has steps. step: HowToStep (name, text). Ordered list best practice.
                    <span className="block text-xs text-muted-foreground mt-0.5">Ref: §6.3; schema.org HowTo.</span>
                  </p>
                  <p className="text-muted-foreground">
                    <span className="font-medium text-foreground">Article:</span> For blog/news. author (Person), datePublished, dateModified (ISO 8601), publisher. Required for GEO freshness.
                    <span className="block text-xs text-muted-foreground mt-0.5">Ref: §6.4; schema.org Article.</span>
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
            </div>

            <div className="w-64 shrink-0 flex flex-col gap-4">
              <div className="sticky top-24 z-30 flex flex-col gap-4">
                <TabsList className="flex flex-col h-auto w-full bg-muted p-1.5 gap-1.5">
                  <TabsTrigger value="basic" className="w-full justify-start">
                    Basic
                  </TabsTrigger>
                  <TabsTrigger value="media" className="w-full justify-start">
                    Media
                  </TabsTrigger>
                  <TabsTrigger value="seo" className="w-full justify-start">
                    SEO
                  </TabsTrigger>
                  <TabsTrigger value="previews" className="w-full justify-start">
                    Search & Social Previews
                  </TabsTrigger>
                  <TabsTrigger value="generated-seo" className="w-full justify-start">
                    Generated SEO
                  </TabsTrigger>
                  <TabsTrigger value="default-value" className="w-full justify-start">
                    Defaults & ref
                  </TabsTrigger>
                </TabsList>
                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </Tabs>
      </div>
    </form>
  );
}
