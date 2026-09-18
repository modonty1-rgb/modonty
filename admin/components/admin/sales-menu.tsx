"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BadgeCheck, CalendarClock, Eye, Receipt, ShieldAlert, TrendingUp, UserPlus, Users2, UsersRound, Wallet } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

/**
 * ثلاث مجموعات يفصل بينها خطّ (خالد ١٥ سبتمبر ٢٠٢٦)، والفاصل يقول «انتهت مرحلة
 * وبدأت أخرى» فتُقرأ القائمة كخريطة لا كقائمة روابط.
 *
 * والمشتركون **فوق** المحتملين بقرار خالد — لا لأنهم لاحقون في الرحلة، بل لأنهم
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
}

interface SalesGroup {
  title: string;
  items: SalesLink[];
}

const GROUPS: SalesGroup[] = [
  {
    title: "العملاء المشتركون",
    items: [
      { href: "/orders", label: "طلب اشتراك", icon: Receipt },
      { href: "/clients/activate", label: "تفعيل عميل", icon: BadgeCheck },
      { href: "/clients", label: "كل المشتركين", icon: Users2 },
    ],
  },
  {
    title: "العملاء المحتملون",
    items: [
      { href: "/sales-leads/new", label: "إضافة عميل محتمل", icon: UserPlus },
      { href: "/sales-leads", label: "إدارة العملاء المحتملين", icon: UsersRound },
      { href: "/sales-leads/follow-ups", label: "متابعة العملاء", icon: CalendarClock },
    ],
  },
  {
    title: "الأمور المالية",
    items: [
      { href: "/pay-preview", label: "الباقات", icon: Eye },
      { href: "/payment-failures", label: "إخفاقات الدفع", icon: ShieldAlert },
      { href: "/clients/sales-report", label: "تقرير المبيعات", icon: TrendingUp },
    ],
  },
];

const ITEMS = GROUPS.flatMap((group) => group.items);

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
export function SalesMenu() {
  const pathname = usePathname();
  const active = ITEMS.some((i) => pathname === i.href || pathname.startsWith(i.href + "/"));
  const activeItemHref = ITEMS
    .filter((item) => pathname === item.href || pathname.startsWith(item.href + "/"))
    .sort((first, second) => second.href.length - first.href.length)[0]?.href;

  return (
    <DropdownMenu>
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
        </Button>
      </DropdownMenuTrigger>

      {/* الاتجاه على العنصر لا على المكوّن: `DropdownMenuContent` لا تُمرِّر `dir` (ليست في
          واجهتها)، فيُكتب على الحاوية التي يُعرَض داخلها المحتوى فعلاً. */}
      <DropdownMenuContent align="end" className="w-64" style={{ direction: "rtl" }}>
        {GROUPS.map((group, groupIndex) => (
          <div key={group.title}>
            {groupIndex > 0 && <DropdownMenuSeparator />}
            <DropdownMenuLabel className="text-[11px] font-bold text-muted-foreground">
              {group.title}
            </DropdownMenuLabel>
            {group.items.map(({ href, label, icon: Icon }) => {
              const current = activeItemHref === href;
              return (
                <DropdownMenuItem key={href} asChild>
                  <Link
                    href={href}
                    aria-current={current ? "page" : undefined}
                    className={cn("flex items-center gap-2", current && "bg-accent")}
                  >
                    <Icon className="size-4 shrink-0" aria-hidden />
                    <span className="text-[13px] font-medium">{label}</span>
                  </Link>
                </DropdownMenuItem>
              );
            })}
          </div>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
