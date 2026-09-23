"use client";

import { useState, useTransition } from "react";

import { AuthPromptLazy, warmAuthPrompt } from "@/components/shared/auth-prompt/AuthPromptLazy";
import { ModontyBookmarkMark } from "@/components/icons/modonty-bookmark-mark";
import { ModontyCommentMark } from "@/components/icons/modonty-comment-mark";
import { ModontyLikeMark } from "@/components/icons/modonty-like-mark";
import { ModontyShareMark } from "@/components/icons/modonty-share-mark";

import { toggleReelLike, toggleReelFavorite } from "../actions/reel-interactions";
import { trackReelShareEvent } from "../actions/track-reel-share";
import { ReelCommentsSheetLazy, warmReelCommentsSheet } from "./reel-comments-sheet-lazy";
import { ReelViewerAvatar } from "./reel-viewer-avatar";
import { SITE_LOCALE } from "@modonty/shared/lib/constants/locale";

interface ReelActionsRailProps {
  reelId: string;
  slug: string;
  title: string;
  userImage: string | null;
  userName: string;
  likesCount: number;
  favoritesCount: number;
  commentsCount: number;
  likedByMe: boolean;
  favoritedByMe: boolean;
  isLoggedIn: boolean;
}

const btn =
  "flex flex-col items-center gap-1 text-white transition active:scale-90";
// TikTok-style action rail: familiar bare symbols and counts keep the video primary. The
// shadow is deliberately subtle — contrast support, never a visible UI surface.
const iconWrap = "flex size-11 items-center justify-center rounded-full transition";
const iconGlyph = "size-8 drop-shadow-[0_1px_2px_rgba(0,0,0,0.78)]";
const actionLabel = "text-xs font-bold [text-shadow:0_1px_2px_rgba(0,0,0,0.82)]";

