"use client";

import { Button } from "@/components/ui/button";
import { ThumbsUp, ThumbsDown, Bookmark, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
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
}: ArticleInteractionButtonsProps) {
  const { data: session } = useSession();
  const [mounted, setMounted] = useState(false);
  const [likes, setLikes] = useState(initialLikes);
  const [dislikes, setDislikes] = useState(initialDislikes);
  const [favorites, setFavorites] = useState(initialFavorites);
  const [userLiked, setUserLiked] = useState(initialUserLiked);
  const [userDisliked, setUserDisliked] = useState(initialUserDisliked);
  const [userFavorited, setUserFavorited] = useState(initialUserFavorited);
  const [loading, setLoading] = useState<string | null>(null);

  useEffect(() => setMounted(true), []);

  const handleLike = async () => {
    if (!session?.user || loading) return;

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
    } catch (error) {
      setLikes(previousLikes);
      setUserLiked(previousUserLiked);
      setDislikes(previousDislikes);
      setUserDisliked(previousUserDisliked);
    } finally {
      setLoading(null);
    }
  };

  const handleDislike = async () => {
    if (!session?.user) return;

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
        console.error("Failed to update dislike:", result.error);
      }
    } catch (error) {
      setDislikes(previousDislikes);
      setUserDisliked(previousUserDisliked);
      setLikes(previousLikes);
      setUserLiked(previousUserLiked);
      console.error("Error updating dislike:", error);
    } finally {
      setLoading(null);
    }
  };

  const handleFavorite = async () => {
    if (!session?.user || loading) return;

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
    } catch (error) {
      setFavorites(previousFavorites);
      setUserFavorited(previousUserFavorited);
    } finally {
      setLoading(null);
    }
  };

  const containerClass = `flex items-center ${compact ? "gap-1 flex-nowrap" : "gap-2 md:gap-3 flex-wrap"}`;

  if (!mounted) {
    return <div className={containerClass} aria-hidden />;
  }

  if (!session?.user) {
    return null;
  }

  const iconClass = compact ? "h-3.5 w-3.5 shrink-0" : "h-4 w-4 ml-2";
  const btnClass = compact
    ? "h-8 px-1.5 gap-0.5 text-xs shrink-0"
    : "text-sm min-h-[44px] min-w-[44px] md:min-h-0 md:min-w-0";

  return (
    <div className={containerClass}>
      <Button
        variant={userLiked ? "default" : "outline"}
        size={compact ? "sm" : "sm"}
        onClick={handleLike}
        disabled={loading === "like"}
        className={btnClass}
        aria-label={loading === "like" ? "جاري التحديث..." : "إعجاب"}
      >
        {loading === "like" ? (
          <Loader2 className={`${iconClass} animate-spin`} />
        ) : (
          <ThumbsUp className={`${iconClass} ${userLiked ? "fill-current" : ""}`} />
        )}
        <span className={compact ? "text-xs tabular-nums" : "ml-1"}>{likes}</span>
      </Button>
      <Button
        variant={userDisliked ? "default" : "outline"}
        size={compact ? "sm" : "sm"}
        onClick={handleDislike}
        disabled={loading === "dislike"}
        className={btnClass}
        aria-label={loading === "dislike" ? "جاري التحديث..." : "عدم إعجاب"}
      >
        {loading === "dislike" ? (
          <Loader2 className={`${iconClass} animate-spin`} />
        ) : (
          <ThumbsDown className={`${iconClass} ${userDisliked ? "fill-current" : ""}`} />
        )}
        <span className={compact ? "text-xs tabular-nums" : "ml-1"}>{dislikes}</span>
      </Button>
      <Button
        variant={userFavorited ? "default" : "outline"}
        size={compact ? "sm" : "sm"}
        onClick={handleFavorite}
        disabled={loading === "favorite"}
        className={btnClass}
        aria-label={loading === "favorite" ? "جاري التحديث..." : "حفظ"}
      >
        {loading === "favorite" ? (
          <Loader2 className={`${iconClass} animate-spin`} />
        ) : (
          <Bookmark className={`${iconClass} ${userFavorited ? "fill-current" : ""}`} />
        )}
        <span className={compact ? "text-xs tabular-nums" : "ml-1"}>{favorites}</span>
      </Button>
    </div>
  );
}
