"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { IconMenu, IconComment, IconShare } from "@/lib/icons";
import { ArticleInteractionButtons } from "./article-interaction-buttons";
import { AskClientDialog } from "./ask-client-dialog";

function useHideOnScroll() {
  const [visible, setVisible] = useState(true);
  const lastScrollY = useRef(0);
  useEffect(() => {
    const update = () => {
      const curr = window.scrollY;
      setVisible(curr < lastScrollY.current || curr < 80);
      lastScrollY.current = curr;
    };
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);
  return visible;
}

interface ArticleMobileEngagementBarProps {
  title: string;
  articleId: string;
  articleSlug: string;
  clientId?: string;
  clientLogo?: string | null;
  clientName?: string | null;
  clientSlug?: string | null;
  articleTitle?: string;
  user?: { name: string | null; email: string | null } | null;
  commentsCount?: number;
  onOpenSidebar?: () => void;
  onOpenNewsletter?: () => void;
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
  clientId,
  clientLogo,
  clientName,
  clientSlug,
  articleTitle,
  user,
  commentsCount,
  onOpenSidebar,
  onOpenNewsletter,
  likes,
  dislikes,
  favorites,
  userLiked,
  userDisliked,
  userFavorited,
}: ArticleMobileEngagementBarProps) {
  const barVisible = useHideOnScroll();

  const handleShare = () => {
    if ("share" in navigator) {
      void navigator.share({ title, url: window.location.href }).catch(() => {});
    } else {
      void (navigator as Navigator).clipboard?.writeText(window.location.href);
    }
  };

  return (
    <div
      className={`sticky top-14 z-[45] lg:hidden bg-background/95 backdrop-blur-sm border-b border-border/60 px-3 py-1.5 flex flex-col gap-1 transition-transform duration-300 ease-in-out ${barVisible ? "translate-y-0" : "-translate-y-full"}`}
      role="toolbar"
      aria-label="مشاركة وتفاعل"
    >
      {/* Zone 1: Client identity row — only rendered when client exists */}
      {clientId && clientName && (
        <div className="flex items-center gap-1.5 w-full">
          {clientSlug && (
            <a href={`/clients/${clientSlug}`} aria-label={clientName} className="shrink-0">
              <div className="h-7 w-7 rounded-full overflow-hidden ring-2 ring-border bg-background flex items-center justify-center">
                {clientLogo ? (
                  <Image
                    src={clientLogo}
                    alt={clientName}
                    width={28}
                    height={28}
                    className="object-contain p-0.5"
                  />
                ) : (
                  <span className="text-xs font-bold text-primary">{clientName.charAt(0)}</span>
                )}
              </div>
            </a>
          )}
          <AskClientDialog
            articleId={articleId}
            clientId={clientId}
            clientName={clientName}
            articleTitle={articleTitle}
            user={user ?? null}
            triggerLabel="اسأل العميل"
            triggerOnly
            triggerClassName="w-auto h-auto py-1 px-3 text-xs rounded-lg whitespace-nowrap font-semibold bg-primary text-primary-foreground border-primary hover:bg-primary/90 hover:border-primary/90 shadow-none"
          />
          {onOpenNewsletter && (
            <button
              type="button"
              onClick={onOpenNewsletter}
              aria-label="اشترك في نشرة العميل"
              className="w-auto h-auto py-1 px-3 text-xs rounded-lg whitespace-nowrap font-semibold border border-border text-foreground hover:bg-muted/50 transition-colors shrink-0"
            >
              اشترك في النشرة
            </button>
          )}
        </div>
      )}

      {/* Zone 2: icons row — full width, always on its own row when Zone 1 exists */}
      <div className="flex items-center gap-0.5 w-full">
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
          hideLoginHint
          hideDislike
        />

        {commentsCount !== undefined && (
          <a
            href="#article-comments"
            aria-label={`${commentsCount} تعليق`}
            className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-muted-foreground hover:bg-muted/50 transition-colors shrink-0"
          >
            <IconComment className="h-4 w-4" />
            <span className="text-xs tabular-nums">{commentsCount}</span>
          </a>
        )}

        <button
          type="button"
          onClick={handleShare}
          aria-label="مشاركة"
          className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-muted-foreground hover:bg-muted/50 transition-colors shrink-0"
        >
          <IconShare className="h-4 w-4" />
        </button>

        {onOpenSidebar && (
          <button
            type="button"
            onClick={onOpenSidebar}
            aria-label="المزيد"
            className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-muted-foreground hover:bg-muted/50 transition-colors shrink-0 ms-auto"
          >
            <IconMenu className="h-5 w-5" />
          </button>
        )}
      </div>
    </div>
  );
}
