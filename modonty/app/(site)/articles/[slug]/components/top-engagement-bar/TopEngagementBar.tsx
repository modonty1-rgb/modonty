"use client";

import { useState } from "react";

import { CommentFormDialog } from "@/app/(site)/articles/[slug]/components/comment-form/CommentFormDialog";
import { AuthPromptLazy, warmAuthPrompt } from "@/components/shared/auth-prompt/AuthPromptLazy";
import { useSession } from "@/components/providers/SessionContext";
import { likeArticle } from "@/app/(site)/articles/[slug]/actions/like-article";
import { favoriteArticle } from "@/lib/articles/favorite-article";
import { ArticleAudioPlayer } from "@/app/(site)/articles/[slug]/components/audio-player/ArticleAudioPlayerLazy";
import { IconLike, IconSaved, IconComment, IconShare, IconCheck } from "@/lib/icons";
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
  /**
   * Which tabs to render (Khalid, 21 Aug — mobile refactor).
   *
   * On a phone the five split by WHEN the reader needs them: listening is a choice made before
   * reading, so that tab stays under the title; liking, saving, commenting and sharing are what
   * you do once you have finished, so they moved below the article. A desktop has a rail and no
   * such scarcity — it keeps all five together.
   */
  show?: "all" | "listen" | "engagement";
  /** From the server — see PartnerCardMobile for why a client component takes strings as props. */
  labels: { like: string; save: string; comment: string; share: string };
  /** A column when the tabs live in the corner button — a row everywhere else. */
  orientation?: "row" | "column";
  /** "compact" is the outline-bar size: a 32px face with a 44px hit area grown on the free axis. */
  size?: "default" | "compact";
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
  show = "all",
  labels,
  orientation = "row",
  size = "default",
}: ArticleTopEngagementBarProps) {
  // The count as a corner badge when the face is only 32px (the outline bar): inside the tab it
  // rendered at 9px, under the ~11px floor both platform guidelines set for the smallest text.
  // A badge reads at 11px and costs no width, because it overhangs the tab instead of sharing it.
  const badge = size === "compact"
    ? "absolute end-0.5 top-0.5 min-w-[16px] rounded-full bg-background px-1 text-[11px] leading-[16px] text-foreground shadow ring-1 ring-border tabular-nums"
    : "tabular-nums";

  // The glyph shrinks in the bar so the count can sit inside the tab instead of hanging off its
  // corner, where it collided with the bar edge.
  const glyph = size === "compact" ? "size-[16px]" : "size-[18px]";

  const showEngagement = show !== "listen";
  const showListen = show !== "engagement";
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
  // Two seconds of a tick, so a press is never met with silence.
  const [shared, setShared] = useState(false);

  const handleShare = async () => {
    const result = await shareArticle();
    if (result === "cancelled") return;
    setShared(true);
    setTimeout(() => setShared(false), 2000);
  };

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
    "relative flex shrink-0 flex-col items-center justify-center gap-0.5 font-semibold leading-none shadow-md transition-transform",
    size === "compact"
      // 44 — the same face as the listen tab it sits beside (Khalid, 21 Aug): two sizes in one
      // row read as two kinds of control. It is also the fingertip floor, so no invisible hit
      // area is needed any more. The outline title truncates to make room; the controls do not.
      ? "size-11 rounded-lg text-[9px]"
      : "size-12 rounded-xl text-[10px] lg:size-10",
    size === "compact" ? "" : attached
      // Hanging from the navbar (Khalid, 19 Aug): the radius is flipped — square where it meets
      // the bar so it reads as cut from it, rounded at the loose bottom edge. `-mt-px` closes
      // the hairline. They grow DOWN on hover, the direction they already point.
      ? "-mt-px rounded-b-xl hover:translate-y-0.5"
      : "rounded-xl hover:-translate-y-0.5"
  );
  return (
    <div
      className={cn(
        "flex gap-2",
        orientation === "column"
          // In the corner button the tabs stack, and the box is exactly one tab wide — a row
          // with  there stretched the fixed container across the screen and left the
          // button floating in the middle of it.
          ? "flex-col items-center"
          : cn("items-start", attached ? "" : "w-full justify-between")
      )}
      // Reaching for a tab is the earliest honest signal that the dialog will be needed. Only
      // for a signed-out reader — anyone signed in never opens it.
      onPointerEnter={isLoggedIn ? undefined : warmAuthPrompt}
      onPointerDown={isLoggedIn ? undefined : warmAuthPrompt}
    >
      {showEngagement && (
        <>
          <button type="button" onClick={handleLike} disabled={busy === "like"} className={cn(item, "bg-action-like text-action-like-foreground")} aria-pressed={liked} aria-label={labels.like}>
            <IconLike className={cn(glyph, liked && "fill-current")} />
            {likeN > 0 && <span className={badge}>{likeN}</span>}
          </button>
          <button type="button" onClick={handleSave} disabled={busy === "save"} className={cn(item, "bg-action-save text-action-save-foreground")} aria-pressed={saved} aria-label={labels.save}>
            <IconSaved className={cn(glyph, saved && "fill-current")} />
            {favN > 0 && <span className={badge}>{favN}</span>}
          </button>
          <CommentFormDialog
            articleId={articleId}
            articleSlug={articleSlug}
            userId={userId}
            clientId={clientId ?? undefined}
            trigger={
              <button type="button" className={cn(item, "bg-action-comment text-action-comment-foreground")} aria-label={labels.comment}>
                <IconComment className={glyph} />
              </button>
            }
          />
          <button type="button" onClick={handleShare} className={cn(item, "bg-action-share text-action-share-foreground")} aria-label={labels.share}>
            {shared ? <IconCheck className={glyph} /> : <IconShare className={glyph} />}
          </button>
        </>
      )}
      {/* The fifth tab IS the player (Khalid, 20 Aug) — it unfolds instead of jumping the reader
          to a card that then scrolls away. It keeps its place struck through when the article has
          no recording, so the row is the same tabs on every article. */}
      {showListen && (
        <ArticleAudioPlayer
          src={audioUrl}
          slug={articleSlug}
          durationSeconds={audioDurationSeconds}
          tabClassName={item}
        />
      )}

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

/**
 * Share, and say something either way.
 *
 * It used to call the system share sheet and stop — no fallback, no feedback. On a browser
 * without one (most desktops) the tab was simply dead: the reader pressed it and nothing
 * happened at all, which reads as a broken page rather than an unsupported feature. And even
 * where it worked, nothing confirmed the press.
 *
 * Now: the share sheet when the browser has one, the clipboard when it does not, and the icon
 * turns into a tick for two seconds so the press is always answered.
 */
async function shareArticle(): Promise<"shared" | "copied" | "cancelled"> {
  const url = typeof location !== "undefined" ? location.href : "";
  if (typeof navigator !== "undefined" && navigator.share) {
    try {
      await navigator.share({ url });
      return "shared";
    } catch {
      // The reader dismissed the sheet — not an error, and not something to fall back from.
      return "cancelled";
    }
  }
  try {
    await navigator.clipboard.writeText(url);
    return "copied";
  } catch {
    return "cancelled";
  }
}
