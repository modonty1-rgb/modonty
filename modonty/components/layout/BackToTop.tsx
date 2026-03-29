"use client";

import { useEffect, useState } from "react";
import { IconScrollTop } from "@/lib/icons";
import { Button } from "@/components/ui/button";

export function BackToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 800) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility, { passive: true });

    return () => {
      window.removeEventListener("scroll", toggleVisibility);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <Button
      onClick={scrollToTop}
      size="icon"
      className={
        isVisible
          ? "fixed bottom-20 md:bottom-8 left-4 z-40 h-12 w-12 rounded-full shadow-lg transition-all duration-200 ease-out opacity-100 translate-y-0 pointer-events-auto"
          : "fixed bottom-20 md:bottom-8 left-4 z-40 h-12 w-12 rounded-full shadow-lg transition-all duration-200 ease-out opacity-0 translate-y-2 pointer-events-none"
      }
      aria-label="العودة للأعلى"
    >
      <IconScrollTop className="h-5 w-5" />
    </Button>
  );
}
