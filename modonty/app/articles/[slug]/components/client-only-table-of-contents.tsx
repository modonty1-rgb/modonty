"use client";

import dynamic from "next/dynamic";

export const ArticleTableOfContents = dynamic(
  () => import("./article-table-of-contents").then((mod) => ({ default: mod.ArticleTableOfContents })),
  { ssr: false }
);
