"use client";

import dynamic from "next/dynamic";

/**
 * Like, save, comment, share and listen are all actions — none of them is content, and none of
 * them means anything to a crawler. The bundle they pull in (the auth dialog, the comment
 * dialog, the audio player) is the heaviest client code on this page, and it was arriving
 * before the reader had read a word.
 *
 * The placeholder reserves the exact tab height (48px), so the row does not jump when the real
 * tabs land.
 */
export const ArticleTopEngagementBar = dynamic(
  () => import("./TopEngagementBar").then((m) => ({ default: m.ArticleTopEngagementBar })),
  {
    ssr: false,
    loading: () => <div className="h-12 w-full" aria-hidden />,
  }
);
