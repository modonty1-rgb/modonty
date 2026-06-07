"use client";

import Link from "@/components/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import { IconTrending, IconClients, IconSearch } from "@/lib/icons";

// Mobile-only primary nav (icon-only) inside the top bar.
// الرئيسية is intentionally omitted — the logo already links home (standard UX).
const items = [
  { href: "/trending", label: "الرائجة", icon: IconTrending },
  { href: "/clients", label: "الشركاء", icon: IconClients },
  { href: "/search", label: "بحث", icon: IconSearch },
];

export function TopNavMobileLinks() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-1 items-center justify-center gap-1" aria-label="التنقل الرئيسي">
      {items.map(({ href, label, icon: Icon }) => {
        const isActive = pathname === href || pathname.startsWith(href + "/");
        return (
          <Link
            key={href}
            href={href}
            aria-label={label}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "flex h-11 w-11 items-center justify-center rounded-lg transition-colors",
              isActive
                ? "text-primary bg-primary/10"
                : "text-muted-foreground hover:text-primary hover:bg-primary/5"
            )}
          >
            <Icon className="h-6 w-6" />
          </Link>
        );
      })}
    </nav>
  );
}
