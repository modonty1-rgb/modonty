import { getMyArticleReactions } from "@/app/(site)/articles/[slug]/data/get-my-article-reactions";
import { getViewer } from "@/app/(site)/articles/[slug]/helpers/get-viewer";
import { ArticleTopEngagementBar } from "@/app/(site)/articles/[slug]/components/top-engagement-bar/TopEngagementBarLazy";

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
 * boundary. The counts come from the shell (they are the same for everyone); only the two
 * booleans are fetched here, and only when someone is signed in.
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
  const { userId } = await getViewer();
  const reactions = userId
    ? await getMyArticleReactions(articleId, userId)
    : { userLiked: false, userFavorited: false };

  return (
    <ArticleTopEngagementBar
      likes={likes}
      favorites={favorites}
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
