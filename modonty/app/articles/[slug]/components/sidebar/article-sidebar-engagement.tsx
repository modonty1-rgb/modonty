"use client";

import Link from "@/components/link";
import { Card, CardContent } from "@/components/ui/card";
import { ArticleEngagementMetrics } from "./article-engagement-metrics";
import { ArticleInteractionButtons } from "../article-interaction-buttons";
import { ArticleShareButtons } from "../article-share-buttons";
import { ArticleUtilities } from "../client-only-utilities";

interface ArticleSidebarEngagementProps {
  title: string;
  articleId: string;
  articleSlug: string;
  clientId?: string;
  commentsCount: number;
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
      <CardContent className="p-0">

        {/* Header — always visible; login prompt added when not logged in */}
        <div className="px-4 py-3 bg-muted/40 rounded-t-lg flex items-center justify-between">
          <span className="text-xs font-semibold text-muted-foreground tracking-tight">التفاعل مع المقال</span>
          {!userId && (
            <p className="text-xs text-muted-foreground leading-relaxed">
              <Link
                href={`/users/login`}
                className="font-semibold text-accent underline-offset-4 hover:underline"
              >
                سجّل الدخول
              </Link>
            </p>
          )}
        </div>
        <div className="border-b border-border" />

        {/* Stats + Interactions — one unified row */}
        <div className="px-4 py-3 flex items-center justify-center gap-1">
          <ArticleEngagementMetrics comments={commentsCount} questions={questionsCount} />
          {(commentsCount > 0 || (questionsCount ?? 0) > 0) && (
            <div className="h-8 w-px bg-border mx-1 shrink-0" />
          )}
          <ArticleInteractionButtons
            articleId={articleId}
            articleSlug={articleSlug}
            initialLikes={likes}
            initialDislikes={dislikes}
            initialFavorites={favorites}
            initialUserLiked={userLiked}
            initialUserDisliked={userDisliked}
            initialUserFavorited={userFavorited}
            vertical
            hideLoginHint
          />
        </div>

        <div className="border-t border-border" />

        {/* Share */}
        <div className="px-4 py-3 flex items-center justify-between gap-3">
          <span className="text-xs font-semibold text-muted-foreground tracking-tight shrink-0">شارك المقال</span>
          <div className="flex items-center gap-2">
            <ArticleShareButtons title={title} url="" articleSlug={articleSlug} hideCopyLink buttonVariant="ghost" articleId={articleId} clientId={clientId} />
            <ArticleUtilities articleUrl="" compact buttonVariant="ghost" />
          </div>
        </div>

      </CardContent>
    </Card>
  );
}
