"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { IconChevronLeft } from "@/lib/icons";
import { cn } from "@/lib/utils";

interface Heading {
  id: string;
  text: string;
  level: number;
}

interface ArticleTableOfContentsProps {
  content: string;
  /** Render as a collapsible card (collapsed by default) — compact for a sidebar. */
  collapsible?: boolean;
}

export function ArticleTableOfContents({ content: _, collapsible = false }: ArticleTableOfContentsProps) {
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [activeId, setActiveId] = useState<string>("");
  const [open, setOpen] = useState(false);

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

  const list = (
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
  );

  if (collapsible) {
    return (
      <Card className="min-w-0">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className={cn(
            "flex w-full items-center justify-between px-4 py-3 bg-muted/40 rounded-t-lg",
            !open && "rounded-b-lg"
          )}
          aria-expanded={open}
        >
          <span className="text-xs font-semibold text-muted-foreground tracking-tight">جدول المحتويات</span>
          <IconChevronLeft className={cn("h-4 w-4 text-muted-foreground transition-transform", open ? "rotate-90" : "-rotate-90")} />
        </button>
        {open && (
          <>
            <div className="border-b border-border" />
            {list}
          </>
        )}
      </Card>
    );
  }

  return (
    <Card className="min-w-0">
      <div className="px-4 py-3 bg-muted/40 rounded-t-lg">
        <span className="text-xs font-semibold text-muted-foreground tracking-tight">جدول المحتويات</span>
      </div>
      <div className="border-b border-border" />
      {list}
    </Card>
  );
}
