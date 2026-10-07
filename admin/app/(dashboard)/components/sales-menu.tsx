"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BadgeCheck, BarChart3, Coins, Eye, HandCoins, MessageCircle, Receipt, RefreshCw, ShieldAlert, TrendingUp, UserPlus, Users2, UsersRound, Wallet } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

/**
 * المشتركون **فوق** المحتملين بقرار خالد (١٥ سبتمبر ٢٠٢٦) — لا لأنهم لاحقون في الرحلة، بل لأنهم
 * الشغل اليوميّ: الطلب الواصل والتفعيل والمتابعة أكثر ما تُفتح، والمحتمَل عملٌ
 * يسبقهم زمناً ويليهم في الأهمية.
 */
/**
 * النوع مكتوبٌ صراحةً بدل `as const`: مع `as const` يصير كل `items` **تابل** بعناصر
 * حرفيّة، فيقرأ `flatMap` اتّحاد ثلاث تابلات مختلفة الأشكال ويرجع `unknown` — وهو
 * ما أسقط بناء الإنتاج (`TS18046: 'i' is of type 'unknown'`). النوع الصريح يعطي
 * مصفوفةً واحدة متجانسة، والقراءة بعدها مضمونة.
 */
interface SalesLink {
  href: string;
  label: string;
  icon: LucideIcon;
  /** يُرسم للأدمن وحده — والصفحةُ نفسها تفرض الشرط، فإخفاءُ الرابط راحةٌ لا حاجز. */
  adminOnly?: boolean;
  /** يحمل عدد طلبات التواصل الجديدة — رقمٌ أحمر بجانب الاسم. */
  countsNewContactRequests?: boolean;
}

interface SalesGroup {
  title: string;
  icon: LucideIcon;
  items: SalesLink[];
}

/**
 * **قائمة وقوائم فرعيّة** (خالد ١ أكتوبر ٢٠٢٦: «ليه ما تعملها منيو وصب منيو»): أربع مجموعات في
 * الأعلى، وكلّ مجموعةٍ تفتح صفحاتها جانباً — كانت عشرة روابط تحت بعضها بعناوين صغيرة. والعمولاتُ
 * خرجت من «الأمور المالية» لمجموعتها: هي ما يفتحه المندوبُ لنفسه، لا ما تفتحه الإدارة عنه.
 */
const GROUPS: SalesGroup[] = [
  {
    title: "المشتركون",
    icon: Users2,
    items: [
      // طلبات تواصل القرّاء (خالد ٢ أكتوبر ٢٠٢٦، ج٨): المندوب يسأل عميله ويحدّث الحالة — أوّلاً لأنها
      // الشغل الذي ينتظره، ورقمها الأحمر يظهر على زرّ «المبيعات» نفسه.
      { href: "/contact-requests", label: "طلبات التواصل", icon: MessageCircle, countsNewContactRequests: true },
      // جديد وتجديد بابان منفصلان (خالد ١ أكتوبر ٢٠٢٦) — والطلبُ واحدٌ في القاعدة على حساب العميل نفسه.
      { href: "/orders/new", label: "اشتراك جديد", icon: UserPlus },
      { href: "/orders/renewals", label: "تجديد اشتراك", icon: RefreshCw },
      // اسمُ الصفحة نفسُه («الاشتراكات»). و«كل المشتركين» (`/clients`) شِيل من هنا (خالد ١ أكتوبر
      // ٢٠٢٦: «في لخبطة»): يعرض نفس العملاء بعين فريق المحتوى، وهو في القائمة الجانبية «All Clients».
      { href: "/orders", label: "الاشتراكات", icon: Receipt },
      { href: "/clients/activate", label: "تفعيل عميل", icon: BadgeCheck },
    ],
  },
  {
    title: "العملاء المحتملون",
    icon: UsersRound,
    items: [
      { href: "/sales-leads/new", label: "إضافة عميل محتمل", icon: UserPlus },
      { href: "/sales-leads", label: "إدارة العملاء المحتملين", icon: UsersRound },
    ],
  },
  {
    title: "العمولات",
    icon: Coins,
    items: [
      // كشف الحساب (خالد ١ أكتوبر ٢٠٢٦): الأدمن يرى كلّ المناديب، والمندوبُ كشفَه هو وحده.
      { href: "/commission-statement", label: "كشف حساب العمولات", icon: Wallet },
      // تصفية حسابات المناديب (خالد ٣٠ سبتمبر ٢٠٢٦: «تطلع بس للآدمن»).
      { href: "/sales-commissions", label: "صرف عمولات المناديب", icon: HandCoins, adminOnly: true },
    ],
  },
  {
    title: "التقارير والدفع",
    icon: BarChart3,
    items: [
      { href: "/clients/sales-report", label: "تقرير المبيعات", icon: TrendingUp },
      { href: "/payment-failures", label: "إخفاقات الدفع", icon: ShieldAlert },
      { href: "/pay-preview", label: "الباقات", icon: Eye },
    ],
  },
];

