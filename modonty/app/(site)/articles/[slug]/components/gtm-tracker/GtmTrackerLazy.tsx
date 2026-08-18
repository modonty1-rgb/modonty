"use client";

import dynamic from "next/dynamic";

/** `ssr: false` is only legal inside a client file, so each lazy wrapper sits beside its own
 *  component instead of in one shared bag. */
export const GtmTrackerLazy = dynamic(
  () => import("@/components/tracking/GTMClientTracker").then((m) => ({ default: m.GTMClientTracker })),
  { ssr: false }
);