export function ReelActionsRail({
  reelId,
  slug,
  title,
  userImage,
  userName,
  likesCount,
  favoritesCount,
  commentsCount,
  likedByMe,
  favoritedByMe,
  isLoggedIn,
}: ReelActionsRailProps) {
  const [liked, setLiked] = useState(likedByMe);
  const [likes, setLikes] = useState(likesCount);
  const [saved, setSaved] = useState(favoritedByMe);
  const [saves, setSaves] = useState(favoritesCount);
  const [hint, setHint] = useState<string | null>(null);
  // Signed out, a tap on like/save opens the one sign-in dialog the whole site shares —
  // the same card the article page uses, instead of the old inline links block.
  const [authAction, setAuthAction] = useState<"like" | "save" | null>(null);
  // Mounted on first open and kept mounted after, so a reopen is instant.
  const [commentsMounted, setCommentsMounted] = useState(false);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [, startTransition] = useTransition();

  function handleLike() {
    if (!isLoggedIn) {
      setAuthAction("like");
      return;
    }
    const next = !liked;
    setLiked(next);
    setLikes((n) => Math.max(0, n + (next ? 1 : -1)));
    startTransition(async () => {
      const res = await toggleReelLike(reelId);
      if (!res.success) {
        setLiked(!next);
        setLikes((n) => Math.max(0, n + (next ? -1 : 1)));
      }
    });
  }

  function handleSave() {
    if (!isLoggedIn) {
      setAuthAction("save");
      return;
    }
    const next = !saved;
    setSaved(next);
    setSaves((n) => Math.max(0, n + (next ? 1 : -1)));
    startTransition(async () => {
      const res = await toggleReelFavorite(reelId);
      if (!res.success) {
        setSaved(!next);
        setSaves((n) => Math.max(0, n + (next ? -1 : 1)));
      }
    });
  }

  function openComments() {
    setCommentsMounted(true);
    setCommentsOpen(true);
  }

  async function handleShare() {
    // The reel's own watch page — the indexable URL — never the feed root: a shared link
    // must land the receiver on THIS clip.
    const url = `${window.location.origin}/reels/${encodeURIComponent(slug)}`;
    try {
      if (navigator.share) {
        await navigator.share({ title, url });
        void trackReelShareEvent(reelId, "native");
      } else {
        await navigator.clipboard.writeText(url);
        void trackReelShareEvent(reelId, "clipboard");
        // Past tense — the copy already happened; «انسخ» ordered the visitor to do it.
        setHint("انتسخ الرابط ✓");
        setTimeout(() => setHint(null), 2000);
      }
    } catch {
      /* user cancelled */
    }
  }

  const warmAuth = isLoggedIn ? undefined : warmAuthPrompt;

  return (
    <>
      {hint && (
        <div className="absolute inset-x-4 top-1/2 z-30 -translate-y-1/2 rounded-full bg-black/80 px-4 py-2 text-center text-sm text-white backdrop-blur">
          {hint}
        </div>
      )}
      {/* Phone: overlaid on the clip near its lower edge. The caption reserves its inline end
          for this rail; from `md` up it steps OUT of the card (`-end-16`) and centres beside it, where
          TikTok's desktop puts the same four counts; the card stops clipping at that same
          breakpoint, so nothing here is cut. */}
      <div className="absolute bottom-4 end-3 z-10 flex flex-col items-center gap-4 md:bottom-auto md:-end-16 md:top-1/2 md:-translate-y-1/2 md:gap-6">
        {/* The READER's face heads the rail — the publisher is already named at the bottom of the
            reel, so this slot carries «طلّاتي» instead (Khalid, 24 Aug: «الأفاتار اللي فوق
            لليوزر اللي داخل على مدونتي»). No «+»: you do not follow yourself. */}
        <ReelViewerAvatar userImage={userImage} userName={userName} isLoggedIn={isLoggedIn} />
        {/* Brand marks, not lucide (the rule that governs all nine mobile surfaces) — the
            like, comment, bookmark and share marks the article page already wears, 28px in
            a 44px circle, the mobile icon standard. State lives on the CIRCLE via tokens
            (`bg-primary` / `bg-accent`), never a raw hex: #3030FF and #00D8D8 sat here
            hardcoded and would have missed any future token change. Counts through Intl —
            a latin «0» under an Arabic feed was the first thing the screenshot showed. */}
        <button
          type="button"
          onClick={handleLike}
          onPointerEnter={warmAuth}
          onPointerDown={warmAuth}
          className={btn}
          aria-label="إعجاب"
          aria-pressed={liked}
        >
          {/* State moved from the plate to the GLYPH when the plate went away: a liked mark
              carries the primary token itself, the way TikTok's heart turns colour rather
              than gaining a background. */}
          <span className={`${iconWrap} ${liked ? "text-primary" : ""}`}>
            <ModontyLikeMark className={iconGlyph} aria-hidden />
          </span>
          {likes > 0 && <span className={actionLabel}>{likes.toLocaleString(SITE_LOCALE)}</span>}
        </button>
        <button
          type="button"
          onClick={openComments}
          onPointerEnter={warmReelCommentsSheet}
          onPointerDown={warmReelCommentsSheet}
          className={btn}
          aria-label="التعليقات"
        >
          <span className={iconWrap}>
            <ModontyCommentMark className={iconGlyph} aria-hidden />
          </span>
          {commentsCount > 0 && <span className={actionLabel}>{commentsCount.toLocaleString(SITE_LOCALE)}</span>}
        </button>
        <button
          type="button"
          onClick={handleSave}
          onPointerEnter={warmAuth}
          onPointerDown={warmAuth}
          className={btn}
          aria-label="حفظ"
          aria-pressed={saved}
        >
          {/* Saved fills the bookmark in the accent token — the mark itself changes, not a
              plate behind it. The old «accent circle + dark glyph» exception is gone with the
              circle, so the diamond keeps its normal accent colour again. */}
          <span className={`${iconWrap} ${saved ? "text-accent" : ""}`}>
            <ModontyBookmarkMark className={`${iconGlyph} ${saved ? "[&>rect]:fill-current" : ""}`} aria-hidden />
          </span>
          {saves > 0 && <span className={actionLabel}>{saves.toLocaleString(SITE_LOCALE)}</span>}
        </button>
        <button type="button" onClick={handleShare} className={btn} aria-label="مشاركة">
          <span className={iconWrap}>
            <ModontyShareMark className={iconGlyph} aria-hidden />
          </span>
        </button>
      </div>

      {authAction && (
        <AuthPromptLazy open onOpenChange={(o) => !o && setAuthAction(null)} action={authAction} />
      )}
      {commentsMounted && (
        <ReelCommentsSheetLazy
          mediaId={reelId}
          commentsCount={commentsCount}
          isLoggedIn={isLoggedIn}
          open={commentsOpen}
          onOpenChange={setCommentsOpen}
        />
      )}
    </>
  );
}
