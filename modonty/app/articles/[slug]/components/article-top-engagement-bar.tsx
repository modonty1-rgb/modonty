"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";

import { CommentFormDialog } from "@/app/articles/[slug]/components/comment-form-dialog";
import { useSession } from "@/components/providers/SessionContext";
import { likeArticle, favoriteArticle } from "@/app/articles/[slug]/actions/article-interactions";
import { IconLike, IconSaved, IconComment, IconShare } from "@/lib/icons";
import { cn } from "@/lib/utils";

interface ArticleTopEngagementBarProps {
  likes: number;
  favorites: number;
  userLiked?: boolean;
  userFavorited?: boolean;
  articleId: string;
  articleSlug: string;
  userId?: string | null;
  clientId?: string | null;
}

/**
 * Quiet, thin engagement bar (like / save / comment / share) — mobile, sticky just under the
 * main navbar. Deliberately muted (soft brand tint, no loud color) so it stays visible without
 * competing with the bottom conversion bar. Like/save keep the optimistic-UI wiring from the
 * old dock; comment = CommentFormDialog; share = native share sheet.
 */
export function ArticleTopEngagementBar({
  likes,
  favorites,
  userLiked,
  userFavorited,
  articleId,
  articleSlug,
  userId,
  clientId,
}: ArticleTopEngagementBarProps) {
  const { data: session } = useSession();
  const isLoggedIn = Boolean(session?.user);
  const router = useRouter();
  const pathname = usePathname();
  const registerHref = pathname
    ? `/users/register?callbackUrl=${encodeURIComponent(pathname)}`
    : "/users/register";

  const [likeN, setLikeN] = useState(likes);
  const [favN, setFavN] = useState(favorites);
  const [liked, setLiked] = useState(!!userLiked);
  const [saved, setSaved] = useState(!!userFavorited);
  const [busy, setBusy] = useState<"like" | "save" | null>(null);

  const handleLike = async () => {
    if (busy) return;
    if (!isLoggedIn) { router.push(registerHref); return; }
    setBusy("like");
    const prevN = likeN, prevLiked = liked;
    setLiked(!liked);
    setLikeN(liked ? likeN - 1 : likeN + 1);
    try {
      const r = await likeArticle(articleId, articleSlug);
      if (r.success && r.data) { setLikeN(r.data.likes); setLiked(r.data.liked); }
      else { setLiked(prevLiked); setLikeN(prevN); }
    } catch { setLiked(prevLiked); setLikeN(prevN); }
    finally { setBusy(null); }
  };

  const handleSave = async () => {
    if (busy) return;
    if (!isLoggedIn) { router.push(registerHref); return; }
    setBusy("save");
    const prevN = favN, prevSaved = saved;
    setSaved(!saved);
    setFavN(saved ? favN - 1 : favN + 1);
    try {
      const r = await favoriteArticle(articleId, articleSlug);
      if (r.success && r.data) { setFavN(r.data.favorites); setSaved(r.data.favorited); }
      else { setSaved(prevSaved); setFavN(prevN); }
    } catch { setSaved(prevSaved); setFavN(prevN); }
    finally { setBusy(null); }
  };

  const item =
    "flex flex-1 items-center justify-center gap-1.5 py-2.5 text-[12px] font-semibold text-foreground/65 transition-colors hover:text-primary";

  return (
    <div className="flex items-stretch divide-x divide-border/60 border-b border-[#cbeee9] bg-[#f0fdfa]/95 backdrop-blur-sm dark:border-border dark:bg-card/95">
      <button type="button" onClick={handleLike} disabled={busy === "like"} className={cn(item, liked && "text-primary")} aria-pressed={liked} aria-label="أعجبني">
        <IconLike className={cn("size-[18px]", liked && "fill-current")} />
        <span>{likeN > 0 ? likeN : "إعجاب"}</span>
      </button>
      <button type="button" onClick={handleSave} disabled={busy === "save"} className={cn(item, saved && "text-amber-500")} aria-pressed={saved} aria-label="حفظ">
        <IconSaved className={cn("size-[18px]", saved && "fill-current")} />
        <span>{favN > 0 ? favN : "حفظ"}</span>
      </button>
      <CommentFormDialog
        articleId={articleId}
        articleSlug={articleSlug}
        userId={userId}
        clientId={clientId ?? undefined}
        bare
        trigger={
          <button type="button" className={item} aria-label="أضف تعليق">
            <IconComment className="size-[18px]" />
            <span>تعليق</span>
          </button>
        }
      />
      <button type="button" onClick={shareNow} className={item} aria-label="مشاركة">
        <IconShare className="size-[18px]" />
        <span>مشاركة</span>
      </button>
    </div>
  );
}

function shareNow() {
  if (typeof navigator !== "undefined" && navigator.share) {
    navigator.share({ url: location.href }).catch(() => {});
  }
}
