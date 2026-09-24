"use client";

import { useState } from "react";
import Link from "next/link";
import { OptimizedImage, asMedia } from "@modonty/shared/components/optimized-image";
import { usePathname } from "next/navigation";

import { BRAND_ICON_URL } from "@modonty/shared/lib/brand-assets";
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
  Archive,
  BookUser,
  BadgeCheck,
  BarChart3,
  BookOpen,
  Bot,
  Briefcase,
  Bug,
  Building2,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  Clapperboard,
  ClipboardList,
  Cloud,
  CloudUpload,
  ArrowRightLeft,
  Cookie,
  Copyright,
  CreditCard,
  Database,
  Download,
  Factory,
  FileClock,
  FileEdit,
  FilePlus,
  FileText,
  FileX,
  Flame,
  Folder,
  GalleryThumbnails,
  Globe,
  Handshake,
  HelpCircle,
  Images,
  Info,
  KanbanSquare,
  LayoutGrid,
  Library,
  LineChart,
  Link2,
  ListChecks,
  Mail,
  MailOpen,
  MailPlus,
  Megaphone,
  MessageSquare,
  MessageSquarePlus,
  Newspaper,
  PanelTop,
  PauseCircle,
  RotateCcw,
  Scale,
  ScrollText,
  Search,
  Settings,
  Settings2,
  Share2,
  ShieldCheck,
  Stethoscope,
  Tag,
  UserCheck,
  UserPen,
  UserPlus,
  Users,
  Users2,
  Wrench,
  AtSign,
  Star,
} from "lucide-react";
import { GoogleSearchConsoleIcon } from "./icons/google-search-console-icon";
import { useSidebar } from "@/components/contexts/sidebar-context";
import { Button } from "@/components/ui/button";
import type { ArticleStatusCounts } from "@/app/(dashboard)/actions/article-status-counts";
import pkg from "@/package.json";

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
  /** بندٌ مؤقّت: لا يُرسم إلّا إذا رُفع علمُه في `applyFlags` (اليومَ ترحيلُ الطلبات وحده). */
  flag?: "ordersMigration";
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
  section: "Core work" | "Business" | "Site" | "System";
  defaultOpen?: boolean;
}

