"use client";

import dynamic from "next/dynamic";

export const ArticleBodyLinkTrackerLazy = dynamic(
  () => import("./BodyLinkTracker").then((m) => ({ default: m.ArticleBodyLinkTracker })),
  { ssr: false }
);
