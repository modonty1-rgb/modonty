"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface Heading {
  id: string;
  text: string;
  level: number;
}

interface ArticleTableOfContentsProps {
  content: string;
}

export function ArticleTableOfContents({ content: _ }: ArticleTableOfContentsProps) {
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [activeId, setActiveId] = useState<string>("");

  // Read headings from the live DOM and inject IDs if missing
  useEffect(() => {
    const articleContent = document.getElementById("article-content");
    if (!articleContent) return;

    const headingEls = articleContent.querySelectorAll<HTMLElement>("h2, h3, h4");
    const extracted: Heading[] = [];

    headingEls.forEach((el, index) => {
      if (!el.id) {
        el.id = `toc-${index}`;
      }
      extracted.push({
        id: el.id,
        text: el.textContent || "",
        level: parseInt(el.tagName.charAt(1)),
      });
    });

    setHeadings(extracted);
  }, []);

  useEffect(() => {
    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // Pick the topmost visible heading
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length > 0) {
          setActiveId(visible[0].target.id);
        }
      },
      { rootMargin: "-10% 0% -60% 0%" }
    );

    headings.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [headings]);

  if (headings.length === 0) {
    return null;
  }

  const scrollToHeading = (id: string) => {
    const element = document.getElementById(id);
    if (!element) return;
    const offsetPosition = element.getBoundingClientRect().top + window.scrollY - 80;
    window.scrollTo({ top: offsetPosition, behavior: "smooth" });
  };

  return (
    <Card className="min-w-0">
      <div className="px-4 py-3 bg-muted/40 rounded-t-lg">
        <span className="text-xs font-semibold text-muted-foreground tracking-tight">جدول المحتويات</span>
      </div>
      <div className="border-b border-border" />
      <div className="px-4 py-3">
        <nav className="space-y-1">
          {headings.map((heading) => (
            <button
              key={heading.id}
              onClick={() => scrollToHeading(heading.id)}
              className={cn(
                "block text-right w-full text-xs transition-colors hover:text-primary py-0.5",
                heading.level === 3 && "pr-3",
                heading.level === 4 && "pr-6",
                activeId === heading.id
                  ? "text-primary font-semibold"
                  : "text-muted-foreground"
              )}
            >
              {heading.text}
            </button>
          ))}
        </nav>
      </div>
    </Card>
  );
}
