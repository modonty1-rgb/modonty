import { getJsonLdIntegrityStats } from "./actions/jsonld-integrity";
import { getCanonicalUrlSanitizerStats } from "./actions/canonical-url-sanitizer";
import { getSitemapFreshnessStats } from "./actions/sitemap-freshness";
import { getArticlesSeoHealth } from "./actions/articles-seo-actions";
import { getModontyAuthorSeoHealth } from "./actions/author-seo-repair";
import { SeoPageShell } from "./components/seo-page-shell";

export const metadata = {
  title: "SEO — Modonty Admin",
};

export default async function SeoPage() {
  const [jsonLd, canonical, sitemap, articles, authorHealth] = await Promise.all([
    getJsonLdIntegrityStats(),
    getCanonicalUrlSanitizerStats(),
    getSitemapFreshnessStats(),
    getArticlesSeoHealth(),
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
      articles={articles}
    />
  );
}
