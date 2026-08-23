"use client";

import { useState, useTransition } from "react";

import { AuthPromptLazy, warmAuthPrompt } from "@/components/shared/auth-prompt/AuthPromptLazy";
import { ModontyBookmarkMark } from "@/components/icons/modonty-bookmark-mark";
import { ModontyCommentMark } from "@/components/icons/modonty-comment-mark";
import { ModontyLikeMark } from "@/components/icons/modonty-like-mark";
import { ModontyShareMark } from "@/components/icons/modonty-share-mark";

import { toggleReelLike, toggleReelFavorite } from "../actions/reel-interactions";
import { ReelCommentsSheetLazy, warmReelCommentsSheet } from "./reel-comments-sheet-lazy";

interface ReelActionsRailProps {
  reelId: string;
  slug: string;
  title: string;
  likesCount: number;
  favoritesCount: number;
  commentsCount: number;
  likedByMe: boolean;
  favoritedByMe: boolean;
  isLoggedIn: boolean;
}

const btn =
  "flex flex-col items-center gap-1 text-white transition active:scale-90";
const iconWrap =
  "flex size-11 items-center justify-center rounded-full bg-black/40 backdrop-blur transition";

export function ReelActionsRail({
  reelId,
  slug,
  title,
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
      if (navigator.share) await navigator.share({ title, url });
      else {
        await navigator.clipboard.writeText(url);
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
      <div className="absolute bottom-24 end-2 z-10 flex flex-col items-center gap-4">
        {/* Brand marks, not lucide (the rule that governs all nine mobile surfaces) — the
            like, comment, bookmark and share marks the article page already wears, size-5 in
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
          <span className={`${iconWrap} ${liked ? "bg-primary" : ""}`}>
            <ModontyLikeMark className="size-5" aria-hidden />
          </span>
          {/* A zero count draws nothing: in Arabic-Indic numerals zero is a DOT, and «٠»
              under a button reads as dirt on the screen, not as a number. The aria-label
              already names the action, so the button loses nothing. */}
          {likes > 0 && <span className="text-xs font-bold">{likes.toLocaleString("ar-SA")}</span>}
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
            <ModontyCommentMark className="size-5" aria-hidden />
          </span>
          {commentsCount > 0 && (
            <span className="text-xs font-bold">{commentsCount.toLocaleString("ar-SA")}</span>
          )}
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
          {/* The one allowed diamond exception: on the accent-coloured circle the accent
              diamond would vanish, so it flips to the dark foreground with the body. */}
          <span className={`${iconWrap} ${saved ? "bg-accent text-neutral-950" : ""}`}>
            <ModontyBookmarkMark className={`size-5 ${saved ? "[&>rect]:fill-current" : ""}`} aria-hidden />
          </span>
          {saves > 0 && <span className="text-xs font-bold">{saves.toLocaleString("ar-SA")}</span>}
        </button>
        <button type="button" onClick={handleShare} className={btn} aria-label="مشاركة">
          <span className={iconWrap}>
            <ModontyShareMark className="size-5" aria-hidden />
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
