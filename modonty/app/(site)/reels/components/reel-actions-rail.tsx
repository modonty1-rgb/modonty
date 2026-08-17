"use client";

import { useState, useTransition } from "react";
import Link from "next/link";

import { IconLike, IconSaved, IconShare } from "@/lib/icons";

import { toggleReelLike, toggleReelFavorite } from "../actions/reel-interactions";

// Comments deferred to the next release (Khalid 2026-07-06, amends reels decision ٧) —
// DB tables exist; the button returns with the comments panel.
interface ReelActionsRailProps {
  reelId: string;
  title: string;
  likesCount: number;
  favoritesCount: number;
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
  title,
  likesCount,
  favoritesCount,
  likedByMe,
  favoritedByMe,
  isLoggedIn,
}: ReelActionsRailProps) {
  const [liked, setLiked] = useState(likedByMe);
  const [likes, setLikes] = useState(likesCount);
  const [saved, setSaved] = useState(favoritedByMe);
  const [saves, setSaves] = useState(favoritesCount);
  const [hint, setHint] = useState<string | null>(null);
  const [loginPrompt, setLoginPrompt] = useState(false);
  const [, startTransition] = useTransition();

  function needLogin(): boolean {
    if (isLoggedIn) return false;
    setLoginPrompt(true);
    setTimeout(() => setLoginPrompt(false), 4000);
    return true;
  }

  function handleLike() {
    if (needLogin()) return;
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
    if (needLogin()) return;
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

  async function handleShare() {
    const url = `${window.location.origin}/reels`;
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

  return (
    <>
      {/* Login prompt — centered on the card so it can never be clipped */}
      {loginPrompt && (
        <div className="absolute inset-x-4 top-1/2 z-30 -translate-y-1/2 rounded-2xl bg-black/85 p-4 text-center backdrop-blur">
          <p className="mb-3 text-sm font-bold text-white">سجّل دخولك عشان تتفاعل مع الريلز</p>
          <div className="flex items-center justify-center gap-3">
            <Link
              href="/users/register"
              className="inline-block rounded-full bg-[#3030FF] px-6 py-2 text-sm font-bold text-white transition hover:bg-[#2020DD]"
            >
              اشترك مجاناً
            </Link>
            <Link href="/users/login" className="text-sm text-neutral-300 underline-offset-4 hover:text-white hover:underline">
              دخول
            </Link>
          </div>
        </div>
      )}
      {hint && (
        <div className="absolute inset-x-4 top-1/2 z-30 -translate-y-1/2 rounded-full bg-black/80 px-4 py-2 text-center text-sm text-white backdrop-blur">
          {hint}
        </div>
      )}
      <div className="absolute bottom-24 end-2 z-10 flex flex-col items-center gap-4">
      <button type="button" onClick={handleLike} className={btn} aria-label="إعجاب" aria-pressed={liked}>
        <span className={`${iconWrap} ${liked ? "bg-[#3030FF]" : ""}`}>
          <IconLike className={`size-5 ${liked ? "fill-white" : ""}`} />
        </span>
        <span className="text-xs font-bold">{likes}</span>
      </button>
      <button type="button" onClick={handleSave} className={btn} aria-label="حفظ" aria-pressed={saved}>
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
    </>
  );
}
