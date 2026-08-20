"use client";

import { useState } from "react";

import { CommentFormDialog } from "@/app/(site)/articles/[slug]/components/comment-form/CommentFormDialog";
import { AuthPromptLazy, warmAuthPrompt } from "@/app/(site)/articles/[slug]/components/auth-prompt/AuthPromptLazy";
import { useSession } from "@/components/providers/SessionContext";
import { likeArticle } from "@/app/(site)/articles/[slug]/actions/like-article";
import { favoriteArticle } from "@/app/(site)/articles/[slug]/actions/favorite-article";
import { ArticleAudioPlayer } from "@/app/(site)/articles/[slug]/components/audio-player/ArticleAudioPlayer";
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
  /** The article's audio version, when one exists — decides whether the listen tab is live. */
  audioUrl?: string | null;
  /** Its length from the database, so the tab can show it without fetching the recording. */
  audioDurationSeconds?: number | null;
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
  audioUrl,
  audioDurationSeconds,
}: ArticleTopEngagementBarProps) {
  const { data: session } = useSession();
  const isLoggedIn = Boolean(session?.user);
  // Signing in happens in a dialog on this page now — no path to carry, no return to manage.
  // The old `?callbackUrl=` was broken twice over: the register page ignored it, and it was
  // read after navigation had started so it pointed at the register page itself.
  // Only these two tabs open it from here — the comment tab reaches the same dialog through
  // `CommentFormDialog`, which is the one place that knows whether a comment box can be shown.
  const [authFor, setAuthFor] = useState<"like" | "save" | null>(null);

  const [likeN, setLikeN] = useState(likes);
  const [favN, setFavN] = useState(favorites);
  const [liked, setLiked] = useState(!!userLiked);
  const [saved, setSaved] = useState(!!userFavorited);
  const [busy, setBusy] = useState<"like" | "save" | null>(null);

  const handleLike = async () => {
    if (busy) return;
    if (!isLoggedIn) { setAuthFor("like"); return; }
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
    if (!isLoggedIn) { setAuthFor("save"); return; }
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
  // Khalid, 19 Aug: the tab body itself carries the colour, one colour each — these are calls
  // to action and they are meant to pull the eye. (Noted at the time: colour blocks near the
  // top chrome can get pattern-matched as advertising and skipped. His call, his product.)
  //
  // Each colour is a token (`--action-like` … `--action-share`, adopted 19 Aug), not a raw
  // Tailwind value: it carries its own dark-mode step and its own legible text colour, so a
  // tab cannot be built with an unreadable pairing by accident.
  // 48 on a phone, 40 on a desktop (Khalid, 19 Aug). The 44 floor is about a fingertip, so it
  // binds where there are fingers; a pointer is precise and the shorter tab gives the rail back
  // 8px. One class, not two components.
  const item = cn(
    "relative flex size-12 shrink-0 flex-col items-center justify-center gap-0.5 text-[10px] font-semibold leading-none shadow-md transition-transform lg:size-10",
    attached
      // Hanging from the navbar (Khalid, 19 Aug): the radius is flipped — square where it meets
      // the bar so it reads as cut from it, rounded at the loose bottom edge. `-mt-px` closes
      // the hairline. They grow DOWN on hover, the direction they already point.
      ? "-mt-px rounded-b-xl hover:translate-y-0.5"
      : "rounded-xl hover:-translate-y-0.5"
  );
  return (
    <div
      className={cn("flex items-start gap-2", attached ? "" : "w-full justify-between")}
      // Reaching for a tab is the earliest honest signal that the dialog will be needed. Only
      // for a signed-out reader — anyone signed in never opens it.
      onPointerEnter={isLoggedIn ? undefined : warmAuthPrompt}
      onPointerDown={isLoggedIn ? undefined : warmAuthPrompt}
    >
      <button type="button" onClick={handleLike} disabled={busy === "like"} className={cn(item, "bg-action-like text-action-like-foreground")} aria-pressed={liked} aria-label="أعجبني">
        <IconLike className={cn("size-[18px]", liked && "fill-current")} />
        {likeN > 0 && <span className="tabular-nums">{likeN}</span>}
      </button>
      <button type="button" onClick={handleSave} disabled={busy === "save"} className={cn(item, "bg-action-save text-action-save-foreground")} aria-pressed={saved} aria-label="حفظ">
        <IconSaved className={cn("size-[18px]", saved && "fill-current")} />
        {favN > 0 && <span className="tabular-nums">{favN}</span>}
      </button>
      <CommentFormDialog
        articleId={articleId}
        articleSlug={articleSlug}
        userId={userId}
        clientId={clientId ?? undefined}
        trigger={
          <button type="button" className={cn(item, "bg-action-comment text-action-comment-foreground")} aria-label="أضف تعليق">
            <IconComment className="size-[18px]" />
          </button>
        }
      />
      <button type="button" onClick={shareNow} className={cn(item, "bg-action-share text-action-share-foreground")} aria-label="مشاركة">
        <IconShare className="size-[18px]" />
      </button>
      {/* The fifth tab IS the player (Khalid, 20 Aug) — it unfolds instead of jumping the reader
          to a card that then scrolls away. It keeps its place struck through when the article has
          no recording, so the row is the same five tabs on every article. */}
      <ArticleAudioPlayer
        src={audioUrl}
        slug={articleSlug}
        durationSeconds={audioDurationSeconds}
        tabClassName={item}
      />

      {/* Mounted only once a signed-out reader taps — so its chunk is never fetched otherwise. */}
      {authFor && (
        <AuthPromptLazy
          open
          onOpenChange={(next) => !next && setAuthFor(null)}
          action={authFor}
        />
      )}
    </div>
  );
}

function shareNow() {
  if (typeof navigator !== "undefined" && navigator.share) {
    navigator.share({ url: location.href }).catch(() => {});
  }
}
