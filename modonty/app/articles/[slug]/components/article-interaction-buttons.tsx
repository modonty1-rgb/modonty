"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { IconLike, IconDislike, IconSaved, IconLoading } from "@/lib/icons";
import { useState, useEffect, useRef } from "react";
import { useSession } from "@/components/providers/SessionContext";
import { likeArticle, dislikeArticle, favoriteArticle } from "../actions/article-interactions";

interface ArticleInteractionButtonsProps {
  articleId: string;
  articleSlug: string;
  initialLikes: number;
  initialDislikes: number;
  initialFavorites: number;
  initialUserLiked?: boolean;
  initialUserDisliked?: boolean;
  initialUserFavorited?: boolean;
  /** Compact layout: one line, icon-only smaller buttons */
  compact?: boolean;
  /** Vertical layout: icon on top, count below — for engagement card */
  vertical?: boolean;
  /** Hide the "login to interact" hint (when shown elsewhere) */
  hideLoginHint?: boolean;
  /** Hide the dislike button (e.g. mobile engagement bar) */
  hideDislike?: boolean;
}

export function ArticleInteractionButtons({
  articleId,
  articleSlug,
  initialLikes,
  initialDislikes,
  initialFavorites,
  initialUserLiked = false,
  initialUserDisliked = false,
  initialUserFavorited = false,
  compact = false,
  vertical = false,
  hideLoginHint = false,
  hideDislike = false,
}: ArticleInteractionButtonsProps) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [likes, setLikes] = useState(initialLikes);
  const [dislikes, setDislikes] = useState(initialDislikes);
  const [favorites, setFavorites] = useState(initialFavorites);
  const [userLiked, setUserLiked] = useState(initialUserLiked);
  const [userDisliked, setUserDisliked] = useState(initialUserDisliked);
  const [userFavorited, setUserFavorited] = useState(initialUserFavorited);
  const [loading, setLoading] = useState<string | null>(null);
  const isPending = useRef(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    setLikes(initialLikes);
    setDislikes(initialDislikes);
    setFavorites(initialFavorites);
    setUserLiked(initialUserLiked);
    setUserDisliked(initialUserDisliked);
    setUserFavorited(initialUserFavorited);
  }, [initialLikes, initialDislikes, initialFavorites, initialUserLiked, initialUserDisliked, initialUserFavorited]);

  const handleLike = async () => {
    if (!session?.user || loading || isPending.current) return;
    isPending.current = true;

    // Optimistic update
    const previousLikes = likes;
    const previousUserLiked = userLiked;
    const previousDislikes = dislikes;
    const previousUserDisliked = userDisliked;

    setLikes(userLiked ? likes - 1 : likes + 1);
    setUserLiked(!userLiked);
    if (userDisliked) {
      setUserDisliked(false);
      setDislikes(Math.max(0, dislikes - 1));
    }
    setLoading("like");

    try {
      const result = await likeArticle(articleId, articleSlug);

      if (result.success && result.data) {
        setLikes(result.data.likes);
        setDislikes(result.data.dislikes);
        setUserLiked(result.data.liked);
      } else {
        setLikes(previousLikes);
        setUserLiked(previousUserLiked);
        setDislikes(previousDislikes);
        setUserDisliked(previousUserDisliked);
      }
    } catch {
      setLikes(previousLikes);
      setUserLiked(previousUserLiked);
      setDislikes(previousDislikes);
      setUserDisliked(previousUserDisliked);
    } finally {
      setLoading(null);
      isPending.current = false;
    }
  };

  const handleDislike = async () => {
    if (!session?.user || loading || isPending.current) return;
    isPending.current = true;

    // Optimistic update
    const previousDislikes = dislikes;
    const previousUserDisliked = userDisliked;
    const previousLikes = likes;
    const previousUserLiked = userLiked;

    setDislikes(userDisliked ? dislikes - 1 : dislikes + 1);
    setUserDisliked(!userDisliked);
    if (userLiked) {
      setUserLiked(false);
      setLikes(Math.max(0, likes - 1));
    }
    setLoading("dislike");

    try {
      const result = await dislikeArticle(articleId, articleSlug);

      if (result.success && result.data) {
        setLikes(result.data.likes);
        setDislikes(result.data.dislikes);
        setUserDisliked(result.data.disliked);
      } else {
        setDislikes(previousDislikes);
        setUserDisliked(previousUserDisliked);
        setLikes(previousLikes);
        setUserLiked(previousUserLiked);
      }
    } catch {
      setDislikes(previousDislikes);
      setUserDisliked(previousUserDisliked);
      setLikes(previousLikes);
      setUserLiked(previousUserLiked);
    } finally {
      setLoading(null);
      isPending.current = false;
    }
  };

  const handleFavorite = async () => {
    if (!session?.user || loading || isPending.current) return;
    isPending.current = true;

    // Optimistic update
    const previousFavorites = favorites;
    const previousUserFavorited = userFavorited;

    setFavorites(userFavorited ? favorites - 1 : favorites + 1);
    setUserFavorited(!userFavorited);
    setLoading("favorite");

    try {
      const result = await favoriteArticle(articleId, articleSlug);

      if (result.success && result.data) {
        setFavorites(result.data.favorites);
        setUserFavorited(result.data.favorited);
      } else {
        setFavorites(previousFavorites);
        setUserFavorited(previousUserFavorited);
      }
    } catch {
      setFavorites(previousFavorites);
      setUserFavorited(previousUserFavorited);
    } finally {
      setLoading(null);
      isPending.current = false;
    }
  };

  const isLoggedIn = Boolean(session?.user);

  const containerClass = vertical
    ? "flex items-center gap-1"
    : `flex items-center ${compact ? "gap-2 flex-nowrap" : "gap-2 md:gap-3 flex-wrap"}`;

  const iconClass = vertical
    ? "h-4 w-4 shrink-0"
    : compact ? "h-3.5 w-3.5 shrink-0" : "h-4 w-4 ml-2";

  const btnClass = vertical
    ? "flex flex-col items-center gap-0.5 h-auto px-3 py-1.5 min-w-0 active:scale-95 transition-transform duration-100"
    : compact
      ? "h-8 px-1.5 gap-0.5 text-xs shrink-0 active:scale-95 transition-transform duration-100"
      : "text-sm min-h-[44px] min-w-[44px] md:min-h-0 md:min-w-0 active:scale-95 transition-transform duration-100";

  if (!mounted) {
    if (vertical) {
      return (
        <div className="flex items-center gap-1" aria-hidden>
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex flex-col items-center gap-0.5 px-3 py-1.5">
              <Skeleton className="h-4 w-4 rounded" />
              <Skeleton className="h-3 w-4 rounded" />
            </div>
          ))}
        </div>
      );
    }
    return (
      <div className={`flex items-center ${compact ? "gap-2" : "gap-2 md:gap-3"}`} aria-hidden>
        {(hideDislike ? [0, 1] : [0, 1, 2]).map((i) => (
          <Skeleton key={i} className={compact ? "h-8 w-10 rounded-md" : "h-9 w-14 rounded-md"} />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 min-w-0">
    {!isLoggedIn && !hideLoginHint && (
      <p className="text-xs text-muted-foreground min-w-0 break-words leading-relaxed" role="status">
        <Link
          href={pathname ? `/users/login?callbackUrl=${encodeURIComponent(pathname)}` : "/users/login"}
          className="text-primary underline-offset-4 hover:underline"
        >
          سجّل الدخول
        </Link>
        {" للإعجاب أو حفظ المقال"}
      </p>
    )}
    <div className={containerClass}>
      <Button
        variant={userLiked ? "default" : vertical ? "ghost" : "outline"}
        size={compact ? "sm" : "sm"}
        onClick={handleLike}
        disabled={!isLoggedIn || loading === "like"}
        className={btnClass}
        aria-label={loading === "like" ? "جاري التحديث..." : "إعجاب"}
      >
        {loading === "like" ? (
          <IconLoading className={`${iconClass} animate-spin`} />
        ) : (
          <IconLike className={`${iconClass} ${userLiked ? "fill-current" : ""}`} />
        )}
        <span className={vertical ? "text-xs tabular-nums leading-none" : compact ? "text-xs tabular-nums" : "ml-1"}>{likes}</span>
      </Button>
      {!hideDislike && (
      <Button
        variant={userDisliked ? "default" : vertical ? "ghost" : "outline"}
        size={compact ? "sm" : "sm"}
        onClick={handleDislike}
        disabled={!isLoggedIn || loading === "dislike"}
        className={btnClass}
        aria-label={loading === "dislike" ? "جاري التحديث..." : "عدم إعجاب"}
      >
        {loading === "dislike" ? (
          <IconLoading className={`${iconClass} animate-spin`} />
        ) : (
          <IconDislike className={`${iconClass} ${userDisliked ? "fill-current" : ""}`} />
        )}
        <span className={vertical ? "text-xs tabular-nums leading-none" : compact ? "text-xs tabular-nums" : "ml-1"}>{dislikes}</span>
      </Button>
      )}
      <Button
        variant={userFavorited ? "default" : vertical ? "ghost" : "outline"}
        size={compact ? "sm" : "sm"}
        onClick={handleFavorite}
        disabled={!isLoggedIn || loading === "favorite"}
        className={btnClass}
        aria-label={loading === "favorite" ? "جاري التحديث..." : isLoggedIn ? "حفظ" : "تسجيل الدخول للحفظ"}
      >
        {loading === "favorite" ? (
          <IconLoading className={`${iconClass} animate-spin`} />
        ) : (
          <IconSaved className={`${iconClass} ${userFavorited ? "fill-current" : ""}`} />
        )}
        <span className={vertical ? "text-xs tabular-nums leading-none" : compact ? "text-xs tabular-nums" : "ml-1"}>{favorites}</span>
      </Button>
    </div>
    </div>
  );
}
