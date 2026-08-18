"use client";

import dynamic from "next/dynamic";

export const FeaturedImageNewsletterLazy = dynamic(
  () => import("./FeaturedImageNewsletter").then((m) => ({ default: m.ArticleFeaturedImageNewsletter })),
  { ssr: false }
);
