"use client";

import { useEffect, useState } from "react";

export function PreviewReadingProgress() {
  const [progress, setProgress] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const main = document.querySelector("main");
    const useWindow = !main;

    const updateProgress = () => {
      const scrollTop = useWindow ? window.scrollY : (main as HTMLElement).scrollTop;
      const scrollHeight = useWindow ? document.documentElement.scrollHeight : (main as HTMLElement).scrollHeight;
      const clientHeight = useWindow ? window.innerHeight : (main as HTMLElement).clientHeight;
      const total = scrollHeight - clientHeight;
      const pct = total > 0 ? (scrollTop / total) * 100 : 0;
      setProgress(Math.min(100, Math.max(0, pct)));
    };

    const target = useWindow ? window : (main as HTMLElement);
    target.addEventListener("scroll", updateProgress);
    updateProgress();

    return () => target.removeEventListener("scroll", updateProgress);
  }, []);

  return (
    <div className="fixed top-0 left-0 right-0 h-1 bg-background z-50" aria-hidden="true">
      <div
        className="h-full bg-primary transition-all duration-150"
        style={{ width: mounted ? `${progress}%` : "0%" }}
      />
    </div>
  );
}
