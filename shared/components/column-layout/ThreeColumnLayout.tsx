import { cx } from "../../lib/cx";
import type { ReactNode } from "react";

interface ThreeColumnLayoutProps {
  /** Full-width content above the columns (e.g. breadcrumb + hero), inside the same container. */
  header?: ReactNode;
  /** Right column in RTL — renders first in DOM. Pass pre-wrapped content (e.g. already inside a StickyRail) if it should stick. */
  right: ReactNode;
  /** Main column — width-capped, does not stick. */
  center: ReactNode;
  /** Left column in RTL — renders last in DOM. Pass pre-wrapped content (e.g. already inside a StickyRail) if it should stick. */
  left: ReactNode;
  className?: string;
}

/**
 * The three-column shell every modonty listing page shares — the homepage, `/clients`,
 * `/industries` and `/modonty` all duplicated this exact container/flex/width markup
 * independently before this existed (Khalid, 2026-08-17: stop founding it from scratch
 * every time). `right`/`center`/`left` are plain slots — this component owns only the
 * shell's widths and gaps, never the rail behavior, so a caller free to pass raw content
 * or content already wrapped in a sticky rail.
 */
export function ThreeColumnLayout({ header, right, center, left, className }: ThreeColumnLayoutProps) {
  return (
    // `max-lg:` only — desktop keeps every value it had. On a 390px screen the shell was
    // spending 12px above the breadcrumb, 24px under the header and 24px between the
    // stacked columns before a single word of content: 60px of a 844px screen on gaps that
    // exist to separate columns which, below `lg`, are not columns at all.
    <div className={cx("container mx-auto max-w-[1128px] px-3 py-3 max-lg:py-1.5 sm:px-4 sm:py-6", className)}>
      {header && <div className="mb-6 max-lg:mb-4">{header}</div>}
      <div className="flex flex-col items-start gap-6 max-lg:gap-4 lg:flex-row lg:justify-center min-[1240px]:gap-4 min-[1296px]:gap-6">
        {right}
        <div className="mx-auto w-full space-y-3 pb-20 sm:space-y-4 md:max-w-[600px] lg:pb-0 lg:mx-0 lg:flex-1 min-[1240px]:max-w-[560px] min-[1296px]:max-w-[600px]">
          {center}
        </div>
        {left}
      </div>
    </div>
  );
}
