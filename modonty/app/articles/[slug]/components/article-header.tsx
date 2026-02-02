import { formatRelativeTime } from "@/lib/utils";
import { ArticleEngagementMetrics } from "./article-engagement-metrics";
import { ArticleInteractionButtons } from "./article-interaction-buttons";
import { ArticleUtilities } from "./article-utilities";
import { ArticleShareButtons } from "./article-share-buttons";

interface ArticleHeaderProps {
  title: string;
  excerpt: string | null;
  author: {
    name: string;
  };
  datePublished: Date | null;
  createdAt: Date;
  readingTimeMinutes: number | null;
  wordCount: number | null;
  commentsCount: number;
  views: number;
  userId?: string | null;
  articleId: string;
  articleSlug: string;
  likes: number;
  dislikes: number;
  favorites: number;
  userLiked: boolean;
  userDisliked: boolean;
  userFavorited: boolean;
}

export function ArticleHeader({
  title,
  excerpt,
  author,
  datePublished,
  createdAt,
  readingTimeMinutes,
  wordCount,
  commentsCount,
  views,
  userId,
  articleId,
  articleSlug,
  likes,
  dislikes,
  favorites,
  userLiked,
  userDisliked,
  userFavorited,
}: ArticleHeaderProps) {
  return (
    <header className="mb-6 md:mb-8">
      <h1 className="text-2xl md:text-3xl font-semibold mb-4">
        {title}
      </h1>

      {excerpt && (
        <p className="text-base md:text-lg text-muted-foreground mb-6 leading-relaxed">
          {excerpt}
        </p>
      )}

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 text-sm text-muted-foreground mb-4">
        <div className="flex items-center gap-2">
          <span>{author.name}</span>
        </div>
        <time dateTime={datePublished?.toISOString()} suppressHydrationWarning>
          {datePublished
            ? formatRelativeTime(datePublished)
            : formatRelativeTime(createdAt)}
        </time>
        {readingTimeMinutes && (
          <span>⏱️ {readingTimeMinutes} دقيقة قراءة</span>
        )}
        {wordCount && <span>📝 {wordCount} كلمة</span>}
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 md:gap-6 mb-4 flex-wrap">
        <ArticleEngagementMetrics
          comments={commentsCount}
          views={views}
        />
        {userId && (
          <ArticleInteractionButtons
            articleId={articleId}
            articleSlug={articleSlug}
            initialLikes={likes}
            initialDislikes={dislikes}
            initialFavorites={favorites}
            initialUserLiked={userLiked}
            initialUserDisliked={userDisliked}
            initialUserFavorited={userFavorited}
          />
        )}
        <div className="sm:mr-auto">
          <ArticleUtilities articleUrl="" />
        </div>
      </div>

      <section aria-labelledby="share-article-heading">
        <h2 id="share-article-heading" className="sr-only">شارك المقال</h2>
        <div className="mb-6 flex items-center gap-3 flex-wrap">
          <span className="text-sm font-semibold text-muted-foreground">شارك المقال:</span>
          <ArticleShareButtons
            title={title}
            url=""
            articleId={articleId}
            hideCopyLink={true}
          />
        </div>
      </section>
    </header>
  );
}
