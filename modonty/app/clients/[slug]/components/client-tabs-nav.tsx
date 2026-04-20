"use client";

import { useRef, useEffect, useState } from "react";
import Link from "@/components/link";
import { useSelectedLayoutSegment } from "next/navigation";
import { IconCheckCircle, IconGrid, IconInfo, IconPhone, IconImage, IconUsers, IconPlay, IconLike, IconFeatured } from "@/lib/icons";
import { cn } from "@/lib/utils";
import { trackCtaClick } from "@/lib/cta-tracking";
import { ClientScrollProgress } from "./client-scroll-progress";
import type { TabItem } from "./client-tab-items";
import { ALL_TAB_ITEMS } from "./client-tab-items";
import type { LucideIcon } from "lucide-react";

const TAB_ICON_MAP: Record<string, LucideIcon> = {
  "":          IconGrid,
  "about":     IconInfo,
  "contact":   IconPhone,
  "photos":    IconImage,
  "followers": IconUsers,
  "reviews":   IconFeatured,
  "reels":     IconPlay,
  "likes":     IconLike,
};

// -----------------------------------------------------------------------------
// Types & Constants
// -----------------------------------------------------------------------------

interface ClientTabsNavProps {
  clientSlug: string;
  clientName: string;
  clientId?: string;
  /** When provided (e.g. from ClientStickyProvider), sentinel is not rendered here */
  isStuck?: boolean;
  /** Pre-filtered list of tabs to render (filtering happens in Server Component) */
  items?: TabItem[];
}


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
      <IconCheckCircle
        className="h-5 w-5 sm:h-6 sm:w-6 text-accent flex-shrink-0"
        aria-label="موثق"
      />
    </div>
  );
}

interface TabNavLinkProps {
  segment: string | null;
  label: string;
  shortLabel?: string;
  href: string;
  isActive: boolean;
  activeRef?: React.RefObject<HTMLLIElement | null>;
  clientId?: string;
}

function TabNavLink({ segment, label, shortLabel, href, isActive, activeRef, clientId }: TabNavLinkProps) {
  const Icon = TAB_ICON_MAP[segment ?? ""];

  const handleClick = () => {
    if (clientId) {
      trackCtaClick({ type: "LINK", label: `Tab – ${label}`, targetUrl: href, clientId });
    }
  };

  return (
    <li ref={isActive ? activeRef : undefined}>
      <Link
        href={href}
        scroll={false}
        aria-current={isActive ? "page" : undefined}
        className={cn(
          "inline-flex items-center justify-center rounded-lg px-2.5 sm:px-4 py-2 sm:py-2.5 min-h-10 sm:min-h-11 min-w-[44px] text-sm font-medium whitespace-nowrap",
          "transition-colors duration-150",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          isActive
            ? "bg-accent text-primary shadow-sm font-bold"
            : "text-muted-foreground hover:text-foreground hover:bg-muted/80"
        )}
        onClick={handleClick}
      >
        {/* Mobile: icon + shortLabel */}
        <span className="sm:hidden inline-flex flex-col items-center gap-0.5">
          {Icon && <Icon className="h-4 w-4" aria-hidden />}
          <span className="text-[10px] leading-none">{shortLabel ?? label}</span>
        </span>
        {/* Desktop: text only */}
        <span className="hidden sm:inline">{label}</span>
      </Link>
    </li>
  );
}

interface TabsNavListProps {
  items: { segment: string | null; label: string; shortLabel?: string }[];
  basePath: string;
  activeSegment: string | null;
  activeLinkRef?: React.RefObject<HTMLLIElement | null>;
  clientId?: string;
}

function TabsNavList({ items, basePath, activeSegment, activeLinkRef, clientId }: TabsNavListProps) {
  return (
    <div className="relative min-w-0">
      {/* fade on leading (right in RTL) edge */}
      <div className="pointer-events-none absolute inset-y-0 end-0 w-6 bg-gradient-to-s from-background to-transparent z-10 sm:hidden" aria-hidden />
      {/* fade on trailing (left in RTL) edge */}
      <div className="pointer-events-none absolute inset-y-0 start-0 w-6 bg-gradient-to-e from-background to-transparent z-10 sm:hidden" aria-hidden />
      <ul
        className={cn(
          "flex flex-nowrap gap-0 sm:gap-1 overflow-x-auto overflow-y-hidden min-w-0",
          "py-1 sm:py-1.5 px-1 min-h-10 sm:min-h-11 items-center",
          "scrollbar-none scroll-smooth"
        )}
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        {items.map(({ segment: itemSegment, label, shortLabel }) => {
          const href = itemSegment ? `${basePath}/${itemSegment}` : basePath;
          const isActive =
            activeSegment === itemSegment ||
            (activeSegment === null && itemSegment === null);

          return (
            <TabNavLink
              key={itemSegment ?? "all"}
              segment={itemSegment}
              label={label}
              shortLabel={shortLabel}
              href={href}
              isActive={isActive}
              activeRef={activeLinkRef}
              clientId={clientId}
            />
          );
        })}
      </ul>
    </div>
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
export function ClientTabsNav({ clientSlug, clientName, clientId, isStuck: isStuckProp, items: itemsProp }: ClientTabsNavProps) {
  const segment = useSelectedLayoutSegment();
  const basePath = `/clients/${encodeURIComponent(clientSlug)}`;
  const visibleItems = itemsProp ?? ALL_TAB_ITEMS;
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
              <TabsNavList items={visibleItems} basePath={basePath} activeSegment={segment} activeLinkRef={activeLinkRef} clientId={clientId} />
            </div>
            <div className="hidden sm:flex justify-start py-0.5 sm:py-0 flex-shrink-0">
              <StickyClientName name={clientName} className="animate-in fade-in slide-in-from-top-2 duration-200" />
            </div>
          </div>
        ) : (
          <div className="relative -mx-1 -mb-px flex items-center gap-3">
            <TabsNavList items={visibleItems} basePath={basePath} activeSegment={segment} activeLinkRef={activeLinkRef} clientId={clientId} />
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
  clientId?: string;
  items?: TabItem[];
  children: React.ReactNode;
}

/** Wraps client main content: shared sticky sentinel, tabs nav (with inline scroll progress when stuck). */
export function ClientStickyProvider({ clientSlug, clientName, clientId, items, children }: ClientStickyProviderProps) {
  const { sentinelRef, isStuck } = useStickySentinel();

  return (
    <>
      <div ref={sentinelRef} className="h-0 w-full" aria-hidden />
      <ClientTabsNav clientSlug={clientSlug} clientName={clientName} clientId={clientId} isStuck={isStuck} items={items} />
      {children}
    </>
  );
}
