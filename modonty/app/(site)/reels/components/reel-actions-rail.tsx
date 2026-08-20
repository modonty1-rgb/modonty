"use client";

import { useState, useTransition } from "react";

import { AuthPromptLazy, warmAuthPrompt } from "@/components/shared/auth-prompt/AuthPromptLazy";
import { IconComment, IconLike, IconSaved, IconShare } from "@/lib/icons";

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
        setHint("انسخ الرابط ✓");
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
        <button
          type="button"
          onClick={handleLike}
          onPointerEnter={warmAuth}
          onPointerDown={warmAuth}
          className={btn}
          aria-label="إعجاب"
          aria-pressed={liked}
        >
          <span className={`${iconWrap} ${liked ? "bg-[#3030FF]" : ""}`}>
            <IconLike className={`size-5 ${liked ? "fill-white" : ""}`} />
          </span>
          <span className="text-xs font-bold">{likes}</span>
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
            <IconComment className="size-5" />
          </span>
          <span className="text-xs font-bold">{commentsCount}</span>
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
          <span className={`${iconWrap} ${saved ? "bg-[#00D8D8] text-neutral-950" : ""}`}>
            <IconSaved className={`size-5 ${saved ? "fill-current" : ""}`} />
          </span>
          <span className="text-xs font-bold">{saves}</span>
        </button>
        <button type="button" onClick={handleShare} className={btn} aria-label="مشاركة">
          <span className={iconWrap}>
            <IconShare className="size-5" />
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
