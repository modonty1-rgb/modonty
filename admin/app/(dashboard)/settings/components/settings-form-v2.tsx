"use client";

import { useState, useEffect, useCallback } from "react";
import NextImage from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useToast } from "@/hooks/use-toast";
import { messages } from "@/lib/messages";
import { Building2, Shield, RefreshCw, Download, Info } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  getAllSettings,
  saveSiteSettings,
  saveOrganizationSettings,
  saveTrackingSettings,
  saveSocialMediaSettings,
  saveMediaSettings,
  saveModontySettings,
  type AllSettings,
} from "../actions/settings-actions";
import { applyTechnicalDefaults } from "../actions/seed-technical-defaults";

// ─── Best Practice Info per field ───
interface BestPractice {
  title: string;
  recommended: string;
  details: string[];
  sources: { name: string; url: string }[];
}

const BEST_PRACTICES: Record<string, BestPractice> = {
  seoTitle: {
    title: "SEO Title Best Practices",
    recommended: "50-60 characters",
    details: [
      "Google does not have an official character limit — it truncates by pixel width (~600px on desktop, ~500px on mobile).",
      "Semrush recommends 550 pixels or fewer, typically 50-60 characters.",
      "Ahrefs recommends 60 characters / 600 pixels.",
      "Zyppy research suggests 55 characters (~580px) for safe display across all devices.",
      "Google rewrites titles ~76% of the time, pulling from og:title, headings, or page content.",
      "Front-load your most important keywords — truncation cuts from the end.",
    ],
    sources: [
      { name: "Google Search Central — Title Links", url: "https://developers.google.com/search/docs/appearance/title-link" },
      { name: "Semrush — Title Tag Guide", url: "https://www.semrush.com/blog/title-tag/" },
      { name: "Ahrefs — Title Tags for SEO", url: "https://ahrefs.com/blog/title-tag-seo/" },
      { name: "Zyppy — Title Tag Length Study", url: "https://zyppy.com/title-tags/meta-title-tag-length/" },
    ],
  },
  seoDescription: {
    title: "SEO Description Best Practices",
    recommended: "120-160 characters",
    details: [
      "Google has no official character limit — snippets are truncated to fit the device width.",
      "Desktop shows up to ~155-160 characters before truncation.",
      "Mobile shows up to ~120-135 characters before truncation.",
      "Semrush mobile-safe zone: 105-135 characters.",
      "Ahrefs recommends 160 for desktop, 120 for mobile.",
      "Google rewrites 60-70% of meta descriptions using page content.",
      "Write compelling copy — this is your ad copy in search results.",
    ],
    sources: [
      { name: "Google Search Central — Snippets", url: "https://developers.google.com/search/docs/appearance/snippet" },
      { name: "Semrush — Meta Description Guide", url: "https://www.semrush.com/blog/meta-description/" },
      { name: "Ahrefs — Meta Description", url: "https://ahrefs.com/blog/meta-description/" },
    ],
  },
  twitter: {
    title: "Twitter / X Card Best Practices",
    recommended: "Title: max 70 chars | Description: max 200 chars",
    details: [
      "Twitter accepts up to 70 characters for title and 200 for description in the card markup.",
      "However, the card UI only displays ~47 characters of the title and ~85 of the description.",
      "Front-load important words — they will be visible on the card.",
      "If og:title and og:description are set, Twitter uses them as fallback — twitter:card is the only unique required tag.",
      "Use summary_large_image card type for content sites — shows a large image preview above text.",
    ],
    sources: [
      { name: "X Developer — Cards Markup", url: "https://developer.x.com/en/docs/twitter-for-websites/cards/overview/markup" },
      { name: "SharePreview — Twitter Meta Tags", url: "https://share-preview.com/blog/twitter-meta-tags" },
      { name: "OGTester — Title/Description Limits", url: "https://ogtester.com/blog/what-is-maximum-length-of-og-title-and-og-description" },
    ],
  },
  openGraph: {
    title: "Open Graph Best Practices",
    recommended: "Title: 40-60 chars | Description: up to 200 chars",
    details: [
      "The OG protocol (ogp.me) has no character limit — title and description are type String.",
      "Meta (Facebook) says: 'title without branding' and '2-4 sentences' for description.",
      "Facebook displays ~122 characters of og:title, LinkedIn ~119, WhatsApp ~81.",
      "Facebook may hide the description entirely if the title spans two lines.",
      "LinkedIn truncates description at ~69 characters, WhatsApp at ~81, Telegram at ~170.",
      "Always include og:image (1200x630px) — posts with images get significantly more engagement.",
    ],
    sources: [
      { name: "Open Graph Protocol — ogp.me", url: "https://ogp.me/" },
      { name: "Meta — Sharing for Webmasters", url: "https://developers.facebook.com/docs/sharing/webmasters/" },
      { name: "Ahrefs — Open Graph Meta Tags", url: "https://ahrefs.com/blog/open-graph-meta-tags/" },
      { name: "OGTester — OG Limits", url: "https://ogtester.com/blog/what-is-maximum-length-of-og-title-and-og-description" },
    ],
  },
};

