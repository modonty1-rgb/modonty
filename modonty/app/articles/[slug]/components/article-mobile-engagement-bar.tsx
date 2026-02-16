"use client";

import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { ArticleInteractionButtons } from "./article-interaction-buttons";
import { ArticleUtilities } from "./client-only-utilities";
import { ArticleShareButtons } from "./article-share-buttons";

interface ArticleMobileEngagementBarProps {
  title: string;
  articleId: string;
  articleSlug: string;
  onOpenSidebar?: () => void;
  userId?: string | null;
  likes: number;
  dislikes: number;
  favorites: number;
  userLiked: boolean;
  userDisliked: boolean;
  userFavorited: boolean;
}

export function ArticleMobileEngagementBar({
  title,
  articleId,
  articleSlug,
  onOpenSidebar,
  userId,
  likes,
  dislikes,
  favorites,
  userLiked,
  userDisliked,
  userFavorited,
}: ArticleMobileEngagementBarProps) {
  return (
    <div
      className="fixed bottom-16 inset-x-0 z-40 lg:hidden bg-background/95 backdrop-blur border-t p-3"
      role="toolbar"
      aria-label="مشاركة وتفاعل"
    >
      <div className="flex items-center justify-between gap-3 flex-wrap max-w-[1128px] mx-auto px-4 sm:px-6">
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
        <div className="flex items-center gap-3 shrink-0">
          <ArticleShareButtons title={title} url="" articleSlug={articleSlug} hideCopyLink />
          {onOpenSidebar && (
            <Button
              variant="default"
              size="icon"
              className="h-10 w-10 rounded-full shadow-lg shrink-0"
              aria-label="المزيد"
              onClick={onOpenSidebar}
            >
              <Menu className="h-5 w-5" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
