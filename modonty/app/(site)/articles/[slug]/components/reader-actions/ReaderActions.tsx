import { getArticleLiveCounts } from "../../data/get-article-live-counts";
import { getMyArticleReactions } from "../../data/get-my-article-reactions";
import { getViewer } from "../../helpers/get-viewer";
import { ArticleTopEngagementBar } from "../top-engagement-bar/TopEngagementBarLazy";
import { EngagementBarOnDemand } from "../top-engagement-bar/EngagementBarOnDemand";

interface ReaderActionsProps {
  articleId: string;
  articleSlug: string;
  clientId: string | null;
  likes: number;
  favorites: number;
  audioUrl?: string | null;
  audioDurationSeconds?: number | null;
  labels: { like: string; save: string; comment: string; share: string };
  show?: "all" | "listen" | "engagement";
  size?: "default" | "compact";
  attached?: boolean;
  orientation?: "row" | "column";
}

/**
 * The action tabs, as a request-time island.
 *
 * Everything here is identical for every reader EXCEPT two booleans — whether this person has
 * already liked or saved the article. Those two are the whole reason the page used to read the
 * session before rendering anything, and reading it there cost the article its static shell.
 *
 * Now the shell prerenders with the tabs' skeleton in it and this streams in behind a Suspense
 * boundary. The shell's counts are the cached ones; the live counts are read here too, so the
 * shell can stay static (plan أ١, 2 Oct 2026) — `likes`/`favorites` props are the fallback.
 */
export async function ReaderActions({
  articleId,
  articleSlug,
  clientId,
  likes,
  favorites,
  audioUrl,
  audioDurationSeconds,
  labels,
  show = "all",
  size = "default",
  attached,
  orientation = "row",
}: ReaderActionsProps) {
  const [{ userId }, live] = await Promise.all([getViewer(), getArticleLiveCounts(articleId)]);
  const reactions = userId
    ? await getMyArticleReactions(articleId, userId)
    : { userLiked: false, userFavorited: false };

  // On a phone's outline bar the four buttons are drawn plain and the real bar loads on the first
  // touch (EngagementBarOnDemand, 3 Oct 2026); elsewhere it loads with the page as before.
  const Bar = size === "compact" && show === "engagement" ? EngagementBarOnDemand : ArticleTopEngagementBar;
  return (
    <Bar
      likes={live?.likes ?? likes}
      favorites={live?.favorites ?? favorites}
      userLiked={reactions.userLiked}
      userFavorited={reactions.userFavorited}
      articleId={articleId}
      articleSlug={articleSlug}
      userId={userId}
      clientId={clientId}
      audioUrl={audioUrl}
      audioDurationSeconds={audioDurationSeconds}
      labels={labels}
      show={show}
      size={size}
      attached={attached}
      orientation={orientation}
    />
  );
}