function BestPracticeButton({ practiceKey }: { practiceKey: string }) {
  const bp = BEST_PRACTICES[practiceKey];
  if (!bp) return null;
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button type="button" className="inline-flex items-center gap-1 text-[10px] text-amber-500/80 hover:text-amber-400 transition-colors">
          <Info className="h-3 w-3" />
          Best practices
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-sm">{bp.title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="rounded-md bg-amber-500/10 border border-amber-500/20 px-3 py-2">
            <p className="text-sm font-medium text-amber-500">Recommended: {bp.recommended}</p>
          </div>
          <div className="space-y-2">
            {bp.details.map((d, i) => (
              <div key={i} className="flex gap-2 text-xs text-muted-foreground">
                <span className="text-amber-500/60 mt-0.5">-</span>
                <span>{d}</span>
              </div>
            ))}
          </div>
          <div className="border-t pt-3">
            <p className="text-xs font-medium mb-2">Sources</p>
            <div className="space-y-1">
              {bp.sources.map((s, i) => (
                <a key={i} href={s.url} target="_blank" rel="noopener noreferrer" className="block text-xs text-blue-400 hover:underline">{s.name}</a>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── SEO Rules (industry consensus, stable 5+ years) ───
const SEO_RULES_DISPLAY = [
  { label: "SEO Title Min", key: "seoTitleMin", source: "Semrush", url: "https://www.semrush.com/blog/title-tag/" },
  { label: "SEO Title Max", key: "seoTitleMax", source: "Semrush / Ahrefs", url: "https://ahrefs.com/blog/title-tag-seo/" },
  { label: "SEO Title Restrict", key: "seoTitleRestrict", source: "Yoast pattern", url: "https://yoast.com/what-is-a-title-tag/" },
  { label: "SEO Desc Min", key: "seoDescriptionMin", source: "Semrush", url: "https://www.semrush.com/blog/meta-description/" },
  { label: "SEO Desc Max", key: "seoDescriptionMax", source: "Moz / Semrush", url: "https://moz.com/learn/seo/meta-description" },
  { label: "SEO Desc Restrict", key: "seoDescriptionRestrict", source: "Yoast pattern", url: "https://yoast.com/meta-descriptions/" },
  { label: "X Title Max", key: "twitterTitleMax", source: "X Docs", url: "https://developer.x.com/en/docs/twitter-for-websites/cards/overview/markup" },
  { label: "X Title Restrict", key: "twitterTitleRestrict", source: "Soft warning", url: null },
  { label: "X Desc Max", key: "twitterDescriptionMax", source: "X Docs", url: "https://developer.x.com/en/docs/twitter-for-websites/cards/overview/markup" },
  { label: "X Desc Restrict", key: "twitterDescriptionRestrict", source: "Soft warning", url: null },
  { label: "OG Title Max", key: "ogTitleMax", source: "Meta", url: "https://developers.facebook.com/docs/sharing/webmasters/" },
  { label: "OG Title Restrict", key: "ogTitleRestrict", source: "Soft warning", url: null },
  { label: "OG Desc Max", key: "ogDescriptionMax", source: "Meta", url: "https://developers.facebook.com/docs/sharing/webmasters/" },
  { label: "OG Desc Restrict", key: "ogDescriptionRestrict", source: "Soft warning", url: null },
] as const;

// ─── Business defaults (stable 6+ months) ───
const BUSINESS_DEFAULTS = [
  { label: "Site URL", key: "siteUrl", source: "Business", url: null },
  { label: "Site Name", key: "siteName", source: "Business", url: null },
  { label: "Default Author", key: "siteAuthor", source: "Business", url: null },
  { label: "Content Language", key: "inLanguage", source: "ISO 639-1", url: "https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes" },
  { label: "Country", key: "orgAddressCountry", source: "ISO 3166-1", url: "https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2" },
  { label: "Area Served", key: "orgAreaServed", source: "ISO 3166-1", url: "https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2" },
  { label: "Contact Type", key: "orgContactType", source: "Schema.org", url: "https://schema.org/contactType" },
  { label: "Available Languages", key: "orgContactAvailableLanguage", source: "ISO 639-1", url: "https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes" },
  { label: "Search URL", key: "orgSearchUrlTemplate", source: "Schema.org", url: "https://schema.org/SearchAction" },
] as const;

// ─── System defaults — read-only table ───
const SYSTEM_DEFAULTS = [
  { label: "Page Charset", key: "defaultCharset", source: "WHATWG", url: "https://html.spec.whatwg.org/multipage/semantics.html#charset" },
  { label: "Robots Directive", key: "defaultMetaRobots", source: "Google", url: "https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag" },
  { label: "Googlebot Directive", key: "defaultGooglebot", source: "Google", url: "https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag" },
  { label: "Open Graph Type", key: "defaultOgType", source: "OGP", url: "https://ogp.me/" },
  { label: "Open Graph Locale", key: "defaultOgLocale", source: "OGP", url: "https://ogp.me/" },
  { label: "OG Determiner", key: "defaultOgDeterminer", source: "OGP", url: "https://ogp.me/" },
  { label: "Twitter Card Type", key: "defaultTwitterCard", source: "X Docs", url: "https://developer.x.com/en/docs/twitter-for-websites/cards/overview/markup" },
  { label: "OG Image Type", key: "defaultOgImageType", source: "Meta", url: "https://developers.facebook.com/docs/sharing/webmasters/" },
  { label: "OG Image Width", key: "defaultOgImageWidth", source: "Meta", url: "https://developers.facebook.com/docs/sharing/webmasters/" },
  { label: "OG Image Height", key: "defaultOgImageHeight", source: "Meta", url: "https://developers.facebook.com/docs/sharing/webmasters/" },
  { label: "Hreflang", key: "defaultHreflang", source: "Google", url: "https://developers.google.com/search/docs/specialty/international/localized-versions" },
  { label: "No Translate", key: "defaultNotranslate", source: "Google", url: "https://developers.google.com/search/docs/crawling-indexing/special-tags" },
  { label: "Referrer Policy", key: "defaultReferrerPolicy", source: "MDN", url: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Referrer-Policy" },
  { label: "Sitemap Priority", key: "defaultSitemapPriority", source: "Google", url: "https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap" },
  { label: "Sitemap Frequency", key: "defaultSitemapChangeFreq", source: "Google", url: "https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap" },
  { label: "Article Sitemap Priority", key: "articleDefaultSitemapPriority", source: "Google", url: "https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap" },
  { label: "Article Sitemap Freq", key: "articleDefaultSitemapChangeFreq", source: "Google", url: "https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap" },
  { label: "License", key: "defaultLicense", source: "CC", url: "https://creativecommons.org/licenses/by/4.0/" },
  { label: "Free Access", key: "defaultIsAccessibleForFree", source: "Schema.org", url: "https://schema.org/isAccessibleForFree" },
  { label: "Default Pathname", key: "defaultPathname", source: "Next.js", url: "https://nextjs.org/docs/app/api-reference/functions/generate-metadata" },
  { label: "Truncation Suffix", key: "defaultTruncationSuffix", source: "UX", url: null },
] as const;

// ─── Helpers ───
function val(settings: AllSettings, key: string): string {
  return (settings as unknown as Record<string, unknown>)[key] as string || "";
}

function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <Input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
    </div>
  );
}

function ImageField({ label, value, onChange, hint, aspectRatio = "auto" }: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  hint?: string;
  aspectRatio?: "auto" | "square" | "og";
}) {
  const [imgError, setImgError] = useState(false);
  const hasUrl = value.trim().length > 0;
  const previewSize = aspectRatio === "og" ? "h-16 w-28" : aspectRatio === "square" ? "h-12 w-12" : "h-12 w-12";

  const handleChange = useCallback((v: string) => {
    setImgError(false);
    onChange(v);
  }, [onChange]);

  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <div className="flex gap-2 items-start">
        <Input value={value} onChange={(e) => handleChange(e.target.value)} placeholder="https://res.cloudinary.com/..." className="flex-1" />
        <div className={`${previewSize} shrink-0 rounded-md border border-border bg-muted/30 overflow-hidden flex items-center justify-center`}>
          {hasUrl && !imgError ? (
            <NextImage
              src={value}
              alt={label}
              width={aspectRatio === "og" ? 112 : 48}
              height={aspectRatio === "og" ? 64 : 48}
              className="object-cover w-full h-full"
              onError={() => setImgError(true)}
              unoptimized
            />
          ) : (
            <span className="text-[9px] text-muted-foreground">{hasUrl && imgError ? "Error" : "No image"}</span>
          )}
        </div>
      </div>
      {hint && <p className="text-[10px] text-amber-500/70">{hint}</p>}
    </div>
  );
}

// ─── SEO Pages Config ───
const SEO_PAGES = [
  { key: "home", name: "Home", description: "Main landing page", color: "blue", titleKey: "modontySeoTitle", descKey: "modontySeoDescription", jsonLdType: "WebPage + Organization" },
  { key: "clients", name: "Clients", description: "All clients listing", color: "emerald", titleKey: "clientsSeoTitle", descKey: "clientsSeoDescription", jsonLdType: "CollectionPage + ItemList" },
  { key: "categories", name: "Categories", description: "All categories listing", color: "amber", titleKey: "categoriesSeoTitle", descKey: "categoriesSeoDescription", jsonLdType: "CollectionPage + ItemList" },
  { key: "tags", name: "Tags", description: "All tags listing", color: "sky", titleKey: "tagsSeoTitle", descKey: "tagsSeoDescription", jsonLdType: "CollectionPage + ItemList" },
  { key: "industries", name: "Industries", description: "All industries listing", color: "violet", titleKey: "industriesSeoTitle", descKey: "industriesSeoDescription", jsonLdType: "CollectionPage + ItemList" },
  { key: "articles", name: "Articles", description: "All articles listing", color: "orange", titleKey: "articlesSeoTitle", descKey: "articlesSeoDescription", jsonLdType: "CollectionPage + ItemList" },
  { key: "trending", name: "Trending", description: "Most popular articles", color: "rose", titleKey: "trendingSeoTitle", descKey: "trendingSeoDescription", jsonLdType: "CollectionPage + ItemList" },
] as const;

function getPageCacheInfo(settings: AllSettings, pageKey: string): { hasCache: boolean; timeAgo: string; metaTags: unknown; jsonLd: unknown } {
  const s = settings as unknown as Record<string, unknown>;
  switch (pageKey) {
    case "home":
      return { hasCache: !!s.homeMetaTags || !!s.jsonLdStructuredData, timeAgo: formatTimeAgo(s.jsonLdLastGenerated as string | null), metaTags: s.homeMetaTags, jsonLd: s.jsonLdStructuredData };
    case "clients":
      return { hasCache: !!s.clientsPageMetaTags || !!s.clientsPageJsonLdStructuredData, timeAgo: formatTimeAgo(s.clientsPageJsonLdLastGenerated as string | null), metaTags: s.clientsPageMetaTags, jsonLd: s.clientsPageJsonLdStructuredData };
    case "categories":
      return { hasCache: !!s.categoriesPageMetaTags || !!s.categoriesPageJsonLdStructuredData, timeAgo: formatTimeAgo(s.categoriesPageJsonLdLastGenerated as string | null), metaTags: s.categoriesPageMetaTags, jsonLd: s.categoriesPageJsonLdStructuredData };
    case "trending":
      return { hasCache: !!s.trendingPageMetaTags || !!s.trendingPageJsonLdStructuredData, timeAgo: formatTimeAgo(s.trendingPageJsonLdLastGenerated as string | null), metaTags: s.trendingPageMetaTags, jsonLd: s.trendingPageJsonLdStructuredData };
    case "tags":
      return { hasCache: !!s.tagsPageMetaTags || !!s.tagsPageJsonLdStructuredData, timeAgo: formatTimeAgo(s.tagsPageJsonLdLastGenerated as string | null), metaTags: s.tagsPageMetaTags, jsonLd: s.tagsPageJsonLdStructuredData };
    case "industries":
      return { hasCache: !!s.industriesPageMetaTags || !!s.industriesPageJsonLdStructuredData, timeAgo: formatTimeAgo(s.industriesPageJsonLdLastGenerated as string | null), metaTags: s.industriesPageMetaTags, jsonLd: s.industriesPageJsonLdStructuredData };
    case "articles":
      return { hasCache: !!s.articlesPageMetaTags || !!s.articlesPageJsonLdStructuredData, timeAgo: formatTimeAgo(s.articlesPageJsonLdLastGenerated as string | null), metaTags: s.articlesPageMetaTags, jsonLd: s.articlesPageJsonLdStructuredData };
    default:
      return { hasCache: false, timeAgo: "Never", metaTags: null, jsonLd: null };
  }
}

// ─── Page Cache Card ───
const COLOR_MAP: Record<string, { border: string; bg: string; text: string; dot: string }> = {
  blue:    { border: "border-blue-500/20", bg: "bg-blue-500/5", text: "text-blue-400", dot: "bg-blue-400" },
  emerald: { border: "border-emerald-500/20", bg: "bg-emerald-500/5", text: "text-emerald-400", dot: "bg-emerald-400" },
  amber:   { border: "border-amber-500/20", bg: "bg-amber-500/5", text: "text-amber-400", dot: "bg-amber-400" },
  sky:     { border: "border-sky-500/20", bg: "bg-sky-500/5", text: "text-sky-400", dot: "bg-sky-400" },
  violet:  { border: "border-violet-500/20", bg: "bg-violet-500/5", text: "text-violet-400", dot: "bg-violet-400" },
  rose:    { border: "border-rose-500/20", bg: "bg-rose-500/5", text: "text-rose-400", dot: "bg-rose-400" },
  orange:  { border: "border-orange-500/20", bg: "bg-orange-500/5", text: "text-orange-400", dot: "bg-orange-400" },
};

function formatTimeAgo(dateStr: string | null): string {
  if (!dateStr) return "Never";
  try {
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return "Never";
    const diff = Date.now() - d.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "now";
    if (mins < 60) return `${mins} min`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs} hr`;
    const days = Math.floor(hrs / 24);
    return `${days} day`;
  } catch { return "Never"; }
}

function PageCacheCard({ name, description, color, lastGenerated, hasCache }: {
  name: string;
  description: string;
  color: string;
  lastGenerated: string | null;
  hasCache: boolean;
}) {
  const c = COLOR_MAP[color] || COLOR_MAP.blue;
  const timeAgo = formatTimeAgo(lastGenerated);

  return (
    <div className={`rounded-lg border ${c.border} ${c.bg} p-3 space-y-2`}>
      <div className="flex items-center justify-between">
        <p className={`text-xs font-medium ${c.text}`}>{name}</p>
        <div className="flex items-center gap-1.5">
          <div className={`h-1.5 w-1.5 rounded-full ${hasCache ? c.dot : "bg-muted-foreground/30"}`} />
          <span className={`text-[10px] ${hasCache ? c.text : "text-muted-foreground"}`}>{timeAgo}</span>
        </div>
      </div>
      <p className="text-[10px] text-muted-foreground leading-relaxed">{description}</p>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" className="h-7 text-[10px] flex-1" disabled>Preview</Button>
        <Button variant="outline" size="sm" className="h-7 text-[10px] flex-1" disabled>Generate</Button>
      </div>
    </div>
  );
}

// ─── Main ───
export function SettingsFormV2() {
  const { toast } = useToast();
  const [settings, setSettings] = useState<AllSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    getAllSettings()
      .then((data) => { setSettings(data); setIsLoading(false); })
      .catch(() => {
        toast({ title: messages.error.server_error, description: messages.descriptions.settings_load_failed, variant: "destructive" });
        setIsLoading(false);
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function set(field: string, value: unknown) {
    if (!settings) return;
    setSettings({ ...settings, [field]: value });
  }

  async function saveModonty() {
    if (!settings) return;
    setIsSaving(true);
    const results = await Promise.all([
      saveSiteSettings(settings),
      saveOrganizationSettings(settings),
      saveTrackingSettings(settings),
      saveSocialMediaSettings(settings),
      saveMediaSettings(settings),
      saveModontySettings(settings),
    ]);
    const ok = results.every((r) => r.success);
    toast({ title: ok ? messages.success.saved : messages.error.update_failed, description: ok ? "تم حفظ الإعدادات بنجاح" : "فشل حفظ بعض الإعدادات", variant: ok ? "success" : "destructive" });
    setIsSaving(false);
  }

  async function handleApplyDefaults() {
    setIsSaving(true);
    const r = await applyTechnicalDefaults();
    if (r.success) {
      setSettings(await getAllSettings());
      toast({ title: messages.success.updated, description: r.updated > 0 ? `تم تحديث ${r.updated} قيمة افتراضية` : "جميع القيم الافتراضية صحيحة", variant: "success" });
    } else {
      toast({ title: messages.error.operation_failed, description: r.error, variant: "destructive" });
    }
    setIsSaving(false);
  }

  if (isLoading || !settings) return <div className="py-8 text-center text-muted-foreground">Loading settings...</div>;

  return (
    <Tabs defaultValue="modonty" className="w-full">
      <TabsList className="w-full justify-start gap-1 mb-4">
        <TabsTrigger value="modonty" className="gap-2"><Building2 className="h-4 w-4" />Modonty</TabsTrigger>
        <TabsTrigger value="seo-cache" className="gap-2"><RefreshCw className="h-4 w-4" />SEO Cache</TabsTrigger>
        <TabsTrigger value="system" className="gap-2 ms-auto opacity-60 hover:opacity-100"><Shield className="h-3.5 w-3.5" />System</TabsTrigger>
      </TabsList>

      {/* ═══════════════════════════════════════════════ */}
      {/* TAB 1 — Modonty                                */}
      {/* Site identity, contact, address, social, etc.   */}
      {/* ═══════════════════════════════════════════════ */}
      <TabsContent value="modonty">
        <Accordion type="multiple" defaultValue={["branding", "contact", "social", "tracking"]} className="space-y-2">

          {/* ── Branding & Images (blue) ── */}
          <AccordionItem value="branding" className="rounded-lg border border-blue-500/20 bg-blue-500/5 px-3">
            <AccordionTrigger className="py-2 text-xs font-medium text-blue-400 hover:no-underline">Branding & Images</AccordionTrigger>
            <AccordionContent className="space-y-2 pb-3">
              <div>
                <Label className="text-xs text-muted-foreground">Brand Description</Label>
                <Textarea value={settings.brandDescription || ""} onChange={(e) => set("brandDescription", e.target.value)} className="mt-1 h-14" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <ImageField label="Logo" value={settings.logoUrl || ""} onChange={(v) => set("logoUrl", v)} hint="Cloudinary: f_auto,q_auto,w_200,h_200,c_fit — min 112x112px" aspectRatio="square" />
                <ImageField label="Org Logo (JSON-LD)" value={settings.orgLogoUrl || ""} onChange={(v) => set("orgLogoUrl", v)} hint="Organization schema — f_auto,q_auto,w_512,h_512,c_fit" aspectRatio="square" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <ImageField label="Default Share Image (OG)" value={settings.ogImageUrl || ""} onChange={(v) => set("ogImageUrl", v)} hint="1200x630 — f_auto,q_auto,w_1200,h_630,c_fill" aspectRatio="og" />
                <Field label="Image Alt Text" value={settings.altImage || ""} onChange={(v) => set("altImage", v)} placeholder="Modonty — Arabic content platform" />
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* ── Contact & Address (emerald) ── */}
          <AccordionItem value="contact" className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-3">
            <AccordionTrigger className="py-2 text-xs font-medium text-emerald-400 hover:no-underline">Contact & Address — Google Knowledge Panel</AccordionTrigger>
            <AccordionContent className="space-y-2 pb-3">
              <div className="grid grid-cols-4 gap-3">
                <Field label="Email" value={settings.orgContactEmail || ""} onChange={(v) => set("orgContactEmail", v)} />
                <Field label="Phone" value={settings.orgContactTelephone || ""} onChange={(v) => set("orgContactTelephone", v)} placeholder="+966500000000" />
                <Field label="Contact Option" value={settings.orgContactOption || ""} onChange={(v) => set("orgContactOption", v)} placeholder="TollFree" />
                <Field label="Working Hours" value={settings.orgContactHoursAvailable || ""} onChange={(v) => set("orgContactHoursAvailable", v)} placeholder="Su-Th 09:00-18:00" />
              </div>
              <div className="grid grid-cols-4 gap-3">
                <Field label="Street" value={settings.orgStreetAddress || ""} onChange={(v) => set("orgStreetAddress", v)} />
                <Field label="City" value={settings.orgAddressLocality || ""} onChange={(v) => set("orgAddressLocality", v)} />
                <Field label="Region" value={settings.orgAddressRegion || ""} onChange={(v) => set("orgAddressRegion", v)} />
                <Field label="Postal Code" value={settings.orgPostalCode || ""} onChange={(v) => set("orgPostalCode", v)} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Latitude</Label>
                  <Input type="number" step="any" value={settings.orgGeoLatitude ?? ""} onChange={(e) => set("orgGeoLatitude", e.target.value ? parseFloat(e.target.value) : null)} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Longitude</Label>
                  <Input type="number" step="any" value={settings.orgGeoLongitude ?? ""} onChange={(e) => set("orgGeoLongitude", e.target.value ? parseFloat(e.target.value) : null)} />
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* ── Social + Twitter Cards (sky) ── */}
          <AccordionItem value="social" className="rounded-lg border border-sky-500/20 bg-sky-500/5 px-3">
            <AccordionTrigger className="py-2 text-xs font-medium text-sky-400 hover:no-underline">Social Media & Twitter Cards</AccordionTrigger>
            <AccordionContent className="space-y-2 pb-3">
              <div className="grid grid-cols-4 gap-3">
                <Field label="Twitter / X" value={settings.twitterUrl || ""} onChange={(v) => set("twitterUrl", v)} />
                <Field label="LinkedIn" value={settings.linkedInUrl || ""} onChange={(v) => set("linkedInUrl", v)} />
                <Field label="Facebook" value={settings.facebookUrl || ""} onChange={(v) => set("facebookUrl", v)} />
                <Field label="Instagram" value={settings.instagramUrl || ""} onChange={(v) => set("instagramUrl", v)} />
              </div>
              <div className="grid grid-cols-4 gap-3">
                <Field label="YouTube" value={settings.youtubeUrl || ""} onChange={(v) => set("youtubeUrl", v)} />
                <Field label="TikTok" value={settings.tiktokUrl || ""} onChange={(v) => set("tiktokUrl", v)} />
                <Field label="Pinterest" value={settings.pinterestUrl || ""} onChange={(v) => set("pinterestUrl", v)} />
                <Field label="Snapchat" value={settings.snapchatUrl || ""} onChange={(v) => set("snapchatUrl", v)} />
              </div>
              <div className="grid grid-cols-4 gap-3">
                <Field label="X Site Handle" value={settings.twitterSite || ""} onChange={(v) => set("twitterSite", v)} placeholder="@modonty" />
                <Field label="X Creator Handle" value={settings.twitterCreator || ""} onChange={(v) => set("twitterCreator", v)} placeholder="@modonty" />
                <Field label="X Site ID (opt)" value={settings.twitterSiteId || ""} onChange={(v) => set("twitterSiteId", v)} />
                <Field label="X Creator ID (opt)" value={settings.twitterCreatorId || ""} onChange={(v) => set("twitterCreatorId", v)} />
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* ── Tracking + Search (violet) ── */}
          <AccordionItem value="tracking" className="rounded-lg border border-violet-500/20 bg-violet-500/5 px-3">
            <AccordionTrigger className="py-2 text-xs font-medium text-violet-400 hover:no-underline">Tracking & Site Search</AccordionTrigger>
            <AccordionContent className="space-y-2 pb-3">
              <div className="grid grid-cols-4 gap-3 items-end">
                <Field label="GTM ID" value={settings.gtmContainerId || ""} onChange={(v) => set("gtmContainerId", v)} placeholder="GTM-XXXXXXX" />
                <div className="flex items-center gap-2 pb-1">
                  <Checkbox checked={settings.gtmEnabled} onCheckedChange={(c) => set("gtmEnabled", !!c)} />
                  <Label className="text-xs">Enable GTM</Label>
                </div>
                <Field label="Hotjar ID" value={settings.hotjarSiteId || ""} onChange={(v) => set("hotjarSiteId", v)} />
                <div className="flex items-center gap-2 pb-1">
                  <Checkbox checked={settings.hotjarEnabled} onCheckedChange={(c) => set("hotjarEnabled", !!c)} />
                  <Label className="text-xs">Enable Hotjar</Label>
                </div>
              </div>
              <Field label="Site Search URL" value={settings.orgSearchUrlTemplate || ""} onChange={(v) => set("orgSearchUrlTemplate", v)} placeholder="https://modonty.com/search?q={search_term_string}" />
            </AccordionContent>
          </AccordionItem>


        </Accordion>
        <Button onClick={saveModonty} disabled={isSaving} className="mt-3">{isSaving ? "Saving..." : "Save Modonty Settings"}</Button>
      </TabsContent>

      {/* ═══════════════════════════════════════════════ */}
      {/* TAB 3 — System (Read-Only Technical Defaults)  */}
      {/* ═══════════════════════════════════════════════ */}
      <TabsContent value="system" className="space-y-3">
        <div className="flex items-center justify-between mb-1">
          <Badge variant="outline" className="text-green-500 border-green-500/30">Read Only — Press Apply to sync</Badge>
          <Button variant="outline" size="sm" onClick={handleApplyDefaults} disabled={isSaving} className="gap-2">
            <Download className="h-3.5 w-3.5" />
            {isSaving ? "Applying..." : "Apply Defaults"}
          </Button>
        </div>

        {/* SEO Rules (blue) */}
        <div className="rounded-lg border border-blue-500/20 bg-blue-500/5 p-3">
          <p className="text-xs font-medium text-blue-400 mb-2">SEO Rules — industry consensus (Semrush, Ahrefs, Moz, X Docs)</p>
          <div className="rounded-md border border-blue-500/10 overflow-hidden">
            <table className="w-full text-xs">
              <tbody>
                {SEO_RULES_DISPLAY.map(({ label, key, source, url }) => (
                  <tr key={key} className="border-b border-blue-500/10 last:border-b-0">
                    <td className="px-3 py-1.5 w-[35%]">{label}</td>
                    <td className="px-3 py-1.5 font-mono text-blue-400 w-[25%]">{String((settings as unknown as Record<string, unknown>)[key] ?? "—")}</td>
                    <td className="px-3 py-1.5 w-[40%]">{url ? <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">{source}</a> : <span className="text-muted-foreground">{source}</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Business Defaults (amber) */}
        <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-3">
          <p className="text-xs font-medium text-amber-400 mb-2">Business Defaults — stable for 6+ months</p>
          <div className="rounded-md border border-amber-500/10 overflow-hidden">
            <table className="w-full text-xs">
              <tbody>
                {BUSINESS_DEFAULTS.map(({ label, key, source, url }) => (
                  <tr key={key} className="border-b border-amber-500/10 last:border-b-0">
                    <td className="px-3 py-1.5 w-[35%]">{label}</td>
                    <td className="px-3 py-1.5 font-mono text-amber-400 w-[40%]">{String((settings as unknown as Record<string, unknown>)[key] ?? "—")}</td>
                    <td className="px-3 py-1.5 w-[25%]">{url ? <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">{source}</a> : <span className="text-muted-foreground">{source}</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Technical Defaults (green) */}
        <div className="rounded-lg border border-green-500/20 bg-green-500/5 p-3">
          <p className="text-xs font-medium text-green-400 mb-2">Technical Defaults — industry standards, never change</p>
          <div className="rounded-md border border-green-500/10 overflow-hidden">
            <table className="w-full text-xs">
              <tbody>
                {SYSTEM_DEFAULTS.map(({ label, key, source, url }) => (
                  <tr key={key} className="border-b border-green-500/10 last:border-b-0">
                    <td className="px-3 py-1.5 w-[35%]">{label}</td>
                    <td className="px-3 py-1.5 font-mono text-green-400 w-[40%]">{String((settings as unknown as Record<string, unknown>)[key] ?? "—")}</td>
                    <td className="px-3 py-1.5 w-[25%]">{url ? <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">{source}</a> : <span className="text-muted-foreground">{source}</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </TabsContent>

      {/* ═══════════════════════════════════════════════ */}
      {/* TAB 4 — SEO Cache (Generate M/J)               */}
      {/* ═══════════════════════════════════════════════ */}
      <TabsContent value="seo-cache">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs text-muted-foreground">SEO Cache — Meta Tags + JSON-LD per listing page</p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled={isSaving} className="gap-2" onClick={async () => {
              setIsSaving(true);
              try {
                const { regenerateAllEntitySeoCache } = await import("../actions/regenerate-all-seo");
                const result = await regenerateAllEntitySeoCache();
                alert(`تم توليد SEO للعناصر:\nالفئات: ${result.categories.successful}/${result.categories.total}\nالوسوم: ${result.tags.successful}/${result.tags.total}\nالصناعات: ${result.industries.successful}/${result.industries.total}`);
              } catch (e) { console.error("Entity SEO gen failed:", e); }
              setIsSaving(false);
            }}>
              <RefreshCw className={`h-3.5 w-3.5 ${isSaving ? "animate-spin" : ""}`} />
              {isSaving ? "جاري التوليد..." : "توليد SEO العناصر"}
            </Button>
            <Button variant="outline" size="sm" disabled={isSaving} className="gap-2" onClick={async () => {
              setIsSaving(true);
              try {
                const { regenerateAllListingCaches } = await import("@/lib/seo/listing-page-seo-generator");
                await regenerateAllListingCaches();
                window.location.reload();
              } catch (e) { console.error("Generate All failed:", e); }
              setIsSaving(false);
            }}>
              <RefreshCw className={`h-3.5 w-3.5 ${isSaving ? "animate-spin" : ""}`} />
              {isSaving ? "Generating..." : "Generate All Listings"}
            </Button>
          </div>
        </div>

        <Tabs defaultValue="home" orientation="vertical" className="flex gap-3">
          {/* Sidebar */}
          <TabsList className="flex-col h-auto items-stretch gap-1 w-52 shrink-0 bg-transparent p-0 sticky top-4 self-start">
            {SEO_PAGES.map(({ key, name, color }) => {
              const c = COLOR_MAP[color] || COLOR_MAP.blue;
              const cacheInfo = getPageCacheInfo(settings, key);
              return (
                <TabsTrigger key={key} value={key} className={`justify-start gap-2 text-xs px-3 py-2 data-[state=active]:${c.bg} data-[state=active]:${c.border} data-[state=active]:border`}>
                  <div className={`h-1.5 w-1.5 rounded-full ${cacheInfo.hasCache ? c.dot : "bg-muted-foreground/30"}`} />
                  <span className="truncate">{name}</span>
                  <span className={`ms-auto text-[10px] shrink-0 ${cacheInfo.hasCache ? "text-green-500" : "text-muted-foreground/50"}`}>{cacheInfo.timeAgo}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          {/* Content per page */}
          <div className="flex-1 min-w-0">
            {SEO_PAGES.map(({ key, name, description, color, titleKey, descKey, jsonLdType }) => {
              const c = COLOR_MAP[color] || COLOR_MAP.blue;
              const cacheInfo = getPageCacheInfo(settings, key);
              return (
                <TabsContent key={key} value={key} className="mt-0">
                  <div className={`rounded-lg border ${c.border} ${c.bg} p-4 space-y-3`}>
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <div>
                        <p className={`text-sm font-medium ${c.text}`}>{name}</p>
                        <p className="text-[10px] text-muted-foreground">{description} — {jsonLdType}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={cacheInfo.hasCache ? `${c.text} border-current/30` : "text-muted-foreground"}>
                          {cacheInfo.hasCache ? `Cached ${cacheInfo.timeAgo}` : "Not generated"}
                        </Badge>
                        <Button variant="outline" size="sm" className="h-7 text-[10px]" disabled={isSaving} onClick={async () => {
                          setIsSaving(true);
                          try {
                            const gen = await import("@/lib/seo/listing-page-seo-generator");
                            const fnMap: Record<string, () => Promise<{ success: boolean }>> = {
                              home: gen.regenerateHomePageCache,
                              categories: gen.regenerateCategoriesListingCache,
                              tags: gen.regenerateTagsListingCache,
                              industries: gen.regenerateIndustriesListingCache,
                              clients: gen.regenerateClientsListingCache,
                              articles: gen.regenerateArticlesListingCache,
                              trending: gen.regenerateTrendingPageCache,
                            };
                            if (fnMap[key]) await fnMap[key]();
                            window.location.reload();
                          } catch (e) { console.error(`Generate ${key} failed:`, e); }
                          setIsSaving(false);
                        }}>Generate</Button>
                      </div>
                    </div>

                    {/* SEO Title + Description */}
                    {titleKey && descKey && (
                      <div className="grid grid-cols-2 gap-3">
                        <Field label="SEO Title" value={val(settings, titleKey)} onChange={(v) => set(titleKey, v)} placeholder={`${name} | Modonty`} />
                        <Field label="SEO Description" value={val(settings, descKey)} onChange={(v) => set(descKey, v)} placeholder={`Browse all ${name.toLowerCase()} on Modonty...`} />
                      </div>
                    )}

                    {/* Cache Preview */}
                    {cacheInfo.hasCache && (
                      <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="preview" className="border-none">
                          <AccordionTrigger className="py-1 text-[10px] text-muted-foreground hover:no-underline">View cached data</AccordionTrigger>
                          <AccordionContent>
                            <div className="space-y-2">
                              {cacheInfo.metaTags != null && (
                                <div>
                                  <p className="text-[10px] font-medium text-muted-foreground mb-1">Meta Tags</p>
                                  <pre className="text-[10px] font-mono bg-background/50 rounded-md p-2 overflow-auto max-h-40 whitespace-pre-wrap">{String(JSON.stringify(cacheInfo.metaTags, null, 2))}</pre>
                                </div>
                              )}
                              {cacheInfo.jsonLd != null && (
                                <div>
                                  <p className="text-[10px] font-medium text-muted-foreground mb-1">JSON-LD</p>
                                  <pre className="text-[10px] font-mono bg-background/50 rounded-md p-2 overflow-auto max-h-40 whitespace-pre-wrap">{typeof cacheInfo.jsonLd === "string" ? (() => { try { return JSON.stringify(JSON.parse(cacheInfo.jsonLd as string), null, 2); } catch { return String(cacheInfo.jsonLd); } })() : String(JSON.stringify(cacheInfo.jsonLd, null, 2))}</pre>
                                </div>
                              )}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    )}
                  </div>
                </TabsContent>
              );
            })}
          </div>
        </Tabs>

        <Button onClick={saveModonty} disabled={isSaving} className="mt-3">{isSaving ? "Saving..." : "Save Page SEO"}</Button>
      </TabsContent>
    </Tabs>
  );
}
