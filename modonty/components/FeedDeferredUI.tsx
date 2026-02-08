"use client";

import dynamic from "next/dynamic";

const ScrollProgress = dynamic(
  () => import("@/components/ScrollProgress").then((m) => ({ default: m.ScrollProgress })),
  { ssr: false }
);
const BackToTop = dynamic(
  () => import("@/components/BackToTop").then((m) => ({ default: m.BackToTop })),
  { ssr: false }
);

export function FeedDeferredUI() {
  return (
    <>
      <ScrollProgress />
      <BackToTop />
    </>
  );
}
