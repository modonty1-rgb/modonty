"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Folder,
  Tag,
  Briefcase,
  User,
  Users,
  Mail,
  BarChart3,
  Settings,
  Download,
  ChevronLeft,
  ChevronRight,
  CreditCard,
} from "lucide-react";
import { useSidebar } from "@/components/contexts/sidebar-context";
import { Button } from "@/components/ui/button";

const menuItems = [
  { icon: Folder, label: "Categories", href: "/categories" },
  { icon: Briefcase, label: "Industries", href: "/industries" },
  { icon: Tag, label: "Tags", href: "/tags" },
  { icon: User, label: "Authors", href: "/authors" },
  { icon: Download, label: "Export Data", href: "/export-data" },
  { icon: Users, label: "Users", href: "/users" },
  { icon: Mail, label: "Subscribers", href: "/subscribers" },
  { icon: BarChart3, label: "Analytics", href: "/analytics" },
  { icon: CreditCard, label: "Subscription Tiers", href: "/subscription-tiers" },
  { icon: Settings, label: "Settings", href: "/settings" },
];

export function Sidebar() {
  const pathname = usePathname();
  const { collapsed, toggle } = useSidebar();

  return (
    <aside
      className={cn(
        "border-r bg-card h-screen sticky top-0 transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className="p-4 border-b">
        <div className="flex items-center justify-between gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggle}
            className={cn(
              "h-8 w-8 rounded-md shrink-0 hover:bg-muted border border-border",
              "flex items-center justify-center transition-colors",
              collapsed ? "mx-auto" : "ml-auto"
            )}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
      <nav className="p-4 space-y-1">
        {!collapsed && (
          <div className="px-3 py-2 mb-2">
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              More
            </h2>
          </div>
        )}
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href || pathname?.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center rounded-md text-sm font-medium transition-colors",
                collapsed ? "justify-center px-2 py-2" : "gap-3 px-3 py-2",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
              title={collapsed ? item.label : undefined}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {!collapsed && (
                <span className="whitespace-nowrap">{item.label}</span>
              )}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
