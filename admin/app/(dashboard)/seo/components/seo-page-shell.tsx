import { SeoHealthSummary } from "./seo-health-summary";
import { SeoKpiStrip } from "./seo-kpi-strip";
import { CascadeStatusPanel } from "./cascade-status-panel";
import { SeoAutoMaintenance } from "./seo-auto-maintenance";
import { ArticlesSeoHealth } from "./article-coverage-panel";
import type { ArticleSeoHealth } from "../actions/articles-seo-actions";

interface Props {
  publishedArticles: number;
  jsonLdCached: number;
  jsonLdStale: number;
  canonicalStale: number;
  sitemapsConfigured: boolean;
  sitemapsStale: number;
  attentionCount: number;
  articles: ArticleSeoHealth[];
}

export function SeoPageShell({
  publishedArticles,
  jsonLdCached,
  jsonLdStale,
  canonicalStale,
  sitemapsConfigured,
  sitemapsStale,
  attentionCount,
  articles,
}: Props) {
  return (
    <div className="max-w-[1200px] mx-auto space-y-4">
      <div>
        <h1 className="text-xl font-semibold leading-tight">SEO</h1>
        <p className="text-[11px] text-muted-foreground mt-0.5">
          Centralized SEO maintenance, cascade control, and article health
        </p>
      </div>

      <SeoHealthSummary
        jsonLdStale={jsonLdStale}
        canonicalStale={canonicalStale}
        sitemapsConfigured={sitemapsConfigured}
        sitemapsStale={sitemapsStale}
      />

      <SeoKpiStrip
        publishedArticles={publishedArticles}
        jsonLdCached={jsonLdCached}
        jsonLdStale={jsonLdStale}
        canonicalStale={canonicalStale}
      />

      <SeoAutoMaintenance attentionCount={attentionCount} />

      <CascadeStatusPanel />

      <ArticlesSeoHealth articles={articles} />
    </div>
  );
}
