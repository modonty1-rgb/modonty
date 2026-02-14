"use client";

import { useEffect, useState } from "react";

/**
 * Inline scroll progress bar for client page. Renders inside the sticky tabs nav,
 * at the bottom, with no gap. Reuses the same visual style as ScrollProgress.
 */
export function ClientScrollProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const updateProgress = () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollTop = window.scrollY;
      const scrollPercent = (scrollTop / (documentHeight - windowHeight)) * 100;
      setProgress(Math.min(scrollPercent, 100));
    };

    const throttledUpdate = () => {
      requestAnimationFrame(updateProgress);
    };

    window.addEventListener("scroll", throttledUpdate, { passive: true });
    updateProgress();

    return () => {
      window.removeEventListener("scroll", throttledUpdate);
    };
  }, []);

  return (
    <div className="relative -mx-4 h-1 bg-muted z-40">
      <div
        className="h-full bg-accent from-primary via-accent to-primary transition-all duration-150 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
