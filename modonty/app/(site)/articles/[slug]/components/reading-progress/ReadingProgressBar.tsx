"use client";

import { useEffect, useState } from "react";

export function ReadingProgressBar() {
  const [progress, setProgress] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    const updateProgress = () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollTop = window.scrollY;
      const totalScrollable = documentHeight - windowHeight;
      const scrollProgress = totalScrollable > 0 ? (scrollTop / totalScrollable) * 100 : 0;
      setProgress(Math.min(100, Math.max(0, scrollProgress)));
    };

    window.addEventListener("scroll", updateProgress);
    updateProgress();

    return () => window.removeEventListener("scroll", updateProgress);
  }, []);

  return (
    // `top-[var(--sticky-chrome)]`, not `top-14`: on the phone the tabs band hangs under the
    // header and `top-14` drew this line across the tabs' welded top edge (measured 23 Aug:
    // bar y=56, band y=56–135). The token is 135px on phones (this page's tab is active) and
    // 56px from `lg` up, so the desktop line does not move.
    <div className="fixed top-[var(--sticky-chrome)] left-0 right-0 h-1 bg-background z-40">
      <div
        className="h-full bg-accent transition-all duration-150"
        style={{ width: mounted ? `${progress}%` : "0%" }}
        aria-hidden="true"
      />
    </div>
  );
}
