"use client";

import dynamic from "next/dynamic";

/** Tracking must never delay the article's first paint. */
export const ArticleViewTrackerLazy = dynamic(
  () => import("./ViewTracker").then((m) => ({ default: m.ArticleViewTracker })),
  { ssr: false }
);
