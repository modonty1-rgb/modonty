import { cx } from "../../lib/cx";
import type { ReactNode } from "react";

interface TwoColumnLayoutProps {
  /** Full-width content above the columns (e.g. breadcrumb + hero), inside the same container. */
  header?: ReactNode;
  /** Dominant column in RTL — renders first in DOM, sits on the visual right. */
  main: ReactNode;
  /** Secondary column in RTL — renders last in DOM, sits on the visual left. Pass pre-wrapped content (e.g. already inside a StickyRail) if it should stick. */
  rail: ReactNode;
  className?: string;
}

/**
 * The two-column sibling of `ThreeColumnLayout` — same container, same gap breakpoints,
 * one rail instead of two. Use when a page needs a single side rail (e.g. a profile page
 * with a related-links rail) rather than the full listing-page shell.
 */
export function TwoColumnLayout({ header, main, rail, className }: TwoColumnLayoutProps) {
  return (
    <div className={cx("container mx-auto max-w-[1128px] px-3 py-3 sm:px-4 sm:py-6", className)}>
      {header && <div className="mb-6">{header}</div>}
      <div className="flex flex-col items-start gap-6 lg:flex-row lg:justify-center min-[1240px]:gap-4 min-[1296px]:gap-6">
        <div className="mx-auto w-full space-y-3 sm:space-y-4 lg:mx-0 lg:flex-1">{main}</div>
        {rail}
      </div>
    </div>
  );
}
