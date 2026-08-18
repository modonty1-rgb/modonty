"use client";

import dynamic from "next/dynamic";

export const ArticleTableOfContents = dynamic(
  () => import("./TableOfContents").then((mod) => ({ default: mod.ArticleTableOfContents })),
  { ssr: false }
);
