import { getAllPagesSeoStatus } from "./actions/seo-overview-actions";
import { getArticlesSeoHealth } from "./actions/articles-seo-actions";
import { SeoOverviewClient } from "./seo-overview-client";
import { ArticlesSeoHealth } from "./articles-seo-health";

export default async function SeoOverviewPage() {
  const [pages, articlesSeoHealth] = await Promise.all([
    getAllPagesSeoStatus(),
    getArticlesSeoHealth(),
  ]);

  const listPages = pages.filter((p) => p.group === "list");
  const contentPages = pages.filter((p) => p.group === "content");

  const totalPages = pages.length;
  const withMeta = pages.filter((p) => p.hasMetaTags).length;
  const withJsonLd = pages.filter((p) => p.hasJsonLd).length;

  return (
    <div className="px-6 py-6 max-w-[1200px] mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold">SEO Overview</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Review SEO status for all pages and articles — meta tags, JSON-LD, and scores
          </p>
        </div>
      </div>

      <div className="space-y-6">
        <SeoOverviewClient
          listPages={listPages}
          contentPages={contentPages}
          stats={{ totalPages, withMeta, withJsonLd }}
        />

        <ArticlesSeoHealth articles={articlesSeoHealth} />
      </div>
    </div>
  );
}
