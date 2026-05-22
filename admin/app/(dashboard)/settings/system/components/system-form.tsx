"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { messages } from "@/lib/messages";
import { Download, RefreshCw, Loader2 } from "lucide-react";
import { Section } from "../../_shared/section";
import { applyTechnicalDefaults } from "../../actions/seed-technical-defaults";
import { recalculateArticleCounts } from "../../actions/recalculate-article-counts";
import { getAllSettings, type AllSettings } from "../../actions/settings-actions";

interface RuleRow {
  label: string;
  key: keyof AllSettings;
  source: string;
  url: string | null;
}

const SEO_RULES: RuleRow[] = [
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
];

const BUSINESS_DEFAULTS: RuleRow[] = [
  { label: "Site URL", key: "siteUrl", source: "Business", url: null },
  { label: "Site Name", key: "siteName", source: "Business", url: null },
  { label: "Default Author", key: "siteAuthor", source: "Business", url: null },
  { label: "Content Language", key: "inLanguage", source: "ISO 639-1", url: "https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes" },
  { label: "Country", key: "orgAddressCountry", source: "ISO 3166-1", url: "https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2" },
  { label: "Area Served", key: "orgAreaServed", source: "ISO 3166-1", url: "https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2" },
  { label: "Contact Type", key: "orgContactType", source: "Schema.org", url: "https://schema.org/contactType" },
  { label: "Available Languages", key: "orgContactAvailableLanguage", source: "ISO 639-1", url: "https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes" },
  { label: "Search URL", key: "orgSearchUrlTemplate", source: "Schema.org", url: "https://schema.org/SearchAction" },
];

const TECHNICAL_DEFAULTS: RuleRow[] = [
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
];

interface Props {
  initialSettings: AllSettings;
}

export function SystemForm({ initialSettings }: Props) {
  const { toast } = useToast();
  const [settings, setSettings] = useState<AllSettings>(initialSettings);
  const [isApplying, startApplying] = useTransition();
  const [recalcResult, setRecalcResult] = useState<{ articlesUpdated?: number; error?: string } | null>(null);
  const [isRecalculating, startRecalculating] = useTransition();

  function handleApplyDefaults() {
    startApplying(async () => {
      const r = await applyTechnicalDefaults();
      if (r.success) {
        setSettings(await getAllSettings());
        toast({
          title: messages.success.updated,
          description: r.updated > 0 ? `تم تحديث ${r.updated} قيمة افتراضية` : "جميع القيم الافتراضية صحيحة",
          variant: "success",
        });
      } else {
        toast({ title: messages.error.operation_failed, description: r.error, variant: "destructive" });
      }
    });
  }

  function handleRecalculate() {
    startRecalculating(async () => {
      setRecalcResult(null);
      const res = await recalculateArticleCounts();
      if (res.success) setRecalcResult({ articlesUpdated: res.articlesUpdated });
      else setRecalcResult({ error: res.error });
    });
  }

  return (
    <div className="space-y-6">
      {/* Top action bar */}
      <div className="sticky top-14 z-20 -mx-4 px-4 py-2.5 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 mb-2 flex items-center justify-between gap-3 flex-wrap">
        <Badge variant="outline" className="text-emerald-500 border-emerald-500/30">
          Read Only — Press Apply to sync
        </Badge>
        <Button variant="outline" size="sm" onClick={handleApplyDefaults} disabled={isApplying} className="gap-2 h-8">
          {isApplying ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
          {isApplying ? "Applying..." : "Apply Defaults"}
        </Button>
      </div>

      <Section
        title="SEO Rules"
        description="Industry consensus from Semrush, Ahrefs, Moz, and X Docs. These limits drive validation across all entities."
      >
        <DefaultsTable rows={SEO_RULES} settings={settings} />
      </Section>

      <Section
        title="Business Defaults"
        description="Settings that depend on your business — stable for 6+ months."
      >
        <DefaultsTable rows={BUSINESS_DEFAULTS} settings={settings} />
      </Section>

      <Section
        title="Technical Defaults"
        description="Industry standards (charset, robots, OG types). Rarely change."
      >
        <DefaultsTable rows={TECHNICAL_DEFAULTS} settings={settings} />
      </Section>

      <Section
        title="Interaction Counts — Recalculation"
        description="Recalculates likes/dislikes/comments/favorites/views from actual relation records. Run after data migrations or if counts drift."
        action={
          <Button variant="outline" size="sm" onClick={handleRecalculate} disabled={isRecalculating} className="gap-2 h-8">
            {isRecalculating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
            {isRecalculating ? "Recalculating..." : "Recalculate"}
          </Button>
        }
      >
        {recalcResult ? (
          <p className={`text-xs ${recalcResult.error ? "text-rose-500" : "text-emerald-500"}`}>
            {recalcResult.error ? `Error: ${recalcResult.error}` : `Done — updated ${recalcResult.articlesUpdated} articles`}
          </p>
        ) : (
          <p className="text-xs text-muted-foreground">No recent run.</p>
        )}
      </Section>
    </div>
  );
}

function DefaultsTable({ rows, settings }: { rows: RuleRow[]; settings: AllSettings }) {
  return (
    <div className="rounded-md border overflow-hidden">
      <table className="w-full text-xs">
        <thead className="bg-muted/40">
          <tr>
            <th className="px-3 py-2 text-start font-medium text-muted-foreground w-[40%]">Setting</th>
            <th className="px-3 py-2 text-start font-medium text-muted-foreground w-[30%]">Value</th>
            <th className="px-3 py-2 text-start font-medium text-muted-foreground w-[30%]">Source</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => {
            const value = (settings as unknown as Record<string, unknown>)[r.key as string];
            return (
              <tr key={String(r.key)} className="border-t hover:bg-muted/20 transition-colors">
                <td className="px-3 py-1.5 text-foreground">{r.label}</td>
                <td className="px-3 py-1.5 font-mono text-foreground/80">{value === null || value === undefined || value === "" ? "—" : String(value)}</td>
                <td className="px-3 py-1.5">
                  {r.url ? (
                    <a href={r.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                      {r.source}
                    </a>
                  ) : (
                    <span className="text-muted-foreground">{r.source}</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
