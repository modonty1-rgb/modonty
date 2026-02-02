"use client";

import dynamic from "next/dynamic";

export const ReadingProgressBar = dynamic(
  () => import("./reading-progress-bar").then((mod) => ({ default: mod.ReadingProgressBar })),
  { 
    ssr: false,
    loading: () => (
      <div className="fixed top-0 left-0 right-0 h-1 bg-background z-50" aria-hidden="true">
        <div className="h-full bg-primary" style={{ width: "0%" }} />
      </div>
    )
  }
);