const rawMenuGroups: MenuGroup[] = [
  // «Revenue» moved to the top bar on 2026-09-04 — `components/admin/sales-menu.tsx`.
  // Khalid: «الـtab تبع الـbusiness، اللي هو الـsales، شيله من الـsidebar وحطه جنب الـtask».
  // Same reasoning as Tasks two days earlier: pages someone lives in all day should not
  // sit behind a collapsed group. Its three items moved whole — nothing was dropped.
  {
    title: "Clients",
    icon: Briefcase,
    section: "Core work",
    defaultOpen: false,
    items: [
      { icon: Users2, label: "All Clients", href: "/clients", exact: true },
      /**
       * **«تفعيل عميل» خرج من السايدبار** (خالد ٢٠ سبتمبر ٢٠٢٦: «نبغى نشيله، خلاص موجود
       * في المبيعات»).
       *
       * البابُ باقٍ على `/clients/activate` ويُفتح من قائمة المبيعات
       * (`sales-menu.tsx:49`) ومن اختصارات اللوحة — ومن هناك يصله مَن يعمل عليه وهو في
       * سياق صفقته. وبقاؤه هنا كان مدخلاً ثالثاً لنفس الشاشة، والسايدبار قائمةُ أقسامٍ
       * لا قائمةُ أفعال.
       */
      { icon: PauseCircle, label: "Suspend Client", href: "/clients/suspend" },
      // تحت «Clients» لا تحت قسم مستقلّ: الإحالة يرفعها عميلٌ قائم عن مُرشَّح، فمصدرها
      // وصاحب مكافأتها كلاهما عميل — والفريق يفتحها وهو يفكّر في العملاء لا في التسويق.
      { icon: Handshake, label: "Referrals", href: "/referrals" },
    ],
  },
  {
    title: "Articles",
    icon: Newspaper,
    section: "Core work",
    defaultOpen: false,
    items: [
      { icon: FileText, label: "All Articles", href: "/articles", exact: true },
      { icon: FilePlus, label: "New Article", href: "/articles/new" },
      // Which articles lead the modonty homepage — most partners are doctors, so an unpicked
      // homepage reads as a medical site (Khalid, 2026-09-24).
      { icon: Star, label: "Homepage Picks", href: "/articles/homepage" },
      // Every client's quota, delivered and remaining, and activation day — so the content
      // team knows who is owed what without opening each order (Khalid, 2026-09-24).
      { icon: BookUser, label: "Clients Articles", href: "/articles/clients-guide" },
      // Its own entry, not a filter on «All Articles»: these are published on the
      // CLIENT's domain and never on modonty. The section IS the destination — an
      // article created from there is marked for the client's site at birth.
      { icon: Globe, label: "Client Articles", href: "/client-articles" },
      // Sits with the writing tools, not under Clients: the audience is the content team,
      // and a writer looking for "who am I writing for" should not have to open the
      // clients admin to find it.
      { icon: BookOpen, label: "Content Briefs", href: "/briefs" },
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
          // Under Articles, not the database page — the audience is the content team
          // (Khalid 2026-08-04): a writer will never open a DB screen to find out that
          // their cover image died.
          { icon: Stethoscope, label: "Article Health", href: "/articles/health" },
          { icon: RotateCcw, label: "Status Maintenance", href: "/articles/workflow/maintenance" },
          { icon: Wrench, label: "Technical Review", href: "/articles/technical" },
          // موضعها مع الصيانة لا مع السيو: المحرّر هو من يضع المصدر، وهو من يراجعه.
          { icon: Link2, label: "Article Sources", href: "/articles/sources" },
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
          { icon: Factory, label: "Industries", href: "/industries" },
          { icon: ClipboardList, label: "Intake Questions", href: "/intake" },
        ],
      },
    ],
  },
  {
    title: "Media",
    icon: Images,
    section: "Core work",
    defaultOpen: false,
    items: [
      { icon: Images, label: "Media Library", href: "/media" },
      { icon: GalleryThumbnails, label: "Client Galleries", href: "/client-galleries" },
      { icon: Wrench, label: "Maintenance", href: "/media/maintenance" },
    ],
  },
  {
    title: "إدارة الدفع",
    icon: CreditCard,
    section: "Business",
    defaultOpen: false,
    items: [
      { icon: CreditCard, label: "الباقات والأسعار", href: "/commercial-plans" },
      { icon: Library, label: "مكتبة المزايا", href: "/commercial-features" },
    ],
  },
  // Its own group, not one line under Media (Khalid 2026-09-01): a reel is a lifecycle
  // the team runs — queue, live, rejected, archived — not a file sitting in a library.
  // One entry pointing at the queue hid the other three states behind a count nobody
  // could click, so a client pulling a live reel left no trace anyone would see.
  {
    title: "Reels",
    icon: Clapperboard,
    section: "Core work",
    defaultOpen: false,
    items: [
      { icon: ListChecks, label: "Pending", href: "/reels/pending" },
      { icon: CheckCircle2, label: "Published", href: "/reels/published" },
      { icon: FileX, label: "Rejected", href: "/reels/rejected" },
      { icon: Archive, label: "Archived", href: "/reels/archived" },
    ],
  },
  // Management — who does the work, and what work there is. Khalid, 2026-09-02:
  // «أضيف قسم اسمه management · شيل الموظفين وحطه فيه · محتوى جبر SEO حطه فيه ·
  // الشغل الإداري حطه لي إياه في management».
  //
  // Staff and JBR content are MOVED here, not copied: `Staff` left the System
  // group and the standalone «جبر سيو» group was dissolved into this one. A menu
  // entry that appears twice teaches two different mental models of one screen.
  // «إدارة المهام» is NOT a sidebar group — Khalid, 2026-09-02: «شيلها من
  // sidebar وحطها في nav bar بالـmenu حقها». It is a dropdown in the top bar
  // (`components/admin/tasks-menu.tsx`), reachable from every screen instead of
  // costing a slot in a rail that is already eleven groups deep.
  {
    title: "Management",
    icon: UserCheck,
    section: "Core work",
    defaultOpen: false,
    items: [
      // The existing screen, not a second one: `/users` already creates, edits,
      // deletes and sets roles and avatars for staff.
      { icon: Users2, label: "Staff", href: "/users" },
    ],
  },
  {
    title: "Analytics & Channels",
    icon: LineChart,
    section: "Business",
    defaultOpen: false,
    items: [
      { icon: GoogleSearchConsoleIcon, label: "Search Console", href: "/search-console" },
      { icon: Globe, label: "Bing Webmaster", href: "/bing-webmaster" },
      // Lives here, not under System: it is an SEO tool, and burying it beside DB/export
      // utilities meant opening a collapsed group to reach a page used every SEO round.
      { icon: Globe, label: "SEO Maintenance", href: "/seo" },
    ],
  },
  {
    title: "Modonty",
    icon: BookOpen,
    section: "Site",
    defaultOpen: false,
    items: [
      {
        subMenu: "Info & Legal",
        items: [
          { icon: Info, label: "About", href: "/modonty/pages/about" },
          { icon: Mail, label: "Contact", href: "/modonty/pages/contact" },
          { icon: CircleHelp, label: "FAQ", href: "/modonty/faq" },
          { icon: Scale, label: "Terms", href: "/modonty/pages/terms" },
          { icon: Handshake, label: "User Agreement", href: "/modonty/pages/user-agreement" },
          { icon: ShieldCheck, label: "Privacy Policy", href: "/modonty/pages/privacy-policy" },
          { icon: Cookie, label: "Cookie Policy", href: "/modonty/pages/cookie-policy" },
          { icon: Copyright, label: "Copyright", href: "/modonty/pages/copyright-policy" },
          { icon: BadgeCheck, label: "Trust", href: "/modonty/pages/trust" },
          { icon: BookOpen, label: "Story", href: "/modonty/pages/story" },
          { icon: BookOpen, label: "Audio", href: "/modonty/pages/audio" },
          { icon: BookOpen, label: "Reels", href: "/modonty/pages/reels" },
          // Link-in-bio page — its SEO, share/hero image and the social accounts it lists.
          { icon: AtSign, label: "Accounts", href: "/modonty/pages/accounts" },
        ],
      },
      {
        subMenu: "Master Pages",
        items: [
          { icon: Building2, label: "Homepage", href: "/settings/modonty" },
          { icon: Briefcase, label: "Clients", href: "/settings/clients" },
          { icon: Folder, label: "Categories", href: "/settings/categories" },
          { icon: Tag, label: "Tags", href: "/settings/tags" },
          { icon: Factory, label: "Industries", href: "/settings/industries" },
          { icon: Flame, label: "Trending", href: "/settings/trending" },
          { icon: HelpCircle, label: "FAQ", href: "/settings/faq" },
          { icon: FileText, label: "Articles", href: "/settings/articles" },
        ],
      },
      // بند مستقلّ لا داخل مجموعة فرعية (خالد، ٢٨ أغسطس: «أبغى مودو صفحة لوحده»):
      // شخصية المساعد وتعليماته ليست إعداداً من إعدادات الصفحات — هي ما يقوله لكل زائر.
      { icon: Bot, label: "Modo AI", href: "/modonty/modo" },
      { icon: UserPen, label: "Authors", href: "/authors" },
      // Visible homepage content (not SEO) — future home for landing/hero options.
      { icon: PanelTop, label: "Homepage Banner", href: "/settings/banner" },
    ],
  },
  // مجموعة «جبر سيو» المستقلّة حُلَّت في «Management» بأمر خالد (٢ سبتمبر ٢٠٢٦).
  // عزل المنتجين (قرار JBR10) باقٍ كما هو — الفصل في البيانات والمسارات لا في
  // موضع البند في القائمة. وبند «المقالات» يُضاف مع بناء صفحته (JT2).
  {
    title: "Audience",
    icon: Users,
    section: "Site",
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
    icon: Settings2,
    section: "System",
    defaultOpen: false,
    items: [
      // «Staff» انتقل إلى مجموعة Management (خالد، ٢ سبتمبر ٢٠٢٦). بندٌ في مكانين
      // يعلّم خريطتين ذهنيّتين لشاشة واحدة.
      { icon: ListChecks, label: "Dropdown Lists", href: "/settings/reference-data" },
      { icon: Download, label: "Export Data", href: "/export-data" },
      { icon: Database, label: "Database", href: "/database" },
      { icon: Cloud, label: "Bunny", href: "/bunny" },
      // TEMPORARY — one-time Cloudinary → Bunny migration. Delete this line together with
      // `app/(dashboard)/bunny-migration/` once every asset is on Bunny and verified.
      { icon: CloudUpload, label: "Bunny Migration", href: "/bunny-migration" },
      // TEMPORARY — ترحيلُ الطلبات لمرّةٍ واحدة. يختفي من تلقائه متى امتلأ جدولُ
      // الطلبات على الإنتاج (`showOrdersMigration` يُقرأ في الخادم، `layout.tsx`)،
      // ويُحذف هذا السطرُ مع `app/(dashboard)/orders-migration/` بعد إتمامه.
      { icon: ArrowRightLeft, label: "Migrations", href: "/migrations", flag: "ordersMigration" as const },
      { icon: Images, label: "Default Images", href: "/settings/defaults" },
      { icon: Wrench, label: "Maintenance", href: "/maintenance" },
      { icon: MailOpen, label: "Email Templates", href: "/emails" },
      { icon: ScrollText, label: "Audit Log", href: "/audit-log" },
      { icon: Bug, label: "Error Logs", href: "/system-errors" },
      // Came down from the top bar on 2026-09-04. It belongs beside the audit and error
      // logs: all three answer «what did the system record?» — and unlike the bar's
      // send-only button, this one also reads the reports back.
      { icon: MessageSquarePlus, label: "Feedback", href: "/feedback" },
    ],
  },
];

