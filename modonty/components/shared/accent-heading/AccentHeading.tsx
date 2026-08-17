import { cn } from "@/lib/utils";

interface AccentHeadingProps {
  id?: string;
  /** `eyebrow` = 12/500 rail label · `title` = 20/500 section title (DESIGN-SYSTEM §3.3). */
  size: "eyebrow" | "title";
  children: string;
  className?: string;
}

/**
 * The one section-heading treatment on modonty's own pages: a short teal dash before the
 * words. Same mark over the rails and the feed on `/modonty` and over each department on
 * `/team`, so the pages read as one voice, not three widgets. Promoted out of `/modonty`
 * on 2026-08-17 when `/team` became its second consumer.
 * Teal as a MARK not as text (`bg-accent` fill is fine; `text-accent` would fail AA on light).
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
      <span aria-hidden className={cn("h-0.5 shrink-0 rounded-full bg-accent", size === "title" ? "w-5" : "w-4")} />
      {children}
    </Tag>
  );
}
