"use client";

import dynamic from "next/dynamic";

export const ArticleUtilities = dynamic(
  () => import("./article-utilities").then((mod) => ({ default: mod.ArticleUtilities })),
  { ssr: false }
);
