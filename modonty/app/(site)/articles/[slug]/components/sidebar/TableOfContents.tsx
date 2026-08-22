"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { IconChevronLeft } from "@/lib/icons";
import { cn } from "@/lib/utils";
import type { ArticleHeading } from "@/app/(site)/articles/[slug]/helpers/read-article-outline";

interface ArticleTableOfContentsProps {
  /** Read from the body on the server, so the links exist in the HTML. */
  headings: ArticleHeading[];
  /** Render as a collapsible card — used on mobile, where the list would fill the screen. */
  collapsible?: boolean;
  /**
   * Controls that belong to the article body, parked at the far end of the outline bar —
   * the reading tools on a phone. Collapsible only: the desktop rail has its own place for them.
   */
  actions?: ReactNode;
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
export function ArticleTableOfContents({
  headings,
  collapsible = false,
  actions,
}: ArticleTableOfContentsProps) {
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
          // Picking a section closes the outline (Khalid, 22 Aug). It is a menu: the reader
          // asked to be taken somewhere, and leaving it open means they land behind the list
          // that sent them — on a phone it covers most of what they just chose to read.
          // Collapsible only; the desktop rail's copy is meant to stay open beside the article.
          onClick={collapsible ? () => setOpen(false) : undefined}
          className={cn(
            // `min-h-11` on phones: a 20px row in a list of twenty is a coin toss under a thumb.
            "block w-full scroll-mt-20 py-0.5 text-right text-xs transition-colors hover:text-primary max-lg:flex max-lg:min-h-11 max-lg:items-center",
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
      /* A floating material, not an opaque strip: this bar pins while the article scrolls under
         it, and Apple's rule for chrome that overlaps content is translucency + blur, so the
         reader keeps seeing where they are. `supports-[backdrop-filter]` guards the fallback —
         without blur the same 75% white would let the text read straight through it. A reader
         who asked the system for less transparency gets the solid bar back. */
      <Card
        className={cn(
          "min-w-0 bg-card shadow-sm",
          "supports-[backdrop-filter]:bg-card/75 supports-[backdrop-filter]:backdrop-blur-xl supports-[backdrop-filter]:backdrop-saturate-150",
          "motion-reduce:supports-[backdrop-filter]:bg-card"
        )}
      >
        {/* The toggle and the tools are siblings, not nested — a control inside a <button> is
            invalid markup and every tap on it would toggle the outline instead.
            No tint of its own: a light translucent layer stacked on another light translucent
            layer is where legibility collapses, so the card carries the material alone. */}
        <div className="flex items-center justify-between gap-2 px-3 py-1.5">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            /* Feedback on the press, not on the release — and `active:` fires on pointer-down.
               `min-h-11` is the fingertip floor; the label alone was 20px tall. */
            className="-mx-1 flex min-h-11 min-w-0 items-center gap-1.5 rounded-lg px-1 transition-transform active:scale-[0.97] motion-reduce:active:scale-100"
            aria-expanded={open}
          >
            {/* Small text wants tracking slightly OPEN, not tight — tight tracking is for display
                sizes, where letters drift apart as they grow. This label is 12px. */}
            <span className="truncate text-xs font-semibold text-muted-foreground">جدول المحتويات</span>
            <IconChevronLeft className={cn("h-4 w-4 shrink-0 text-muted-foreground transition-transform", open ? "rotate-90" : "-rotate-90")} />
          </button>
          {actions}
        </div>
        {open && (
          <>
            <div className="border-b border-border" />
            {/* Capped: pinned under the tabs, a long outline would otherwise cover the article
                it is meant to navigate. */}
            <div className="max-h-[45vh] overflow-y-auto overscroll-contain">{list}</div>
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
