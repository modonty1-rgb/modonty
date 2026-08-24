"use client";

import { useState } from "react";
import Link from "next/link";
import { OptimizedImage, asMedia } from "@modonty/shared/components/optimized-image";

import { IconUser } from "@/lib/icons";

import { MyReelsSheetLazy, warmMyReelsSheet } from "./my-reels-sheet-lazy";

interface ReelViewerAvatarProps {
  /** The signed-in reader's picture, or null (signed out, or no picture set). */
  userImage: string | null;
  userName: string;
  isLoggedIn: boolean;
}

/**
 * The READER's own face at the head of the action rail — not the publisher's.
 *
 * The publisher is already named at the bottom of every reel (logo + name + link to their
 * page), so this slot carries the other half: «طلّاتي». Tapping it opens the sheet with the
 * reels this reader liked or saved — the destination those two buttons never had.
 *
 * No «+» here. A follow badge belongs under a publisher's avatar; under the reader's own it
 * would read «follow yourself». Following a partner stays where their identity is, at the
 * bottom pill.
 *
 * Signed out the same slot is the sign-in door — the one moment a watcher becomes a member.
 */
export function ReelViewerAvatar({ userImage, userName, isLoggedIn }: ReelViewerAvatarProps) {
  const [sheetMounted, setSheetMounted] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);

  if (!isLoggedIn) {
    return (
      <Link
        href="/users/login?callbackUrl=%2Freels"
        aria-label="سجّل الدخول لحفظ الطلّات"
        className="mb-2 grid size-11 place-items-center rounded-full bg-white/15 text-white ring-2 ring-white/70 backdrop-blur transition motion-safe:active:scale-95 focus-visible:outline-none focus-visible:ring-primary"
      >
        <IconUser className="size-6" aria-hidden />
      </Link>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setSheetMounted(true);
          setSheetOpen(true);
        }}
        onPointerEnter={warmMyReelsSheet}
        aria-label="طلّاتي — ما أعجبك وما حفظته"
        className="mb-2 block size-11 overflow-hidden rounded-full bg-neutral-800 ring-2 ring-white/90 transition motion-safe:active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        {userImage ? (
          <span className="relative block size-full">
            <OptimizedImage media={asMedia(userImage, userName)} alt="" fill sizes="44px" className="object-cover" />
          </span>
        ) : (
          <span className="grid size-full place-items-center text-white">
            <IconUser className="size-6" aria-hidden />
          </span>
        )}
      </button>

      {sheetMounted && <MyReelsSheetLazy open={sheetOpen} onOpenChange={setSheetOpen} />}
    </>
  );
}
