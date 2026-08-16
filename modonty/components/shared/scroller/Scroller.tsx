import type { ReactNode } from "react";

interface ScrollerProps {
  /** Spoken name of the row, e.g. "المجالات". Screen readers announce it. */
  label: string;
  children: ReactNode;
  /** Row padding and gap. Set it per card so the row matches its container. */
  className?: string;
}

// A horizontal row that scrolls with the browser's own scroller: touch, momentum,
// snap points, keyboard and RTL all come from the browser. Zero client JavaScript,
// so the row works the instant the HTML lands.
//
// tabIndex + role make the scroll container reachable by keyboard — a scrollable
// region with no focusable wrapper is unreachable for keyboard-only visitors.
//
// Use this for a ROW of equal tiles. A carousel with one active slide and a loop is
// a different thing and needs real client state.
export function Scroller({ label, children, className }: ScrollerProps) {
  return (
    <div
      role="region"
      aria-label={label}
      tabIndex={0}
      // snap-proximity, not mandatory: mandatory fights the finger mid-swipe.
      className={`flex snap-x snap-proximity overflow-x-auto scrollbar-rail focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${className ?? "gap-3 px-3 pb-3 sm:px-5"}`}
      dir="rtl"
    >
      {children}
    </div>
  );
}
