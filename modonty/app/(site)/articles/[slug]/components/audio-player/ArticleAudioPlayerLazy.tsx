"use client";

import dynamic from "next/dynamic";

/**
 * The player is the textbook case for deferring: 337 lines of client code for a control that
 * does nothing until someone taps «استمع», and nothing inside it is content a crawler reads.
 * Next's own guidance names this shape — «deferring a modal until a user clicks to open it».
 *
 * `ssr: false` keeps it out of the prerendered HTML as well as the first bundle. The fallback is
 * the tab's exact box, so the outline bar it rides does not change width when the real one lands.
 */
export const ArticleAudioPlayer = dynamic(
  () => import("./ArticleAudioPlayer").then((m) => ({ default: m.ArticleAudioPlayer })),
  {
    ssr: false,
    loading: () => <div className="size-11 shrink-0 rounded-xl bg-muted" aria-hidden />,
  }
);
