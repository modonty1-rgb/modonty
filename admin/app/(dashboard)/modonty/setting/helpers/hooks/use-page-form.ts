"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { messages } from "@/lib/messages";
import { updatePage } from "../../actions/page-actions";
import { generateModontyPageSEO } from "../../actions/generate-modonty-page-seo";
import { pageSchema, type PageFormData } from "../page-schema";
import type { SettingsDefaults } from "../../components/page-form";

function deriveInLanguageFromOgLocale(ogLocale: string | null | undefined): string {
  return (ogLocale ?? "ar_SA").split("_")[0] || "ar";
}

function toBcp47FromLocale(locale: string): string {
  const trimmed = locale.trim();
  if (!trimmed || trimmed.toLowerCase() === "x-default") return "x-default";
  const parts = trimmed.split(/[_-]/).filter(Boolean);
  if (parts.length === 0) return "";
  const language = parts[0].toLowerCase();
  const region = parts[1]?.toUpperCase();
  return region ? `${language}-${region}` : language;
}

function deriveAlternateLanguages(
  ogLocaleAlternate: string | null | undefined,
  canonicalUrl: string,
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
      const langSegment = hreflang.split("-")[0];
      const url =
        pathname === "/"
          ? `${base}/${langSegment}`
          : `${base}/${langSegment}${pathname.startsWith("/") ? pathname : `/${pathname}`}`;
      return { hreflang, url };
    })
    .filter((item): item is { hreflang: string; url: string } => item !== null);
}

export interface PageInitialData {
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
  alternateLanguages?: unknown;
  sitemapPriority?: number | null;
  sitemapChangeFreq?: string | null;
  inLanguage?: string | null;
  metaTags?: unknown;
  jsonLdStructuredData?: string | null;
  jsonLdLastGenerated?: string | Date | null;
  jsonLdValidationReport?: unknown;
}

interface UsePageFormParams {
  slug: string;
  initialData?: PageInitialData;
  settingsDefaults: SettingsDefaults;
  onRegenerated?: () => void;
}

function buildFormData(slug: string, initialData: PageInitialData | undefined, settingsDefaults: SettingsDefaults): PageFormData {
  const defaultCanonical = `${settingsDefaults.siteUrl}/${slug}`;
  const m = (initialData?.metaTags as Record<string, unknown> | undefined)?.organizationSeo as PageFormData["organizationSeo"] | undefined;
  const defaultLogo = settingsDefaults.logoUrl ?? "";

  return {
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
      if (m) return { ...m, organizationLogoUrl: m.organizationLogoUrl ?? defaultLogo };
      if (defaultLogo) return { organizationLogoUrl: defaultLogo };
      return undefined;
    })(),
  };
}

export function usePageForm({ slug, initialData, settingsDefaults, onRegenerated }: UsePageFormParams) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [seoGenerating, setSeoGenerating] = useState(false);
  const [formData, setFormData] = useState<PageFormData>(() =>
    buildFormData(slug, initialData, settingsDefaults)
  );

  useEffect(() => {
    setFormData(buildFormData(slug, initialData, settingsDefaults));
    setError(null);
  }, [slug, initialData, settingsDefaults]);

  const updateField = <K extends keyof PageFormData>(field: K, value: PageFormData[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleRegenerate = async () => {
    setSeoGenerating(true);
    try {
      const result = await generateModontyPageSEO(slug);
      if (result.success) {
        toast({ title: messages.success.updated, description: "SEO data regenerated successfully" });
        onRegenerated?.();
      } else {
        toast({ variant: "destructive", title: messages.error.server_error, description: "Could not regenerate SEO data. Please try again." });
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
      const derivedAlternateLanguages = deriveAlternateLanguages(
        formData.ogLocaleAlternate,
        fallbackCanonical,
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
        if (result.warning) {
          toast({
            variant: "destructive",
            title: messages.success.updated,
            description: result.warning,
          });
        } else {
          toast({
            title: messages.success.updated,
            description: "Page saved and SEO data regenerated",
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

  return {
    formData,
    loading,
    error,
    seoGenerating,
    updateField,
    handleSubmit,
    handleRegenerate,
  };
}
