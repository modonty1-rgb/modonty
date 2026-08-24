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
// 24 Aug 2026 — rebuilt against TikTok's own phone rail, which Khalid handed as the reference
// («الأيقونز صغيرة، البادنق اللي حواليها ماكل نص المكان»). The mark was 20px inside a 44px
// tinted circle: 45% glyph, 55% padding, and the circle WAS that padding. TikTok draws no
// circle at all — a bare white glyph over the footage, kept legible by a drop shadow.
//
// So the 44 box stays (it is the tap target, and it is the one thing a thumb needs) but turns
// transparent, and the glyph grows 20 → 32. Legibility over bright frames now comes from the
// shadow, not from a plate behind it.
const iconWrap = "flex size-11 items-center justify-center rounded-full transition";
const iconGlyph = "size-8 drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]";

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
      {/* Phone: overlaid on the clip. `bottom-36` clears the caption block (which now ends
          ~96px up, above the bottom bar) — at `bottom-24` the share button sat on the byline.
          From `md` up it steps OUT of the card (`-end-16`) and centres beside it, where
          TikTok's desktop puts the same four counts; the card stops clipping at that same
          breakpoint, so nothing here is cut. */}
      <div className="absolute bottom-36 end-3 z-10 flex flex-col items-center gap-4 md:bottom-auto md:-end-16 md:top-1/2 md:-translate-y-1/2 md:gap-6">
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
          {/* The word until there is a number, then the number — TikTok's own rule. A zero is
              still never drawn («٠» in Arabic-Indic is a DOT, and it read as dirt on the
              screen), but hiding the line entirely left three buttons blank beside a fourth
              carrying «مشاركة», so the column stood uneven on every reel with no counts yet
              (Khalid saw it on the phone, 24 Aug). One line under all four, always. */}
          <span className="text-xs font-bold">{likes > 0 ? likes.toLocaleString("ar-SA") : "إعجاب"}</span>
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
          <span className="text-xs font-bold">{commentsCount > 0 ? commentsCount.toLocaleString("ar-SA") : "تعليق"}</span>
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
          <span className="text-xs font-bold">{saves > 0 ? saves.toLocaleString("ar-SA") : "حفظ"}</span>
        </button>
        <button type="button" onClick={handleShare} className={btn} aria-label="مشاركة">
          <span className={iconWrap}>
            <ModontyShareMark className={iconGlyph} aria-hidden />
          </span>
          <span className="text-xs font-bold">مشاركة</span>
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
