"use client";

import { Card, CardContent } from "@/components/ui/card";
import { ArticleEngagementMetrics } from "./article-engagement-metrics";
import { ArticleInteractionButtons } from "../article-interaction-buttons";
import { ArticleUtilities } from "../client-only-utilities";
import { ArticleShareButtons } from "../article-share-buttons";

interface ArticleSidebarEngagementProps {
  title: string;
  articleId: string;
  articleSlug: string;
  commentsCount: number;
  views: number;
  questionsCount?: number;
  userId?: string | null;
  likes: number;
  dislikes: number;
  favorites: number;
  userLiked: boolean;
  userDisliked: boolean;
  userFavorited: boolean;
}

export function ArticleSidebarEngagement({
  title,
  articleId,
  articleSlug,
  commentsCount,
  views,
  questionsCount = 0,
  userId,
  likes,
  dislikes,
  favorites,
  userLiked,
  userDisliked,
  userFavorited,
}: ArticleSidebarEngagementProps) {
  return (
    <Card className="min-w-0">
      <CardContent className="p-4 flex flex-col gap-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2 flex-nowrap shrink-0">
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
                compact
              />
            )}
            <ArticleUtilities articleUrl="" compact />
          </div>
          <ArticleEngagementMetrics comments={commentsCount} views={views} questions={questionsCount} />
        </div>
        <div className="flex flex-col gap-2 border-t border-border pt-4">
          <span className="text-xs font-semibold text-muted-foreground">شارك المقال</span>
          <ArticleShareButtons title={title} url="" articleSlug={articleSlug} hideCopyLink />
        </div>
      </CardContent>
    </Card>
  );
}
