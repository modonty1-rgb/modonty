import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";

import { GoogleIcon } from "@/components/admin/icons/google-icon";
import { SeoKpiStrip } from "./seo-kpi-strip";
import { SeoFixSequence } from "./seo-fix-sequence";
import { SeoLiveSweepPanel } from "./seo-live-sweep-panel";

interface Props {
  publishedArticles: number;
  jsonLdCached: number;
  jsonLdStale: number;
  canonicalStale: number;
  sitemapsConfigured: boolean;
  sitemapsStale: number;
  attentionCount: number;
  articlesBelowPerfect: number;
  articlesPerfect: number;
}

export function SeoPageShell({
  publishedArticles,
  jsonLdCached,
  jsonLdStale,
  canonicalStale,
  sitemapsConfigured,
  sitemapsStale,
  attentionCount,
  articlesBelowPerfect,
  articlesPerfect,
}: Props) {
  return (
    <div className="max-w-[1200px] mx-auto space-y-4">
      <div>
        <h1 className="text-xl font-semibold leading-tight">SEO</h1>
        <p className="text-[11px] text-muted-foreground mt-0.5">
          Platform-wide SEO health and regeneration. Per-article work lives in Articles.
        </p>
      </div>

      <SeoKpiStrip
        publishedArticles={publishedArticles}
        jsonLdCached={jsonLdCached}
        jsonLdStale={jsonLdStale}
        canonicalStale={canonicalStale}
        sitemapsConfigured={sitemapsConfigured}
        sitemapsStale={sitemapsStale}
      />

      <SeoFixSequence attentionCount={attentionCount} />

      {/* الفحص يقيس ما يراه جوجل على الصفحة الحيّة — بخلاف البطاقات فوقه، فهي تقيس القاعدة.
          فالقاعدة قد تكون صحيحة والصفحة تعرض قديماً، وهذا ما يكشفه هذا الصفّ وحده. */}
      <SeoLiveSweepPanel />

      <ArticleSeoLink below={articlesBelowPerfect} perfect={articlesPerfect} />
    </div>
  );
}

/**
 * A link, not a table.
 *
 * This page used to render its own list of every article with a bulk "fix SEO" button.
 * Two better lists already exist — the sortable SEO column in /articles and the
 * /articles/segment/seo-imperfect view — and this one was the weakest of the three: capped
 * at 200 rows with no note saying so, so its counts quietly lied on a large library.
 *
 * The bulk fixer went with it on purpose. It generated a seoDescription by trimming the
 * excerpt, which lifts the score without a human ever writing the line — the opposite of
 * the rule that an article must be genuinely 100% before it gets indexed. Filling that gap
 * belongs in the editor and the publish gate, where a person sees what is being written.
 */
function ArticleSeoLink({ below, perfect }: { below: number; perfect: number }) {
  if (below === 0) {
    return (
      <div className="rounded-lg border bg-card px-3 py-2 flex items-center gap-2 text-xs">
        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
        <span className="font-medium text-emerald-600 dark:text-emerald-400">
          All {perfect.toLocaleString("en-US")} articles score a perfect 100
        </span>
      </div>
    );
  }

  return (
    <Link
      href="/articles/segment/seo-imperfect"
      className="rounded-lg border bg-card px-3 py-2 flex items-center justify-between gap-3 text-xs transition hover:bg-muted/50"
    >
      <span className="flex items-center gap-2 min-w-0">
        <span className="flex h-[26px] w-[26px] items-center justify-center rounded-lg bg-white ring-1 ring-black/5 shrink-0">
          <GoogleIcon className="h-3.5 w-3.5" />
        </span>
        <span className="font-semibold tabular-nums text-red-600 dark:text-red-400">
          {below.toLocaleString("en-US")}
        </span>
        <span className="font-medium">
          article{below === 1 ? "" : "s"} below a perfect 100
        </span>
        <span className="text-muted-foreground truncate">
          of {(below + perfect).toLocaleString("en-US")} — open each to see what is missing
        </span>
      </span>
      <span className="flex items-center gap-1 font-bold text-primary shrink-0">
        Open list <ArrowRight className="h-3.5 w-3.5" />
      </span>
    </Link>
  );
}
