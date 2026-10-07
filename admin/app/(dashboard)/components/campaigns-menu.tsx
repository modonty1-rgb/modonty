"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, FilePlus2, Megaphone } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

/**
 * عنصرٌ واحد للحملات، والتبويبات (بانتظار الموافقة · موافَق عليها · مرفوضة) داخل الصفحة لا في
 * القائمة (خالد ٢٩ سبتمبر ٢٠٢٦: «مفروض يكون منيو آيتم واحد وجوّه السلكشن»). والعدد الذي ينتظر
 * القرار بادجٌ على العنصر وعلى زرّ القائمة.
 */
const STEPS = [
  { href: "/campaigns/new", label: "بريف جديد", icon: FilePlus2, hint: "الميديا باير يكتب البريف قبل الإعلان", badge: false },
  { href: "/campaigns", label: "الحملات", icon: Megaphone, hint: "بانتظار الموافقة · موافَق عليها · مرفوضة", badge: true },
] as const;

// Modonty only — every campaign here runs for Modonty (Khalid, 29 Sep 2026); the Jbrseo report
// page stays reachable by its URL, just not listed.
const REPORTS = [
  { href: "/campaigns/reports/modonty", label: "تقارير مدونتي", icon: BarChart3, hint: "تقرير Meta الخاص بمدونتي" },
] as const;

const ar = new Intl.NumberFormat("ar-EG");

/** مساحة مستقلة للإعلان المدفوع؛ لا تختلط بمتابعة العملاء والمبيعات. */
export function CampaignsMenu({ pendingBriefs = 0 }: { pendingBriefs?: number }) {
  const pathname = usePathname();
  const active = pathname === "/campaigns" || pathname.startsWith("/campaigns/");

  const item = (href: string, label: string, Icon: typeof Megaphone, hint: string, current: boolean, badge?: number) => (
    <DropdownMenuItem key={href} asChild>
      <Link href={href} aria-current={current ? "page" : undefined} className={cn("flex items-start gap-2", current && "bg-accent")}>
        <Icon className="mt-0.5 size-4 shrink-0" aria-hidden />
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="text-[13px] font-medium">{label}</span>
          <span className="text-[11px] text-muted-foreground">{hint}</span>
        </span>
        {badge ? (
          <span className="mt-0.5 rounded-full bg-amber-500 px-1.5 text-[10px] font-bold leading-4 text-white tabular-nums">{ar.format(badge)}</span>
        ) : null}
      </Link>
    </DropdownMenuItem>
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          aria-label="الحملات الإعلانية"
          className={cn("relative h-8 gap-1.5 text-xs font-medium", active && "bg-accent text-accent-foreground")}
        >
          <Megaphone className="size-4" aria-hidden />
          <span className="hidden sm:inline">الحملات الإعلانية</span>
          {/* Briefs waiting for a decision — seen without opening the menu. */}
          {pendingBriefs > 0 ? (
            <span className="rounded-full bg-amber-500 px-1.5 text-[10px] font-bold leading-4 text-white tabular-nums">{ar.format(pendingBriefs)}</span>
          ) : null}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64" style={{ direction: "rtl" }}>
        <DropdownMenuLabel>الحملات الإعلانية</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          {STEPS.map(({ href, label, icon, hint, badge }) =>
            item(href, label, icon, hint, pathname === href, badge ? pendingBriefs : undefined),
          )}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          {REPORTS.map(({ href, label, icon, hint }) => item(href, label, icon, hint, pathname === href))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
