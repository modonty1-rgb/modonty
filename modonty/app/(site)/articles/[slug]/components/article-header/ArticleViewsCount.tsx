import { IconViews } from "@/lib/icons";
import { SITE_LOCALE } from "@modonty/shared/lib/constants/locale";

import { getArticleLiveCounts } from "../../data/get-article-live-counts";

/** A zero is worse than nothing: «٠ مشاهدة» tells every new reader that nobody has read this. */
export function ViewsCount({ views }: { views: number }) {
  if (views <= 0) return null;
  return (
    <span className="flex items-center gap-1">
      <IconViews className="h-4 w-4 shrink-0" />
      <span className="tabular-nums">{views.toLocaleString(SITE_LOCALE)}</span>
    </span>
  );
}

/**
 * The live view count, as a request-time island inside a Suspense boundary whose fallback is the
 * cached count (`<ViewsCount views={cached} />`). Plan أ١ (2 Oct 2026): read on the article's own
 * render path, this one counter kept the whole article out of the prerendered shell.
 */
export async function ArticleViewsCount({ articleId, cached }: { articleId: string; cached: number }) {
  const live = await getArticleLiveCounts(articleId);
  return <ViewsCount views={live?.views ?? cached} />;
}
