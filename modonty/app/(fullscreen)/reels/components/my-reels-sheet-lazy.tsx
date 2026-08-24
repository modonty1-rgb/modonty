"use client";

import dynamic from "next/dynamic";

/**
 * Same contract as `ReelCommentsSheetLazy`: nothing ships until the reader taps their own
 * avatar, so a visitor who only watches never downloads the grid, its images or its tabs.
 */
export const MyReelsSheetLazy = dynamic(
  () => import("./my-reels-sheet").then((mod) => mod.MyReelsSheet),
  { ssr: false }
);

/** Fetch the chunk on approach, so the tap opens the sheet instead of starting a download. */
export function warmMyReelsSheet() {
  void import("./my-reels-sheet");
}
