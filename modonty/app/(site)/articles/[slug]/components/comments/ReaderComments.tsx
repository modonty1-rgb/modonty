import { getViewer } from "@/app/(site)/articles/[slug]/helpers/get-viewer";
import dynamic from "next/dynamic";

// Code-split, but still server-rendered: no `ssr: false` here on purpose. Comment text is
// content Google indexes, and Next prerenders a dynamically imported Client Component unless
// that flag is set — so the words stay in the HTML while their 326 lines leave the first bundle.
const ArticleComments = dynamic(() =>
  import("./ArticleComments").then((m) => ({ default: m.ArticleComments }))
);

interface ReaderCommentsProps {
  comments: React.ComponentProps<typeof ArticleComments>["comments"];
  commentsCount: number;
  articleId: string;
  articleSlug: string;
  sectionTitle: string;
}

/**
 * The comments section, as a request-time island.
 *
 * The list itself is the same for everyone and stays server-rendered — comment text is content
 * Google reads. What differs per reader is only whether the reply and like controls are offered,
 * which is a single id. That id is why this sits behind a Suspense boundary instead of in the
 * page shell.
 */
export async function ReaderComments({
  comments,
  commentsCount,
  articleId,
  articleSlug,
  sectionTitle,
}: ReaderCommentsProps) {
  const { userId } = await getViewer();

  return (
    <ArticleComments
      comments={comments}
      commentsCount={commentsCount}
      articleId={articleId}
      articleSlug={articleSlug}
      userId={userId}
      sectionTitle={sectionTitle}
    />
  );
}
