import { cn } from "@/lib/utils";

interface AccentHeadingProps {
  id?: string;
  /** `eyebrow` = 12/500 rail label · `title` = 20/500 section title (DESIGN-SYSTEM §3.3). */
  size: "eyebrow" | "title";
  children: string;
  className?: string;
}

/**
 * The one section-heading treatment on modonty's own pages: the brand diamond before the
 * words. Same mark over the rails and the feed on `/modonty` and over each department on
 * `/team`, so the pages read as one voice, not three widgets. Promoted out of `/modonty`
 * on 2026-08-17 when `/team` became its second consumer.
 *
 * It was a teal DASH until 22 Aug 2026 (Khalid: «replace the line with our dot»). A dash
 * is a generic rule — every site has one, and it said nothing about whose page this is.
 * The diamond is the brand's signature, the same shape sitting inside all 47 marks, so a
 * section title now carries the identity the icons carry. Drawn with the icon set's own
 * geometry rather than a new shape: a square rotated 45° with a small radius, matching the
 * `14 · rx 2` proportion the whole set uses (DESIGN-SYSTEM «أحجام الأيقونات»).
 *
 * Teal as a MARK, never as text — `bg-accent` fill is fine; `text-accent` would fail AA
 * on light.
 */
export function AccentHeading({ id, size, children, className }: AccentHeadingProps) {
  const Tag = size === "title" ? "h2" : "p";
  return (
    <Tag
      id={id}
      className={cn(
        "flex items-center gap-2 font-medium text-foreground",
        size === "title" ? "text-xl leading-tight" : "text-xs leading-tight text-foreground/75",
        className,
      )}
    >
      {/* `rounded-[2px]` before the rotation, so the corners land soft at 45° the way the
          icon set's `rx="2"` diamond does — a hard-cornered square reads as a bullet. */}
      <span
        aria-hidden
        className={cn(
          "shrink-0 rotate-45 rounded-[2px] bg-accent",
          size === "title" ? "size-2.5" : "size-2",
        )}
      />
      {children}
    </Tag>
  );
}
