"use client";

import { useRef, useEffect, useState } from "react";
import Link from "@/components/link";
import { useSelectedLayoutSegment } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { ClientScrollProgress } from "./client-scroll-progress";

// -----------------------------------------------------------------------------
// Types & Constants
// -----------------------------------------------------------------------------

interface ClientTabsNavProps {
  clientSlug: string;
  clientName: string;
  /** When provided (e.g. from ClientStickyProvider), sentinel is not rendered here */
  isStuck?: boolean;
}

const ITEMS: { segment: string | null; label: string }[] = [
  { segment: null, label: "الكل" },
  { segment: "about", label: "حول" },
  { segment: "photos", label: "الصور" },
  { segment: "followers", label: "المتابعون" },
  { segment: "reviews", label: "التقييمات" },
  { segment: "reels", label: "الريلز" },
  { segment: "likes", label: "الإعجابات" },
];

// -----------------------------------------------------------------------------
// Hook
// -----------------------------------------------------------------------------

function useStickySentinel() {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [isStuck, setIsStuck] = useState(false);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      ([entry]) => setIsStuck(!entry.isIntersecting),
      { threshold: 0, rootMargin: "-0.5px 0px 0px 0px" }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  return { sentinelRef, isStuck };
}

// -----------------------------------------------------------------------------
// Subcomponents
// -----------------------------------------------------------------------------

function StickyClientName({ name, className }: { name: string; className?: string }) {
  return (
    <div
      className={cn(
        "flex items-center gap-1.5 sm:gap-2 flex-shrink-0 min-w-0 max-w-[120px] sm:max-w-[220px]",
        className
      )}
      title={name}
    >
      <span className="text-sm sm:text-base font-bold text-foreground truncate">
        {name}
      </span>
      <CheckCircle2
        className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500 flex-shrink-0"
        aria-label="موثق"
      />
    </div>
  );
}

interface TabNavLinkProps {
  segment: string | null;
  label: string;
  href: string;
  isActive: boolean;
  activeRef?: React.RefObject<HTMLLIElement | null>;
}

function TabNavLink({ label, href, isActive, activeRef }: TabNavLinkProps) {
  return (
    <li ref={isActive ? activeRef : undefined}>
      <Link
        href={href}
        scroll={false}
        aria-current={isActive ? "page" : undefined}
        className={cn(
          "inline-flex items-center justify-center rounded-lg px-3 sm:px-4 py-2 sm:py-2.5 min-h-10 sm:min-h-11 min-w-[44px] text-sm font-medium whitespace-nowrap",
          "transition-colors duration-150",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          isActive
            ? "bg-accent text-primary shadow-sm font-bold"
            : "text-muted-foreground hover:text-foreground hover:bg-muted/80"
        )}
      >
        {label}
      </Link>
    </li>
  );
}

interface TabsNavListProps {
  items: { segment: string | null; label: string }[];
  basePath: string;
  activeSegment: string | null;
  activeLinkRef?: React.RefObject<HTMLLIElement | null>;
}

function TabsNavList({ items, basePath, activeSegment, activeLinkRef }: TabsNavListProps) {
  return (
    <ul
      className={cn(
        "flex flex-nowrap gap-0 sm:gap-1 overflow-x-auto overflow-y-hidden min-w-0",
        "py-1 sm:py-1.5 px-1 min-h-10 sm:min-h-11 items-center",
        "scrollbar-thin scrollbar-track-transparent scrollbar-thumb-muted",
        "scroll-smooth"
      )}
      style={{ WebkitOverflowScrolling: "touch" }}
    >
      {items.map(({ segment: itemSegment, label }) => {
        const href = itemSegment ? `${basePath}/${itemSegment}` : basePath;
        const isActive =
          activeSegment === itemSegment ||
          (activeSegment === null && itemSegment === null);

        return (
          <TabNavLink
            key={itemSegment ?? "all"}
            segment={itemSegment}
            label={label}
            href={href}
            isActive={isActive}
            activeRef={activeLinkRef}
          />
        );
      })}
    </ul>
  );
}

// -----------------------------------------------------------------------------
// Main
// -----------------------------------------------------------------------------

/**
 * Tabs nav for client section. Uses useSelectedLayoutSegment (per Next.js docs)
 * so the active tab updates on client-side navigation.
 * @see https://nextjs.org/docs/app/api-reference/functions/use-selected-layout-segment
 */
export function ClientTabsNav({ clientSlug, clientName, isStuck: isStuckProp }: ClientTabsNavProps) {
  const segment = useSelectedLayoutSegment();
  const basePath = `/clients/${encodeURIComponent(clientSlug)}`;
  const internalSticky = useStickySentinel();
  const isStuck = isStuckProp ?? internalSticky.isStuck;
  const activeLinkRef = useRef<HTMLLIElement | null>(null);

  useEffect(() => {
    const el = activeLinkRef.current;
    if (!el) return;
    const id = requestAnimationFrame(() => {
      el.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    });
    return () => cancelAnimationFrame(id);
  }, [segment]);

  return (
    <>
      {isStuckProp === undefined && (
        <div ref={internalSticky.sentinelRef} className="h-0 w-full" aria-hidden />
      )}
      <nav
        className={cn(
          "sticky top-14 z-40 -mx-4 px-3 sm:px-4 pt-1.5 sm:pt-2 -mt-1.5 sm:-mt-2 mb-8 transition-all duration-200",
          isStuck ? "bg-background/80 backdrop-blur-md shadow-sm" : "border-b border-border bg-background"
        )}
        aria-label="أقسام صفحة العميل"
      >
        {isStuck ? (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-3">
            <div className="relative -mx-1 -mb-px min-w-0 w-full sm:flex-1">
              <TabsNavList items={ITEMS} basePath={basePath} activeSegment={segment} activeLinkRef={activeLinkRef} />
            </div>
            <div className="hidden sm:flex justify-start py-0.5 sm:py-0 flex-shrink-0">
              <StickyClientName name={clientName} className="animate-in fade-in slide-in-from-top-2 duration-200" />
            </div>
          </div>
        ) : (
          <div className="relative -mx-1 -mb-px flex items-center gap-3">
            <TabsNavList items={ITEMS} basePath={basePath} activeSegment={segment} activeLinkRef={activeLinkRef} />
          </div>
        )}
        {isStuck && <ClientScrollProgress />}
      </nav>
    </>
  );
}

// -----------------------------------------------------------------------------
// Client layout: sticky provider + scroll progress when menu stacks
// -----------------------------------------------------------------------------

interface ClientStickyProviderProps {
  clientSlug: string;
  clientName: string;
  children: React.ReactNode;
}

/** Wraps client main content: shared sticky sentinel, tabs nav (with inline scroll progress when stuck). */
export function ClientStickyProvider({ clientSlug, clientName, children }: ClientStickyProviderProps) {
  const { sentinelRef, isStuck } = useStickySentinel();

  return (
    <>
      <div ref={sentinelRef} className="h-0 w-full" aria-hidden />
      <ClientTabsNav clientSlug={clientSlug} clientName={clientName} isStuck={isStuck} />
      {children}
    </>
  );
}
