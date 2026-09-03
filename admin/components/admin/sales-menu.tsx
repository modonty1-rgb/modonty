"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CreditCard, TrendingUp, Wallet } from "lucide-react";

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
  { href: "/clients/accounts", label: "Accounts", icon: Wallet, hint: "What each client owes and paid" },
  { href: "/clients/sales-report", label: "Sales Report", icon: TrendingUp, hint: "Revenue, month by month" },
  { href: "/subscription-tiers", label: "Subscription Tiers", icon: CreditCard, hint: "Plans and their prices" },
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
          aria-label="Sales"
          className={cn(
            "h-8 gap-1.5 text-xs font-medium",
            active && "bg-accent text-accent-foreground",
          )}
        >
          <Wallet className="size-4" aria-hidden />
          <span className="hidden sm:inline">Sales</span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuLabel>Sales</DropdownMenuLabel>
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
