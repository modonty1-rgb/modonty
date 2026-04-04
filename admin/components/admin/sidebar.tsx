"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import {
  LayoutDashboard,
  FileText,
  Folder,
  Tag,
  Pen,
  Factory,
  Info,
  CircleHelp,
  Scale,
  Handshake,
  ShieldCheck,
  Cookie,
  Copyright,
  Search,
  Mail,
  BarChart3,
  Users,
  CreditCard,
  Download,
  Database,
  Settings,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  BookOpen,
} from "lucide-react";
import { useSidebar } from "@/components/contexts/sidebar-context";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./theme-toggle";
import pkg from "@/package.json";

interface MenuItem {
  icon: typeof Folder;
  label: string;
  href: string;
}

interface MenuGroup {
  title: string;
  icon: typeof Folder;
  items: MenuItem[];
  defaultOpen?: boolean;
}

const menuGroups: MenuGroup[] = [
  {
    title: "Content",
    icon: FileText,
    defaultOpen: true,
    items: [
      { icon: FileText, label: "Articles", href: "/articles" },
      { icon: Folder, label: "Categories", href: "/categories" },
      { icon: Tag, label: "Tags", href: "/tags" },
      { icon: Pen, label: "Authors", href: "/authors" },
      { icon: Factory, label: "Industries", href: "/industries" },
    ],
  },
  {
    title: "Modonty Pages",
    icon: Info,
    defaultOpen: false,
    items: [
      { icon: Info, label: "About", href: "/modonty/pages/about" },
      { icon: CircleHelp, label: "FAQ", href: "/modonty/faq" },
      { icon: Scale, label: "Terms", href: "/modonty/pages/terms" },
      { icon: Handshake, label: "User Agreement", href: "/modonty/pages/user-agreement" },
      { icon: ShieldCheck, label: "Privacy Policy", href: "/modonty/pages/privacy-policy" },
      { icon: Cookie, label: "Cookie Policy", href: "/modonty/pages/cookie-policy" },
      { icon: Copyright, label: "Copyright", href: "/modonty/pages/copyright-policy" },
    ],
  },
  {
    title: "Audience",
    icon: Mail,
    defaultOpen: false,
    items: [
      { icon: Mail, label: "Subscribers", href: "/subscribers" },
      { icon: BarChart3, label: "Analytics", href: "/analytics" },
    ],
  },
  {
    title: "System",
    icon: Settings,
    defaultOpen: false,
    items: [
      { icon: Users, label: "Admins", href: "/users" },
      { icon: CreditCard, label: "Plans & Pricing", href: "/subscription-tiers" },
      { icon: Download, label: "Export Data", href: "/export-data" },
      { icon: Database, label: "Database", href: "/database" },
      { icon: Settings, label: "Settings", href: "/settings" },
    ],
  },
];

const topItems: MenuItem[] = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/" },
  { icon: Search, label: "SEO Overview", href: "/seo-overview" },
];

function NavLink({ item, collapsed, pathname }: { item: MenuItem; collapsed: boolean; pathname: string }) {
  const Icon = item.icon;
  const isActive =
    item.href === "/"
      ? pathname === "/"
      : pathname === item.href || pathname?.startsWith(item.href + "/");

  return (
    <Link
      href={item.href}
      className={cn(
        "flex items-center rounded-md text-[13px] font-medium transition-colors",
        collapsed ? "justify-center px-2 py-2" : "gap-2.5 px-3 py-1.5",
        isActive
          ? "bg-primary text-primary-foreground"
          : "text-muted-foreground hover:bg-muted hover:text-foreground"
      )}
      title={collapsed ? item.label : undefined}
    >
      <Icon className="h-4 w-4 shrink-0" />
      {!collapsed && <span className="whitespace-nowrap">{item.label}</span>}
    </Link>
  );
}

function hasActiveChild(items: MenuItem[], pathname: string): boolean {
  return items.some(
    (item) => pathname === item.href || pathname?.startsWith(item.href + "/")
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const { collapsed, toggle } = useSidebar();

  return (
    <aside
      className={cn(
        "border-e bg-card h-screen sticky top-0 transition-all duration-300 flex flex-col",
        collapsed ? "w-16" : "w-60"
      )}
    >
      <div className="p-3 border-b">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggle}
          className={cn(
            "h-8 w-8 rounded-md shrink-0 hover:bg-muted border border-border",
            "flex items-center justify-center transition-colors",
            collapsed ? "mx-auto" : "ms-auto"
          )}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      <nav className="p-3 flex-1 overflow-y-auto space-y-1">
        {/* Top-level links (always visible) */}
        <div className="space-y-0.5 mb-3">
          {topItems.map((item) => (
            <NavLink key={item.href} item={item} collapsed={collapsed} pathname={pathname} />
          ))}
        </div>

        <div className="mx-2 border-t border-border/50 mb-3" />

        {/* Collapsible groups */}
        {menuGroups.map((group) => {
          const GroupIcon = group.icon;
          const isGroupActive = hasActiveChild(group.items, pathname);
          const openByDefault = group.defaultOpen || isGroupActive;

          if (collapsed) {
            return (
              <div key={group.title} className="space-y-0.5">
                <div className="mx-2 mb-1 border-t border-border/30" />
                {group.items.map((item) => (
                  <NavLink key={item.href} item={item} collapsed pathname={pathname} />
                ))}
              </div>
            );
          }

          return (
            <Collapsible key={group.title} defaultOpen={openByDefault}>
              <CollapsibleTrigger className="flex items-center justify-between w-full px-3 py-1.5 rounded-md text-[13px] font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors group">
                <div className="flex items-center gap-2.5">
                  <GroupIcon className="h-4 w-4 shrink-0" />
                  <span>{group.title}</span>
                </div>
                <ChevronDown className="h-3.5 w-3.5 shrink-0 transition-transform group-data-[state=open]:rotate-180" />
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="ms-3 ps-3 border-s border-border/40 mt-0.5 space-y-0.5">
                  {group.items.map((item) => (
                    <NavLink key={item.href} item={item} collapsed={false} pathname={pathname} />
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>
          );
        })}
      </nav>

      <TooltipProvider>
        <div className={cn(
          "mt-auto border-t px-3 py-2 flex items-center",
          collapsed ? "justify-center gap-1" : "justify-between"
        )}>
          {collapsed ? (
            <>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link
                    href="/guidelines"
                    className={cn(
                      "flex items-center justify-center h-8 w-8 rounded-md transition-colors",
                      pathname?.startsWith("/guidelines")
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <BookOpen className="h-4 w-4" />
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="left"><p>Guidelines</p></TooltipContent>
              </Tooltip>
              <ThemeToggle />
            </>
          ) : (
            <>
              <Link
                href="/guidelines"
                className={cn(
                  "flex items-center gap-1.5 text-[12px] font-medium rounded-md px-2 py-1 transition-colors",
                  pathname?.startsWith("/guidelines")
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <BookOpen className="h-3.5 w-3.5" />
                Guidelines
              </Link>
              <div className="flex items-center gap-2">
                <ThemeToggle />
                <span className="text-[10px] text-muted-foreground/40">v{pkg.version}</span>
              </div>
            </>
          )}
        </div>
      </TooltipProvider>
    </aside>
  );
}
