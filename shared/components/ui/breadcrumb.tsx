import * as React from "react";
import Link from "next/link";
import { IconChevronLeft, IconMoreHorizontal } from "../../lib/icons";
import { ModontyHomeMark } from "../icons/modonty-home-mark";
import { cn } from "../../lib/utils/index";

export interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ReactNode;
}

export interface BreadcrumbProps {
  items?: BreadcrumbItem[];
  className?: string;
  maxItems?: number;
}

const BreadcrumbSeparator = () => (
  <IconChevronLeft className="h-4 w-4 text-muted-foreground/50 flex-shrink-0" aria-hidden="true" />
);

export function Breadcrumb({ items = [], className, maxItems = 3 }: BreadcrumbProps) {
  if (!items || items.length === 0) {
    return null;
  }

  const shouldCollapse = items.length > maxItems;
  
  const displayItems = React.useMemo(() => {
    if (!shouldCollapse || items.length <= 3) {
      return items;
    }

    return [
      items[0],
      { label: "...", href: undefined, icon: <IconMoreHorizontal className="h-4 w-4" /> },
      items[items.length - 1],
    ];
  }, [items, shouldCollapse]);

  return (
    <nav
      aria-label="تنقل الصفحة"
      className={cn("container mx-auto max-w-[1128px] px-4", className)}
    >
      {/* On phones the row is the text and nothing else: `py-3` made it a 44px band for a
          20px line, and the chrome above it already costs 135px (Khalid, 22 Aug — measured).
          Shrunk, not hidden: Google indexes the mobile version («Only the content shown on
          the mobile site is used for indexing») and its structured-data policy forbids
          marking up what the reader cannot see, so `BreadcrumbList` must keep a visible
          twin. `sm:py-3` leaves every larger screen exactly as it was. */}
      <ol className="flex items-center gap-2 py-0 sm:py-3 text-sm overflow-hidden">
        {displayItems.map((item, index) => {
          const isLast = index === displayItems.length - 1;
          const isEllipsis = item.label === "...";

          return (
            <li
              key={`${item.label}-${index}`}
              className="flex min-w-0 items-center gap-2"
            >
              {!isLast && index > 0 && <BreadcrumbSeparator />}

              {isEllipsis ? (
                <span className="flex items-center gap-1 text-muted-foreground px-1">
                  {item.icon}
                </span>
              ) : isLast ? (
                <span
                  className="flex min-w-0 max-w-[250px] sm:max-w-[min(100%,420px)] md:max-w-[480px] items-center gap-1.5 font-semibold text-foreground"
                  aria-current="page"
                >
                  {item.icon}
                  <span className="min-w-0 flex-1 truncate">{item.label}</span>
                </span>
              ) : (
                <Link
                  href={item.href!}
                  className="flex min-w-0 max-w-[min(100%,280px)] items-center gap-1.5 text-muted-foreground transition-colors hover:text-foreground md:max-w-none"
                >
                  {item.icon}
                  <span className="min-w-0 flex-1 truncate hover:underline md:max-w-none">
                    {item.label}
                  </span>
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export function BreadcrumbHome() {
  // Our own house, not lucide's (Khalid, 22 Aug: «zero branding icon»). Body muted so the
  // trail stays a trail; the diamond inside takes the accent on its own.
  return <ModontyHomeMark className="h-4 w-4" aria-label="الرئيسية" />;
}
