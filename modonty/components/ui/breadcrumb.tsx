import * as React from "react";
import Link from "@/components/link";
import { ChevronLeft, Home, MoreHorizontal } from "lucide-react";
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
  <ChevronLeft className="h-4 w-4 text-muted-foreground/50 flex-shrink-0" aria-hidden="true" />
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
      { label: "...", href: undefined, icon: <MoreHorizontal className="h-4 w-4" /> },
      items[items.length - 1],
    ];
  }, [items, shouldCollapse]);

  return (
    <nav
      aria-label="تنقل الصفحة"
      className={cn("container mx-auto max-w-[1128px] px-4", className)}
    >
      <ol
        className="flex items-center gap-2 py-3 text-sm flex-wrap"
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
              className="flex items-center gap-2"
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
                  className="flex items-center gap-1.5 font-semibold text-foreground"
                  aria-current="page"
                  itemProp="name"
                >
                  {item.icon}
                  <span className="truncate max-w-[200px] sm:max-w-[300px]">{item.label}</span>
                </span>
              ) : (
                <>
                  <Link
                    href={item.href!}
                    className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
                    itemProp="item"
                  >
                    {item.icon}
                    <span itemProp="name" className="hover:underline">
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
  return <Home className="h-4 w-4" aria-label="الرئيسية" />;
}
