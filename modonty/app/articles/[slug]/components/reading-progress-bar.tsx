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
    <div className="fixed top-14 left-0 right-0 h-1 bg-background z-40">
      <div
        className="h-full bg-primary transition-all duration-150"
        style={{ width: mounted ? `${progress}%` : "0%" }}
        aria-hidden="true"
      />
    </div>
  );
}
