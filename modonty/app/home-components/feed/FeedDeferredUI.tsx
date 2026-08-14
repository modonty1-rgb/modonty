"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

const ScrollProgress = dynamic(
  () =>
    import("@/app/home-components/ScrollProgress").then((m) => ({
      default: m.ScrollProgress,
    })),
  { ssr: false }
);

const BackToTop = dynamic(
  () =>
    import("@/app/home-components/BackToTop").then((m) => ({
      default: m.BackToTop,
    })),
  { ssr: false }
);

export function FeedDeferredUI() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    let timeoutId: number | undefined;

    const enable = () => {
      setEnabled(true);
      window.removeEventListener("scroll", onScroll);
      if (timeoutId !== undefined) {
        window.clearTimeout(timeoutId);
      }
    };

    const onScroll = () => {
      if (window.scrollY > 80) {
        enable();
      }
    };

    // Enable after first small scroll, or after a short delay as fallback.
    window.addEventListener("scroll", onScroll, { passive: true });
    timeoutId = window.setTimeout(enable, 2000);

    return () => {
      window.removeEventListener("scroll", onScroll);
      if (timeoutId !== undefined) {
        window.clearTimeout(timeoutId);
      }
    };
  }, []);

  if (!enabled) {
    return null;
  }

  return (
    <>
      <ScrollProgress />
      <BackToTop />
    </>
  );
}
