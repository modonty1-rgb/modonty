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
  Globe,
  Wallet,
  PauseCircle,
  ClipboardList,
} from "lucide-react";
import { GoogleSearchConsoleIcon } from "./icons/google-search-console-icon";
import { useSidebar } from "@/components/contexts/sidebar-context";
import { Button } from "@/components/ui/button";
import type { ArticleStatusCounts } from "@/app/(dashboard)/actions/article-status-counts";

// Maps a workflow href → the ArticleStatus whose count should appear as a badge.
// Two transitions share AWAITING_APPROVAL (approval can go either to revision or to scheduled).
const HREF_TO_STATUS: Record<string, keyof ArticleStatusCounts> = {
  "/articles/workflow/writing-to-draft": "WRITING",
  "/articles/workflow/draft-to-approval": "DRAFT",
  "/articles/workflow/approval-to-revision": "AWAITING_APPROVAL",
  "/articles/workflow/approval-to-scheduled": "AWAITING_APPROVAL",
  "/articles/workflow/revision-to-draft": "NEEDS_REVISION",
  "/articles/workflow/scheduled-to-published": "SCHEDULED",
};

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
      { icon: BadgeCheck, label: "Activate Client", href: "/clients/activate" },
      { icon: PauseCircle, label: "Suspend Client", href: "/clients/suspend" },
      { icon: Wallet, label: "Accounts", href: "/accounts" },
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
      { icon: FileEdit, label: "Revision → Draft", href: "/articles/workflow/revision-to-draft" },
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
      { icon: ClipboardList, label: "Intake Questions", href: "/intake" },
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
    ],
  },
  {
    title: "System",
    icon: Wrench,
    defaultOpen: false,
    items: [
      { icon: Users, label: "Admins", href: "/users" },
      { icon: Download, label: "Export Data", href: "/export-data" },
      { icon: Database, label: "Database", href: "/database" },
      { icon: Wrench, label: "Maintenance", href: "/maintenance" },
      { icon: MailOpen, label: "Email Templates", href: "/emails" },
      { icon: Bug, label: "Error Logs", href: "/system-errors" },
    ],
  },
];

const topItems: MenuItem[] = [
  { icon: GoogleSearchConsoleIcon, label: "Search Console", href: "/search-console" },
  { icon: Globe, label: "Bing Webmaster", href: "/bing-webmaster" },
  { icon: LineChart, label: "SEO", href: "/seo" },
  { icon: CreditCard, label: "Subscription Tiers", href: "/subscription-tiers" },
];

function NavLink({
  item,
  collapsed,
  pathname,
  statusCounts,
}: {
  item: MenuItem;
  collapsed: boolean;
  pathname: string;
  statusCounts?: ArticleStatusCounts | null;
}) {
  const Icon = item.icon;
  const isActive =
    item.href === "/" || item.exact
      ? pathname === item.href
      : pathname === item.href || pathname?.startsWith(item.href + "/");

  const statusKey = HREF_TO_STATUS[item.href];
  const badgeCount =
    statusKey && statusCounts ? statusCounts[statusKey] : null;
  const showBadge = badgeCount !== null && badgeCount !== undefined && badgeCount > 0;

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
      title={collapsed ? `${item.label}${showBadge ? ` (${badgeCount})` : ""}` : undefined}
    >
      <span className="relative shrink-0 inline-flex">
        <Icon className="h-4 w-4" />
        {showBadge && (
          <span
            className={cn(
              "absolute -top-2 -end-2 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold tabular-nums leading-none ring-2 shadow-sm",
              isActive
                ? "bg-white text-red-600 ring-primary"
                : "bg-red-500 text-white ring-card dark:ring-card"
            )}
            aria-label={`${badgeCount} ${item.label}`}
          >
            {badgeCount > 99 ? "99+" : badgeCount}
          </span>
        )}
      </span>
      {!collapsed && <span className="whitespace-nowrap">{item.label}</span>}
    </Link>
  );
}

function hasActiveChild(items: MenuItem[], pathname: string): boolean {
  return items.some(
    (item) => pathname === item.href || pathname?.startsWith(item.href + "/")
  );
}

export function Sidebar({ articleStatusCounts }: { articleStatusCounts?: ArticleStatusCounts | null }) {
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
            <NavLink
              key={item.href}
              item={item}
              collapsed={collapsed}
              pathname={pathname}
              statusCounts={articleStatusCounts}
            />
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
                  <NavLink
                    key={item.href}
                    item={item}
                    collapsed
                    pathname={pathname}
                    statusCounts={articleStatusCounts}
                  />
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
                    <NavLink
                      key={item.href}
                      item={item}
                      collapsed={false}
                      pathname={pathname}
                      statusCounts={articleStatusCounts}
                    />
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
          collapsed ? "justify-center" : "justify-start"
        )}>
          {collapsed ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  href="/settings"
                  className={cn(
                    "flex items-center justify-center h-8 w-8 rounded-md transition-colors",
                    pathname?.startsWith("/settings")
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <Settings className="h-4 w-4" />
                </Link>
              </TooltipTrigger>
              <TooltipContent side="left"><p>Settings</p></TooltipContent>
            </Tooltip>
          ) : (
            <Link
              href="/settings"
              className={cn(
                "flex items-center gap-1.5 text-[12px] font-medium rounded-md px-2 py-1 transition-colors",
                pathname?.startsWith("/settings")
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Settings className="h-3.5 w-3.5" />
              Settings
            </Link>
          )}
        </div>
      </TooltipProvider>
    </aside>
  );
}