const topItems: MenuItem[] = [
  { icon: LayoutGrid, label: "Dashboard", href: "/", exact: true },
  // Traffic analytics stays prominent — it's the daily thermometer, always one click away.
  { icon: BarChart3, label: "Traffic Analytics", href: "/analytics" },
];

const sectionOrder: Record<MenuGroup["section"], number> = {
  "Core work": 0,
  Business: 1,
  Site: 2,
  System: 3,
};

// Keep operational work at the top. The source declarations stay grouped by
// domain, while the rendered order reflects how an admin moves through a day.
const sortedMenuGroups = [...rawMenuGroups].sort(
  (a, b) => sectionOrder[a.section] - sectionOrder[b.section],
);

/** بندٌ يحمل `flag` لا يُرسم إلّا إذا رُفع علمُه — اليومَ واحدٌ: ترحيلُ الطلبات. */
function applyFlags(flags: { ordersMigration: boolean }) {
  return sortedMenuGroups.map((group) => ({
    ...group,
    items: group.items.filter((item) => {
      // القوائمُ الفرعيّة لا تحمل علماً — لا يُرسم شرطٌ إلّا على البنود المفردة.
      const flag = isSubMenu(item) ? undefined : item.flag;
      return !flag || flags[flag];
    }),
  }));
}

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

