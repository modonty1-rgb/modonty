"use client";

import dynamic from "next/dynamic";

/**
 * The sheet ships nothing until a viewer actually taps the comment tab — same contract as
 * AuthPromptLazy: `ssr: false` keeps it out of the server render, `dynamic` keeps its code
 * (form, avatars, relative time) in a chunk fetched on that first tap.
 */
export const ReelCommentsSheetLazy = dynamic(
  () => import("./reel-comments-sheet").then((mod) => mod.ReelCommentsSheet),
  { ssr: false }
);

/** Fetch the chunk on approach, so the tap opens the sheet instead of starting a download. */
export function warmReelCommentsSheet() {
  void import("./reel-comments-sheet");
}
