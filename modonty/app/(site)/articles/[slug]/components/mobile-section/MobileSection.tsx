"use client";

import { useEffect, useId, useState } from "react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";
import { SectionBar } from "../section-bar/SectionBar";

interface MobileSectionProps {
  /** The section's name, shown in the closed bar so the reader can decide without opening. */
  title: string;
  /** How much is inside — «التعليقات ١٢». A count is what makes a closed bar decidable. */
  count?: number | null;
  /** Open on first paint. The first collapsed section uses it so the page never reads as empty. */
  defaultOpen?: boolean;
  /**
   * Ids inside this panel that something on the page links to (`#article-faq`,
   * `#article-comments`). Arriving on one of them opens the section — otherwise the link
   * lands on a closed box and the reader thinks it is broken.
   */
  anchorIds?: string[];
  children: ReactNode;
}

/**
 * A section the reader opens on a phone, and an ordinary section on a desktop.
 *
 * The rule that shapes it: the content is ALWAYS rendered into the HTML and only hidden with
 * CSS. Google is explicit that it will not load content that needs an interaction to appear
 * («Google won't load content that requires user interactions … to load»), so the usual React
 * shape — `{open && <Panel/>}` — would take these sections out of the page as far as a crawler
 * is concerned. Collapsing here is a row-height animation over content that is already there.
 *
 * `visibility` and not just height: a zero-height overflow box still holds focusable links, so a
 * keyboard would tab into a closed section. `invisible` takes them out of the tab order, and the
 * `lg:` twin puts everything back for a desktop, where nothing collapses at all.
 *
 * Accessibility follows the ARIA authoring practice for an accordion: the title is a button, it
 * carries `aria-expanded` and `aria-controls`, and the panel is a region labelled by it.
 */
export function MobileSection({
  title,
  count,
  defaultOpen = false,
  anchorIds,
  children,
}: MobileSectionProps) {
  const reactId = useId();
  const headerId = `${reactId}-head`;
  const panelId = `${reactId}-panel`;
  const [open, setOpen] = useState(defaultOpen);

  // A link elsewhere on the page points inside this panel — open it, then let the browser's own
  // anchor scrolling finish the job. `hashchange` covers the second tap on the same link.
  useEffect(() => {
    if (!anchorIds?.length) return;
    const openIfMine = () => {
      const hash = decodeURIComponent(window.location.hash.replace("#", ""));
      if (hash && anchorIds.includes(hash)) {
        setOpen(true);
        // After the row has grown, or the browser scrolls to a box that is still 0px tall.
        requestAnimationFrame(() =>
          document.getElementById(hash)?.scrollIntoView({ block: "start" })
        );
      }
    };
    openIfMine();
    window.addEventListener("hashchange", openIfMine);
    return () => window.removeEventListener("hashchange", openIfMine);
  }, [anchorIds]);

  return (
    /* `lg:contents` on every level of this wrapper: a desktop must not move by one pixel, and a
       wrapper is never free — turning the panel into a grid stopped the children's margins from
       collapsing through it and the page grew 12px at 1280. `display:contents` removes the boxes
       entirely above lg, so the sections lay out exactly as they did before this component. */
    <section className="mb-4 lg:contents">
      <h2 className="contents lg:hidden">
        <SectionBar
          title={title}
          count={count}
          open={open}
          onToggle={() => setOpen((v) => !v)}
          id={headerId}
          controls={panelId}
          className="lg:hidden"
        />
      </h2>

      <div
        id={panelId}
        role="region"
        aria-labelledby={headerId}
        className={cn(
          "grid transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none",
          "lg:contents",
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        )}
      >
        <div
          className={cn(
            "overflow-hidden lg:visible lg:contents",
            // The section's own title bar is the button above on a phone; two titles stacked
            // is the duplication this component exists to avoid.
            "max-lg:[&_[data-section-head]]:hidden",
            !open && "invisible"
          )}
        >
          <div
            className={cn(
              "lg:contents",
              open
                ? "max-lg:rounded-b-xl max-lg:border max-lg:border-border max-lg:p-3"
                : "max-lg:border-0 max-lg:p-0"
            )}
          >
            {children}
          </div>
        </div>
      </div>
    </section>
  );
}
