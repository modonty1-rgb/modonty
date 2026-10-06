"use client";

import dynamic from "next/dynamic";

export const ReadingProgressBar = dynamic(
  () => import("./ReadingProgressBar").then((mod) => ({ default: mod.ReadingProgressBar })),
  { 
    ssr: false,
    loading: () => (
      <div data-reading-progress className="fixed top-0 left-0 right-0 z-50 h-1 bg-transparent" aria-hidden="true">
        <div className="h-full bg-accent" style={{ width: "0%" }} />
      </div>
    )
  }
);
