"use client";

import Link from "@/components/link";
import { usePathname } from "next/navigation";
import { Home, Tags, Building2, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { icon: Home, label: "الرئيسية", href: "/" },
  { icon: TrendingUp, label: "الرائجة", href: "/trending" },
  { icon: Tags, label: "الفئات", href: "/categories" },
  { icon: Building2, label: "العملاء", href: "/clients" },
];

export function MobileFooter() {
  const pathname = usePathname();

  return (
    <footer className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t bg-white shadow-lg">
      <nav className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname?.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 px-4 py-2 min-h-11 min-w-11 rounded-md transition-colors",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-primary"
              )}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </footer>
  );
}
