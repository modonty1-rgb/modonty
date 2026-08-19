"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { IconChevronLeft } from "@/lib/icons";
import { cn } from "@/lib/utils";
import type { ArticleHeading } from "@/app/(site)/articles/[slug]/helpers/read-article-outline";

interface ArticleTableOfContentsProps {
  /** Read from the body on the server, so the links exist in the HTML. */
  headings: ArticleHeading[];
  /** Render as a collapsible card — used on mobile, where the list would fill the screen. */
  collapsible?: boolean;
}

/**
 * The article's outline.
 *
 * The entries are real `<a href="#id">` links, and the ids come from the server, so a crawler
 * sees the structure, a section can be linked to and opened in a new tab, and the list is there
 * before any JavaScript runs. Previously the headings were read from the DOM after mount and
 * rendered as buttons: nothing in the HTML, no linkable section, and index-based ids that moved
 * whenever a section was added above them.
 *
 * The only client work left is highlighting the section you are in.
 */
export function ArticleTableOfContents({ headings, collapsible = false }: ArticleTableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>("");
  const [open, setOpen] = useState(!collapsible);

  useEffect(() => {
    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length > 0) setActiveId(visible[0].target.id);
      },
      { rootMargin: "-10% 0% -60% 0%" }
    );

    for (const { id } of headings) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, [headings]);

  if (headings.length === 0) return null;

  const list = (
    <nav className="space-y-1 px-4 py-3">
      {headings.map((heading) => (
        <a
          key={heading.id}
          href={`#${heading.id}`}
          aria-current={activeId === heading.id ? "location" : undefined}
          className={cn(
            "block w-full scroll-mt-20 py-0.5 text-right text-xs transition-colors hover:text-primary",
            heading.level === 3 && "pe-3",
            heading.level === 4 && "pe-6",
            activeId === heading.id ? "font-semibold text-primary" : "text-muted-foreground"
          )}
        >
          {heading.text}
        </a>
      ))}
    </nav>
  );

  if (collapsible) {
    return (
      <Card className="min-w-0">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className={cn(
            "flex w-full items-center justify-between rounded-t-lg bg-muted/40 px-4 py-3",
            !open && "rounded-b-lg"
          )}
          aria-expanded={open}
        >
          <span className="text-xs font-semibold tracking-tight text-muted-foreground">جدول المحتويات</span>
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
      <div className="rounded-t-lg bg-muted/40 px-4 py-3">
        <span className="text-xs font-semibold tracking-tight text-muted-foreground">جدول المحتويات</span>
      </div>
      <div className="border-b border-border" />
      {list}
    </Card>
  );
}
