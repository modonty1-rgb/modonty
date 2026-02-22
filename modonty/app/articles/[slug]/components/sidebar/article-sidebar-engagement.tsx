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
  clientId?: string;
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
  clientId,
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
      <CardContent className="p-5 flex flex-col gap-5">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center shrink-0 min-w-0">
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
          </div>
          <ArticleEngagementMetrics comments={commentsCount} views={views} questions={questionsCount} />
        </div>
        <div className="flex flex-col gap-3 border-t border-border pt-5">
          <span className="text-xs font-semibold text-muted-foreground tracking-tight">شارك المقال</span>
          <div className="flex items-center gap-3 flex-wrap">
            <ArticleShareButtons title={title} url="" articleSlug={articleSlug} hideCopyLink articleId={articleId} clientId={clientId} />
            <ArticleUtilities articleUrl="" compact />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
