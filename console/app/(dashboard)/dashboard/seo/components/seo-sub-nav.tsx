"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ar } from "@/lib/ar";
import { cn } from "@/lib/utils";

const ITEMS = [
  { href: "/dashboard/seo/intake", label: ar.seo.intake },
  { href: "/dashboard/seo/competitors", label: ar.seo.competitors },
  { href: "/dashboard/seo/keywords", label: ar.seo.keywords },
] as const;

export function SeoSubNav() {
  const pathname = usePathname();
  return (
    <nav dir="rtl" className="flex flex-wrap gap-2 border-b border-border pb-2">
      {ITEMS.map(({ href, label }) => {
        const isActive = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
              isActive
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-muted hover:opacity-80"
            )}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
