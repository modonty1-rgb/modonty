"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface Heading {
  index: number;
  text: string;
  level: number;
}

interface PreviewTocProps {
  content: string;
}

const SELECTOR = "#article-content h2, #article-content h3, #article-content h4";

export function PreviewToc({ content }: PreviewTocProps) {
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [activeIndex, setActiveIndex] = useState(-1);

  useEffect(() => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, "text/html");
    const els = doc.querySelectorAll("h2, h3, h4");
    const out: Heading[] = [];
    els.forEach((el, i) => {
      out.push({
        index: i,
        text: el.textContent?.trim() || "",
        level: parseInt(el.tagName.charAt(1), 10),
      });
    });
    setHeadings(out);
  }, [content]);

  useEffect(() => {
    if (headings.length === 0) return;
    const els = document.querySelectorAll(SELECTOR);
    if (els.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          const idx = Array.from(els).indexOf(e.target);
          if (idx >= 0) setActiveIndex(idx);
        });
      },
      { rootMargin: "-20% 0% -35% 0%" }
    );
    els.forEach((el) => observer.observe(el));
    return () => els.forEach((el) => observer.unobserve(el));
  }, [headings]);

  const scrollTo = (index: number) => {
    const el = document.querySelectorAll(SELECTOR)[index];
    if (el) {
      const y = el.getBoundingClientRect().top + window.pageYOffset - 80;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  if (headings.length === 0) return null;

  return (
    <Card className="sticky top-20 hover:shadow-md transition-shadow">
      <CardHeader>
        <CardTitle className="text-base font-semibold">جدول المحتويات</CardTitle>
      </CardHeader>
      <CardContent>
        <nav className="space-y-2">
          {headings.map((h) => (
            <button
              key={h.index}
              type="button"
              onClick={() => scrollTo(h.index)}
              className={cn(
                "block text-right w-full text-sm transition-colors hover:text-primary",
                h.level === 3 && "pr-3",
                h.level === 4 && "pr-6",
                activeIndex === h.index ? "text-primary font-medium" : "text-muted-foreground"
              )}
            >
              {h.text}
            </button>
          ))}
        </nav>
      </CardContent>
    </Card>
  );
}
