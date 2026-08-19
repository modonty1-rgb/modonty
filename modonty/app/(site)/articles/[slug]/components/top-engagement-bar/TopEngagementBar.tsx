"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";

import { CommentFormDialog } from "@/app/(site)/articles/[slug]/components/comment-form/CommentFormDialog";
import { useSession } from "@/components/providers/SessionContext";
import { likeArticle } from "@/app/(site)/articles/[slug]/actions/like-article";
import { favoriteArticle } from "@/app/(site)/articles/[slug]/actions/favorite-article";
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
  /** Sit flush on the card below, so the tabs read as growing out of it (desktop rail). */
  attached?: boolean;
}

/**
 * The four reader actions — like · save · comment · share — as separate 48×48 tabs.
 *
 * 48 is where both platform guidelines land for a touch target (Material 48dp; Apple asks 44pt
 * minimum), so one size serves a thumb on a phone and a pointer on a desktop.
 *
 * Two placements, one component:
 *  - mobile: standalone rounded chips, sticky under the navbar.
 *  - desktop (`attached`): flush on the table-of-contents card, so they read as index tabs
 *    growing out of it — the notebook Khalid used for the reference.
 *
 * Colour lives on the protruding tab edge only; the body stays quiet, because colourful blocks
 * near the top chrome get pattern-matched as ads and skipped.
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
  attached,
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

  // Four separate tabs, not one divided bar (Khalid, 19 Aug). Each is 48×48 — the thumb-sized
  // touch target both platform guidelines land on (Material 48dp; Apple asks 44pt minimum), so
  // the same control works under a thumb on a phone and a pointer on a desktop without two
  // sizes to maintain.
  //
  // Colour lives on the protruding tab EDGE only, as in the notebook Khalid used for the
  // reference; the tab body stays quiet. Colourful blocks under the top chrome get read as an
  // ad bar and skipped — an edge stays distinct without paying that price.
  //
  // No visible label at this size: an Arabic word does not fit 48px, so the icon carries the
  // meaning (thumb · bookmark · bubble · share are all conventional) and `aria-label` carries
  // it for anyone who cannot see the icon. The number below is the count, when there is one.
  // `attached`: the tabs sit ON the table-of-contents card and read as tabs growing out of it
  // — square bottom, no bottom border, so the two shapes merge into one object. Standalone
  // (mobile) they are separate rounded chips under the navbar.
  const item = cn(
    "relative flex size-12 shrink-0 flex-col items-center justify-center gap-0.5 border border-border bg-card/95 pt-1.5 text-[10px] font-semibold leading-none text-foreground/65 backdrop-blur-sm transition-colors hover:text-primary",
    attached
      ? "-mb-px rounded-t-xl border-b-transparent"
      : "rounded-xl shadow-sm"
  );
  const tab = "absolute inset-x-2.5 top-0 h-[3px] rounded-b-full";

  return (
    <div className={cn("flex w-full items-center gap-2", attached ? "justify-around px-2" : "justify-between")}>
      <button type="button" onClick={handleLike} disabled={busy === "like"} className={cn(item, liked && "text-primary")} aria-pressed={liked} aria-label="أعجبني">
        <span className={cn(tab, "bg-primary")} aria-hidden />
        <IconLike className={cn("size-[18px]", liked && "fill-current")} />
        {likeN > 0 && <span className="tabular-nums">{likeN}</span>}
      </button>
      <button type="button" onClick={handleSave} disabled={busy === "save"} className={cn(item, saved && "text-amber-500")} aria-pressed={saved} aria-label="حفظ">
        <span className={cn(tab, "bg-amber-500")} aria-hidden />
        <IconSaved className={cn("size-[18px]", saved && "fill-current")} />
        {favN > 0 && <span className="tabular-nums">{favN}</span>}
      </button>
      <CommentFormDialog
        articleId={articleId}
        articleSlug={articleSlug}
        userId={userId}
        clientId={clientId ?? undefined}
        bare
        trigger={
          <button type="button" className={item} aria-label="أضف تعليق">
            <span className={cn(tab, "bg-accent")} aria-hidden />
            <IconComment className="size-[18px]" />
          </button>
        }
      />
      <button type="button" onClick={shareNow} className={item} aria-label="مشاركة">
        <span className={cn(tab, "bg-violet-500")} aria-hidden />
        <IconShare className="size-[18px]" />
      </button>
    </div>
  );
}

function shareNow() {
  if (typeof navigator !== "undefined" && navigator.share) {
    navigator.share({ url: location.href }).catch(() => {});
  }
}
