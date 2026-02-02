"use client";

import { Button } from "@/components/ui/button";
import { ThumbsUp, ThumbsDown, Bookmark, Loader2 } from "lucide-react";
import { useState } from "react";
import { useSession } from "next-auth/react";
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
}: ArticleInteractionButtonsProps) {
  const { data: session } = useSession();
  const [likes, setLikes] = useState(initialLikes);
  const [dislikes, setDislikes] = useState(initialDislikes);
  const [favorites, setFavorites] = useState(initialFavorites);
  const [userLiked, setUserLiked] = useState(initialUserLiked);
  const [userDisliked, setUserDisliked] = useState(initialUserDisliked);
  const [userFavorited, setUserFavorited] = useState(initialUserFavorited);
  const [loading, setLoading] = useState<string | null>(null);

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

  if (!session?.user) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 md:gap-3 flex-wrap">
      <Button
        variant={userLiked ? "default" : "outline"}
        size="sm"
        onClick={handleLike}
        disabled={loading === "like"}
        className="text-sm min-h-[44px] min-w-[44px] md:min-h-0 md:min-w-0"
        aria-label={loading === "like" ? "جاري التحديث..." : "إعجاب"}
      >
        {loading === "like" ? (
          <Loader2 className="h-4 w-4 ml-2 animate-spin" />
        ) : (
          <ThumbsUp className={`h-4 w-4 ml-2 ${userLiked ? "fill-current" : ""}`} />
        )}
        {likes > 0 && <span className="ml-1">{likes}</span>}
      </Button>
      <Button
        variant={userDisliked ? "default" : "outline"}
        size="sm"
        onClick={handleDislike}
        disabled={loading === "dislike"}
        className="text-sm min-h-[44px] min-w-[44px] md:min-h-0 md:min-w-0"
        aria-label={loading === "dislike" ? "جاري التحديث..." : "عدم إعجاب"}
      >
        {loading === "dislike" ? (
          <Loader2 className="h-4 w-4 ml-2 animate-spin" />
        ) : (
          <ThumbsDown className={`h-4 w-4 ml-2 ${userDisliked ? "fill-current" : ""}`} />
        )}
        {dislikes > 0 && <span className="ml-1">{dislikes}</span>}
      </Button>
      <Button
        variant={userFavorited ? "default" : "outline"}
        size="sm"
        onClick={handleFavorite}
        disabled={loading === "favorite"}
        className="text-sm min-h-[44px] min-w-[44px] md:min-h-0 md:min-w-0"
        aria-label={loading === "favorite" ? "جاري التحديث..." : "حفظ"}
      >
        {loading === "favorite" ? (
          <Loader2 className="h-4 w-4 ml-2 animate-spin" />
        ) : (
          <Bookmark className={`h-4 w-4 ml-2 ${userFavorited ? "fill-current" : ""}`} />
        )}
        {favorites > 0 && <span className="ml-1">{favorites}</span>}
      </Button>
    </div>
  );
}
