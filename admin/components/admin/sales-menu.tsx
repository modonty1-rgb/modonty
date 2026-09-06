"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarClock, CreditCard, TrendingUp, UserPlus, UsersRound, Wallet } from "lucide-react";

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

const ITEMS = [
  /**
   * المتابعة أوّلاً — وهي ليست ترتيباً أبجدياً ولا ترتيب رحلة العميل.
   *
   * القائمة مرتَّبة بترتيب **يوم فاتن** لا بترتيب النظام: أوّل ما تفتح الأدمن تسأل «مين
   * عليّا النهارده؟» لا «مين عندنا؟». والجرد يأتي بعده لأنه يُتصفَّح، بينما هذه تُفرَغ.
   *
   * خالد (٤ سبتمبر): «مبيعات فيه menu اسمها follow up».
   */
  { href: "/sales-leads/follow-ups", label: "المتابعة", icon: CalendarClock, hint: "مين عليكي النهارده" },
  // ثم الجرد: الشخص محتمَلٌ قبل أن يكون عميلاً له حساب.
  { href: "/sales-leads", label: "العملاء المحتملون", icon: UserPlus, hint: "اللي بنكلّمهم قبل ما يوقّعوا" },
  { href: "/campaigns/leads", label: "عملاء الحملات", icon: UsersRound, hint: "العملاء المهتمون القادمون من الترويج" },
  { href: "/clients/accounts", label: "الحسابات", icon: Wallet, hint: "كل عميل عليه كام ودفع كام" },
  { href: "/clients/sales-report", label: "تقرير المبيعات", icon: TrendingUp, hint: "الإيراد شهر بشهر" },
  { href: "/subscription-tiers", label: "الباقات", icon: CreditCard, hint: "الباقات وأسعارها" },
] as const;

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
        <DropdownMenuLabel>المبيعات</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {ITEMS.map(({ href, label, icon: Icon, hint }) => {
          const current = pathname === href;
          return (
            <DropdownMenuItem key={href} asChild>
              <Link
                href={href}
                aria-current={current ? "page" : undefined}
                className={cn("flex items-start gap-2", current && "bg-accent")}
              >
                <Icon className="mt-0.5 size-4 shrink-0" aria-hidden />
                <span className="flex min-w-0 flex-col">
                  <span className="text-[13px] font-medium">{label}</span>
                  <span className="text-[11px] text-muted-foreground">{hint}</span>
                </span>
              </Link>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
