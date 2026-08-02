import { getJsonLdIntegrityStats } from "./actions/jsonld-integrity";
import { getCanonicalUrlSanitizerStats } from "./actions/canonical-url-sanitizer";
import { getSitemapFreshnessStats } from "./actions/sitemap-freshness";
import { getModontyAuthorSeoHealth } from "./actions/author-seo-repair";
import { articleSeoQuality } from "@/lib/dashboard/cached";
import { SeoPageShell } from "./components/seo-page-shell";

export const metadata = {
  title: "SEO — Modonty Admin",
};

export default async function SeoPage() {
  const [jsonLd, canonical, sitemap, articleSeo, authorHealth] = await Promise.all([
    getJsonLdIntegrityStats(),
    getCanonicalUrlSanitizerStats(),
    getSitemapFreshnessStats(),
    // The same count the dashboard shows — this page links to the existing segment list
    // rather than rendering a third table of the same articles.
    articleSeoQuality(),
    getModontyAuthorSeoHealth(),
  ]);

  const attentionCount =
    (jsonLd.staleCount > 0 ? 1 : 0) +
    (canonical.staleCount > 0 ? 1 : 0) +
    (sitemap.configured && sitemap.staleCount > 0 ? 1 : 0) +
    (authorHealth.stale ? 1 : 0);

  return (
    <SeoPageShell
      publishedArticles={jsonLd.total}
      jsonLdCached={jsonLd.withCache}
      jsonLdStale={jsonLd.staleCount}
      canonicalStale={canonical.staleCount}
      sitemapsConfigured={sitemap.configured}
      sitemapsStale={sitemap.staleCount}
      attentionCount={attentionCount}
      articlesBelowPerfect={articleSeo.below}
      articlesPerfect={articleSeo.perfect}
    />
  );
}
