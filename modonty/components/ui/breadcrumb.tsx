import * as React from "react";
import Link from "@/components/link";
import { IconChevronLeft, IconHome, IconMoreHorizontal } from "@/lib/icons";
import { cn } from "@/lib/utils";

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
      <ol
        className="flex items-center gap-2 py-3 text-sm overflow-hidden"
        itemScope
        itemType="https://schema.org/BreadcrumbList"
      >
        {displayItems.map((item, index) => {
          const isLast = index === displayItems.length - 1;
          const isEllipsis = item.label === "...";
          const position = isEllipsis ? undefined : items.findIndex(i => i.label === item.label) + 1;

          return (
            <li
              key={`${item.label}-${index}`}
              className="flex min-w-0 items-center gap-2"
              itemProp={isEllipsis ? undefined : "itemListElement"}
              itemScope={isEllipsis ? undefined : true}
              itemType={isEllipsis ? undefined : "https://schema.org/ListItem"}
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
                  itemProp="name"
                >
                  {item.icon}
                  <span className="min-w-0 flex-1 truncate">{item.label}</span>
                </span>
              ) : (
                <>
                  <Link
                    href={item.href!}
                    className="flex min-w-0 max-w-[min(100%,280px)] items-center gap-1.5 text-muted-foreground transition-colors hover:text-foreground md:max-w-none"
                    itemProp="item"
                  >
                    {item.icon}
                    <span
                      itemProp="name"
                      className="min-w-0 flex-1 truncate hover:underline md:max-w-none"
                    >
                      {item.label}
                    </span>
                  </Link>
                  {!isEllipsis && <meta itemProp="position" content={String(position)} />}
                </>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export function BreadcrumbHome() {
  return <IconHome className="h-4 w-4" aria-label="الرئيسية" />;
}
