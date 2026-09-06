"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, Megaphone } from "lucide-react";

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

const ITEMS = [
  { href: "/campaigns", label: "الحملات", icon: Megaphone, hint: "إعداد الحملة وميزانيتها ورابطها" },
  { href: "/campaigns/reports/modonty", label: "تقارير مدونتي", icon: BarChart3, hint: "تقرير Meta الخاص بمدونتي" },
  { href: "/campaigns/reports/jbrseo", label: "تقارير جبر سيو", icon: BarChart3, hint: "تقرير Meta الخاص بجبر سيو" },
] as const;

/** مساحة مستقلة للإعلان المدفوع؛ لا تختلط بمتابعة العملاء والمبيعات. */
export function CampaignsMenu() {
  const pathname = usePathname();
  const active = ITEMS.some((item) => pathname === item.href || pathname.startsWith(item.href + "/"));

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          aria-label="الحملات الإعلانية"
          className={cn("h-8 gap-1.5 text-xs font-medium", active && "bg-accent text-accent-foreground")}
        >
          <Megaphone className="size-4" aria-hidden />
          <span className="hidden sm:inline">الحملات الإعلانية</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64" style={{ direction: "rtl" }}>
        <DropdownMenuLabel>الحملات الإعلانية</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          {ITEMS.map(({ href, label, icon: Icon, hint }) => {
            const current = pathname === href;
            return (
              <DropdownMenuItem key={href} asChild>
                <Link href={href} aria-current={current ? "page" : undefined} className={cn("flex items-start gap-2", current && "bg-accent")}>
                  <Icon className="mt-0.5 size-4 shrink-0" aria-hidden />
                  <span className="flex min-w-0 flex-col">
                    <span className="text-[13px] font-medium">{label}</span>
                    <span className="text-[11px] text-muted-foreground">{hint}</span>
                  </span>
                </Link>
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
