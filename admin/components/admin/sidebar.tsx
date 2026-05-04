"use client";

import { useState } from "react";
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
  FileText,
  FilePlus,
  FileEdit,
  FileClock,
  FileX,
  CalendarClock,
  CheckCircle2,
  Folder,
  Tag,
  UserPen,
  Factory,
  Info,
  CircleHelp,
  Scale,
  Handshake,
  ShieldCheck,
  Cookie,
  Copyright,
  LineChart,
  MailPlus,
  MailOpen,
  BarChart3,
  Users,
  Users2,
  CreditCard,
  Download,
  Database,
  Settings,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  BookOpen,
  Library,
  Newspaper,
  MessageSquare,
  Bug,
  Wrench,
  Megaphone,
  Briefcase,
  UserPlus,
  BadgeCheck,
  Send,
} from "lucide-react";
import { GoogleSearchConsoleIcon } from "./icons/google-search-console-icon";
import { useSidebar } from "@/components/contexts/sidebar-context";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./theme-toggle";
import pkg from "@/package.json";

type IconComponent = React.ComponentType<{ className?: string }>;

interface MenuItem {
  icon: IconComponent;
  label: string;
  href: string;
  exact?: boolean;
}

interface MenuGroup {
  title: string;
  icon: IconComponent;
  items: MenuItem[];
  defaultOpen?: boolean;
}

const menuGroups: MenuGroup[] = [
  {
    title: "Clients",
    icon: Briefcase,
    defaultOpen: true,
    items: [
      { icon: Users2, label: "All Clients", href: "/clients", exact: true },
      { icon: UserPlus, label: "New Client", href: "/clients/new" },
      { icon: BadgeCheck, label: "Verify Client", href: "/clients/verify" },
      { icon: Send, label: "Publish Client", href: "/clients/publish" },
    ],
  },
  {
    title: "Articles",
    icon: Newspaper,
    defaultOpen: false,
    items: [
      { icon: FileText, label: "All Articles", href: "/articles", exact: true },
      { icon: FilePlus, label: "New Article", href: "/articles/new" },
      { icon: FileEdit, label: "Writing → Draft", href: "/articles/workflow/writing-to-draft" },
      { icon: FileClock, label: "Draft → Approval", href: "/articles/workflow/draft-to-approval" },
      { icon: FileX, label: "Approval → Revision", href: "/articles/workflow/approval-to-revision" },
      { icon: CalendarClock, label: "Approval → Scheduled", href: "/articles/workflow/approval-to-scheduled" },
      { icon: CheckCircle2, label: "Scheduled → Published", href: "/articles/workflow/scheduled-to-published" },
      { icon: Wrench, label: "Technical Review", href: "/articles/technical" },
    ],
  },
  {
    title: "Content",
    icon: Library,
    defaultOpen: false,
    items: [
      { icon: Folder, label: "Categories", href: "/categories" },
      { icon: Tag, label: "Tags", href: "/tags" },
      { icon: UserPen, label: "Authors", href: "/authors" },
      { icon: Factory, label: "Industries", href: "/industries" },
    ],
  },
  {
    title: "Modonty Pages",
    icon: BookOpen,
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
    icon: Users2,
    defaultOpen: false,
    items: [
      { icon: MailPlus, label: "Subscribers", href: "/subscribers" },
      { icon: BarChart3, label: "Analytics", href: "/analytics" },
      { icon: MessageSquare, label: "Chatbot Questions", href: "/chatbot-questions" },
      { icon: Megaphone, label: "Campaign Leads", href: "/campaigns/leads" },
      { icon: Users2, label: "jbrseo Subscribers", href: "/jbrseo-subscribers" },
    ],
  },
  {
    title: "System",
    icon: Wrench,
    defaultOpen: false,
    items: [
      { icon: Users, label: "Admins", href: "/users" },
      { icon: CreditCard, label: "Plans & Pricing", href: "/subscription-tiers" },
      { icon: Download, label: "Export Data", href: "/export-data" },
      { icon: Database, label: "Database", href: "/database" },
      { icon: MailOpen, label: "Email Templates", href: "/emails" },
      { icon: Bug, label: "Error Logs", href: "/system-errors" },
      { icon: Settings, label: "Settings", href: "/settings" },
    ],
  },
];

const topItems: MenuItem[] = [
  { icon: GoogleSearchConsoleIcon, label: "Search Console", href: "/search-console" },
  { icon: LineChart, label: "SEO Overview", href: "/seo-overview" },
];

function NavLink({ item, collapsed, pathname }: { item: MenuItem; collapsed: boolean; pathname: string }) {
  const Icon = item.icon;
  const isActive =
    item.href === "/" || item.exact
      ? pathname === item.href
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

  // T-SIDEBAR-ACCORDION: only one group open at a time. Initial value = the
  // group whose route is currently active (so it's auto-expanded on page load).
  const initialOpen =
    menuGroups.find((g) => hasActiveChild(g.items, pathname))?.title ||
    menuGroups.find((g) => g.defaultOpen)?.title ||
    null;
  const [openGroupTitle, setOpenGroupTitle] = useState<string | null>(initialOpen);

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

        {/* Collapsible groups — accordion behavior: only one open at a time */}
        {menuGroups.map((group) => {
          const GroupIcon = group.icon;

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

          const isOpen = openGroupTitle === group.title;
          return (
            <Collapsible
              key={group.title}
              open={isOpen}
              onOpenChange={(open) => setOpenGroupTitle(open ? group.title : null)}
            >
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
                <Link
                  href="/changelog"
                  className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground hover:text-foreground transition-colors"
                  title="سجل التحديثات والملاحظات"
                >
                  v{pkg.version}
                  <span className="text-[9px] bg-primary/10 text-primary rounded px-1">?</span>
                </Link>
              </div>
            </>
          )}
        </div>
      </TooltipProvider>
    </aside>
  );
}