const ITEMS = GROUPS.flatMap((group) => group.items);

const ar = new Intl.NumberFormat("ar-EG");

function NewCount({ value }: { value: number }) {
  if (value <= 0) return null;
  return (
    <span className="rounded-full bg-rose-600 px-1.5 text-[10px] font-bold leading-4 text-white tabular-nums">{ar.format(value)}</span>
  );
}

/**
 * Sales, in the top bar rather than the sidebar — the same move Tasks made on
 * 2026-09-02, for the same reason and now for a named person.
 *
 * Khalid (2026-09-04): «الـtab تبع الـbusiness، اللي هو الـsales، شيله من الـsidebar
 * وحطه جنب الـtask». Faten runs sales out of this admin, so these three pages are
 * her whole day — and in the sidebar they sat behind a collapsed group under a
 * section header she has to scroll past. The bar puts them one click from anywhere.
 *
 * Deliberately NOT moved: «Analytics & Channels» is filed under the same Business
 * section but holds Search Console, Bing and SEO Maintenance — SEO tooling, not
 * sales. Moving it here would put Tareq's tools in Faten's menu.
 *
 * The trigger lights up whenever one of its pages is open, so the bar still says
 * where you are.
 */
export function SalesMenu({ isAdmin = false, newContactRequests = 0 }: { isAdmin?: boolean; newContactRequests?: number }) {
  const pathname = usePathname();
  const active = ITEMS.some((i) => pathname === i.href || pathname.startsWith(i.href + "/"));
  const activeItemHref = ITEMS
    .filter((item) => pathname === item.href || pathname.startsWith(item.href + "/"))
    .sort((first, second) => second.href.length - first.href.length)[0]?.href;

  return (
    // `dir` on the root: Radix then opens the sub-menus to the left, the RTL «next».
    <DropdownMenu dir="rtl">
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          aria-label="المبيعات"
          className={cn(
            "h-8 gap-1.5 text-xs font-medium",
            active && "bg-accent text-accent-foreground",
          )}
        >
          <Wallet className="size-4" aria-hidden />
          {/* عربيّ في شريطٍ إنجليزيّ — بقصد: هذه بوّابة فاتن وحدها، والاسم الذي تبحث عنه
              هو الذي تعرفه. بقيّة الشريط لبقيّة الفريق ويبقى كما هو. */}
          <span className="hidden sm:inline">المبيعات</span>
          {/* طلبات تواصل جديدة تنتظر المندوب — تُرى بلا فتح القائمة. */}
          <NewCount value={newContactRequests} />
        </Button>
      </DropdownMenuTrigger>

      {/* الاتجاه على العنصر لا على المكوّن: `DropdownMenuContent` لا تُمرِّر `dir` (ليست في
          واجهتها)، فيُكتب على الحاوية التي يُعرَض داخلها المحتوى فعلاً. */}
      <DropdownMenuContent align="end" className="w-56" style={{ direction: "rtl" }}>
        {GROUPS.map((group) => {
          const items = group.items.filter((item) => isAdmin || !item.adminOnly);
          const holdsCurrent = items.some((item) => item.href === activeItemHref);
          const groupCount = items.some((item) => item.countsNewContactRequests) ? newContactRequests : 0;
          const GroupIcon = group.icon;
          return (
            <DropdownMenuSub key={group.title}>
              {/* The trigger's chevron points right and is pushed by `ml-auto`; in RTL the sub-menu
                  opens left, so it turns and goes to the far (left) edge. */}
              <DropdownMenuSubTrigger
                className={cn("gap-2 py-2 [&>svg:last-child]:ml-0 [&>svg:last-child]:mr-auto [&>svg:last-child]:rotate-180", holdsCurrent && "bg-accent/60")}
              >
                <GroupIcon className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                <span className="text-[13px] font-semibold">{group.title}</span>
                <NewCount value={groupCount} />
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent className="w-60" style={{ direction: "rtl" }}>
                {items.map(({ href, label, icon: Icon, countsNewContactRequests }) => {
                  const current = activeItemHref === href;
                  return (
                    <DropdownMenuItem key={href} asChild>
                      <Link
                        href={href}
                        aria-current={current ? "page" : undefined}
                        className={cn("flex items-center gap-2 py-2", current && "bg-accent")}
                      >
                        <Icon className="size-4 shrink-0" aria-hidden />
                        <span className="text-[13px] font-medium">{label}</span>
                        {countsNewContactRequests ? (
                          <span className="ms-auto">
                            <NewCount value={newContactRequests} />
                          </span>
                        ) : null}
                      </Link>
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuSubContent>
            </DropdownMenuSub>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
