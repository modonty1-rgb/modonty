"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
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
  RotateCcw,
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
  BarChart3,
  LineChart,
  MailPlus,
  MailOpen,
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
  Building2,
  Flame,
  Library,
  Newspaper,
  Images,
  GalleryThumbnails,
  Search,
  PanelTop,
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
  Share2,
} from "lucide-react";
import { GoogleSearchConsoleIcon } from "./icons/google-search-console-icon";
import { useSidebar } from "@/components/contexts/sidebar-context";
import { Button } from "@/components/ui/button";
import type { ArticleStatusCounts } from "@/app/(dashboard)/actions/article-status-counts";

// Maps a workflow href → the ArticleStatus whose count should appear as a badge.
// From AWAITING_APPROVAL the admin can only request revision; advancing to SCHEDULED
// is the client's console approval (no admin lane for it).
const HREF_TO_STATUS: Record<string, keyof ArticleStatusCounts> = {
  "/articles/workflow/writing-to-draft": "WRITING",
  "/articles/workflow/draft-to-approval": "DRAFT",
  "/articles/workflow/approval-to-revision": "AWAITING_APPROVAL",
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

// A nested submenu inside a group (2nd level) — e.g. Modonty → Pages / Page SEO,
// Articles → خط الإنتاج. Optional icon + auto-summed status badge on the trigger.
interface SubMenu {
  subMenu: string;
  icon?: IconComponent;
  items: MenuItem[];
}

type GroupChild = MenuItem | SubMenu;

const isSubMenu = (child: GroupChild): child is SubMenu => "subMenu" in child;

// Flatten a group's children (expanding submenus) into a flat MenuItem list —
// used for collapsed-sidebar rendering and active-route detection.
function flattenItems(children: GroupChild[]): MenuItem[] {
  return children.flatMap((c) => (isSubMenu(c) ? c.items : [c]));
}

interface MenuGroup {
  title: string;
  icon: IconComponent;
  items: GroupChild[];
  defaultOpen?: boolean;
}

const menuGroups: MenuGroup[] = [
  {
    title: "Accounts",
    icon: Wallet,
    defaultOpen: true,
    items: [
      { icon: Wallet, label: "Accounts", href: "/clients/accounts" },
      { icon: CreditCard, label: "Subscription Tiers", href: "/subscription-tiers" },
    ],
  },
  {
    title: "Clients",
    icon: Briefcase,
    defaultOpen: false,
    items: [
      { icon: Users2, label: "All Clients", href: "/clients", exact: true },
      { icon: UserPlus, label: "New Client", href: "/clients/new" },
      { icon: BadgeCheck, label: "Activate Client", href: "/clients/activate" },
      { icon: PauseCircle, label: "Suspend Client", href: "/clients/suspend" },
    ],
  },
  {
    title: "Articles",
    icon: Newspaper,
    defaultOpen: false,
    items: [
      { icon: FileText, label: "All Articles", href: "/articles", exact: true },
      { icon: FilePlus, label: "New Article", href: "/articles/new" },
      {
        subMenu: "Production Line",
        icon: Factory,
        items: [
          { icon: FileEdit, label: "Writing → Draft", href: "/articles/workflow/writing-to-draft" },
          { icon: FileClock, label: "Draft → Approval", href: "/articles/workflow/draft-to-approval" },
          { icon: FileX, label: "Approval → Revision", href: "/articles/workflow/approval-to-revision" },
          { icon: FileEdit, label: "Revision → Draft", href: "/articles/workflow/revision-to-draft" },
          { icon: CheckCircle2, label: "Scheduled → Published", href: "/articles/workflow/scheduled-to-published" },
        ],
      },
      {
        subMenu: "Maintenance & SEO",
        icon: Wrench,
        items: [
          { icon: RotateCcw, label: "Status Maintenance", href: "/articles/workflow/maintenance" },
          { icon: Wrench, label: "Technical Review", href: "/articles/technical" },
          { icon: Search, label: "SEO Client", href: "/clients/seo" },
          { icon: Images, label: "SEO Images", href: "/seo-images" },
        ],
      },
      {
        subMenu: "Content Setup",
        icon: Library,
        items: [
          { icon: Folder, label: "Categories", href: "/categories" },
          { icon: Tag, label: "Tags", href: "/tags" },
          { icon: UserPen, label: "Authors", href: "/authors" },
          { icon: Factory, label: "Industries", href: "/industries" },
          { icon: ClipboardList, label: "Intake Questions", href: "/intake" },
        ],
      },
    ],
  },
  {
    title: "Media",
    icon: Images,
    defaultOpen: false,
    items: [
      { icon: Images, label: "Media Library", href: "/media" },
      { icon: GalleryThumbnails, label: "Client Galleries", href: "/client-galleries" },
      { icon: Wrench, label: "Maintenance", href: "/media/maintenance" },
    ],
  },
  {
    title: "Analytics & Channels",
    icon: LineChart,
    defaultOpen: false,
    items: [
      { icon: GoogleSearchConsoleIcon, label: "Search Console", href: "/search-console" },
      { icon: Globe, label: "Bing Webmaster", href: "/bing-webmaster" },
      { icon: Share2, label: "Social Media", href: "/social/facebook" },
    ],
  },
  {
    title: "Modonty",
    icon: BookOpen,
    defaultOpen: false,
    items: [
      {
        subMenu: "Info & Legal",
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
        subMenu: "Master Pages",
        items: [
          { icon: Building2, label: "Homepage", href: "/settings/modonty" },
          { icon: Newspaper, label: "Articles", href: "/settings/articles" },
          { icon: Briefcase, label: "Clients", href: "/settings/clients" },
          { icon: Folder, label: "Categories", href: "/settings/categories" },
          { icon: Tag, label: "Tags", href: "/settings/tags" },
          { icon: Factory, label: "Industries", href: "/settings/industries" },
          { icon: Flame, label: "Trending", href: "/settings/trending" },
        ],
      },
      // Visible homepage content (not SEO) — future home for landing/hero options.
      { icon: PanelTop, label: "Homepage Banner", href: "/settings/banner" },
    ],
  },
  {
    title: "Audience",
    icon: Users2,
    defaultOpen: false,
    items: [
      { icon: Users, label: "Members", href: "/members" },
      { icon: MailPlus, label: "Subscribers", href: "/subscribers" },
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
  // Traffic analytics stays prominent — it's the daily thermometer, always one click away.
  { icon: BarChart3, label: "Traffic Analytics", href: "/analytics" },
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

// Nested 2nd-level submenu (e.g. Modonty → Pages / Page SEO). Independently
// collapsible; auto-opens when it contains the active route.
function SubMenuBlock({
  sub,
  open,
  onOpenChange,
  pathname,
  statusCounts,
}: {
  sub: SubMenu;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pathname: string;
  statusCounts?: ArticleStatusCounts | null;
}) {
  const Icon = sub.icon;

  // Total badge = sum of the nested workflow counts (e.g. خط الإنتاج folds 5 lanes).
  const total = statusCounts
    ? sub.items.reduce((acc, item) => {
        const key = HREF_TO_STATUS[item.href];
        return acc + (key ? statusCounts[key] : 0);
      }, 0)
    : 0;

  return (
    <Collapsible open={open} onOpenChange={onOpenChange}>
      <CollapsibleTrigger className="flex items-center justify-between w-full px-3 py-1.5 rounded-md text-[12px] font-semibold text-muted-foreground hover:bg-muted hover:text-foreground transition-colors group/sub">
        <div className="flex items-center gap-2 min-w-0">
          {Icon && <Icon className="h-3.5 w-3.5 shrink-0" />}
          <span className="truncate">{sub.subMenu}</span>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {total > 0 && (
            <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold tabular-nums leading-none bg-red-500 text-white">
              {total > 99 ? "99+" : total}
            </span>
          )}
          <ChevronDown className="h-3 w-3 shrink-0 transition-transform group-data-[state=open]/sub:rotate-180" />
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="ms-3 ps-3 border-s border-border/40 mt-0.5 space-y-0.5">
          {sub.items.map((item) => (
            <NavLink
              key={item.href}
              item={item}
              collapsed={false}
              pathname={pathname}
              statusCounts={statusCounts}
            />
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

// A group's expanded body. Submenus inside follow the same accordion rule as the
// top-level groups: only one submenu open at a time (initial = the one holding the
// active route).
function GroupItems({
  items,
  pathname,
  statusCounts,
}: {
  items: GroupChild[];
  pathname: string;
  statusCounts?: ArticleStatusCounts | null;
}) {
  const initialSub = items.find(
    (c): c is SubMenu => isSubMenu(c) && hasActiveChild(c.items, pathname),
  );
  const [openSub, setOpenSub] = useState<string | null>(initialSub?.subMenu ?? null);

  return (
    <div className="ms-3 ps-3 border-s border-border/40 mt-0.5 space-y-0.5">
      {items.map((child) =>
        isSubMenu(child) ? (
          <SubMenuBlock
            key={child.subMenu}
            sub={child}
            open={openSub === child.subMenu}
            onOpenChange={(o) => setOpenSub(o ? child.subMenu : null)}
            pathname={pathname}
            statusCounts={statusCounts}
          />
        ) : (
          <NavLink
            key={child.href}
            item={child}
            collapsed={false}
            pathname={pathname}
            statusCounts={statusCounts}
          />
        ),
      )}
    </div>
  );
}

export function Sidebar({ articleStatusCounts }: { articleStatusCounts?: ArticleStatusCounts | null }) {
  const pathname = usePathname();
  const { collapsed, toggle } = useSidebar();

  // T-SIDEBAR-ACCORDION: only one group open at a time. Initial value = the
  // group whose route is currently active (so it's auto-expanded on page load).
  const initialOpen =
    menuGroups.find((g) => hasActiveChild(flattenItems(g.items), pathname))?.title ||
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
      <div
        className={cn(
          "p-3 border-b flex gap-2",
          collapsed ? "flex-col items-center" : "items-center justify-between"
        )}
      >
        <Link href="/" title="Modonty — Dashboard" className="flex items-center gap-2 min-w-0">
          <div className="h-8 w-8 rounded-md overflow-hidden flex items-center justify-center bg-background border border-border shrink-0">
            <Image
              src="https://res.cloudinary.com/dfegnpgwx/image/upload/v1768807772/modontyIcon_svukux.svg"
              alt="Modonty"
              width={32}
              height={32}
              className="h-full w-full object-contain p-1"
            />
          </div>
          {!collapsed && (
            <span className="text-base font-semibold text-foreground whitespace-nowrap">
              Modonty
            </span>
          )}
        </Link>
        <Button
          variant="ghost"
          size="icon"
          onClick={toggle}
          className="h-8 w-8 rounded-md shrink-0 hover:bg-muted border border-border flex items-center justify-center transition-colors"
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
                {flattenItems(group.items).map((item) => (
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
                <GroupItems
                  items={group.items}
                  pathname={pathname}
                  statusCounts={articleStatusCounts}
                />
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