export function Sidebar({
  articleStatusCounts,
  showOrdersMigration = false,
}: {
  articleStatusCounts?: ArticleStatusCounts | null;
  /**
   * بندُ «Orders Migration» يُرسم فقط ما دام الترحيل متاحاً — والشرطُ يُقرأ في الخادم
   * (`lib/orders-migration-gate.ts`) لأنّه يعدّ صفوفاً في القاعدة، ولا يجوز أن يهبط
   * عدُّها إلى حزمة المتصفّح. وصفحتُه تُطبّق الشرطَ نفسَه، فإخفاءُ الرابط راحةٌ للعين
   * لا حاجزُ أمان.
   */
  showOrdersMigration?: boolean;
}) {
  const pathname = usePathname();
  const { collapsed, toggle } = useSidebar();
  const menuGroups = applyFlags({ ordersMigration: showOrdersMigration });

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
            <OptimizedImage
              media={asMedia(BRAND_ICON_URL, "Modonty")} alt="Modonty"
              // كانت مفقودة قبل التحويل — المكوّن يجعلها خطأ تصريف
              sizes="32px"
              width={32}
              height={32}
              className="h-full w-full object-contain p-1"
            />
          </div>
          {!collapsed && (
            <span className="flex items-baseline gap-1.5 min-w-0">
              <span className="text-base font-semibold text-foreground whitespace-nowrap">
                Modonty
              </span>
              <span className="text-[11px] font-medium text-muted-foreground tabular-nums whitespace-nowrap">
                v{pkg.version}
              </span>
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
        {menuGroups.map((group, index) => {
          const GroupIcon = group.icon;
          const startsSection = index === 0 || menuGroups[index - 1].section !== group.section;

          if (collapsed) {
            return (
              <div key={group.title} className="space-y-0.5">
                {startsSection && index > 0 && <div className="mx-2 my-2 border-t border-border/50" />}
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
            <div key={group.title} className={startsSection && index > 0 ? "mt-3" : ""}>
              {startsSection && (
                <p className="px-3 pb-1 pt-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground/70">
                  {group.section}
                </p>
              )}
              <Collapsible
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
            </div>
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
