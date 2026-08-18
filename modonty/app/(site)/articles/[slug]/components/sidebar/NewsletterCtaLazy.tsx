"use client";

import dynamic from "next/dynamic";

export const NewsletterCtaLazy = dynamic(
  () => import("./NewsletterCta").then((m) => ({ default: m.NewsletterCTA })),
  { ssr: false }
);
