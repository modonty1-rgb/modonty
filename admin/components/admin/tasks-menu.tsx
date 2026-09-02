"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Archive, KanbanSquare, LayoutGrid, UserCheck } from "lucide-react";

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
  { href: "/tasks", label: "Board", icon: LayoutGrid, hint: "Four columns — where the work stands" },
  { href: "/daily-tasks", label: "Report", icon: UserCheck, hint: "Each person and their day" },
  { href: "/tasks/archive", label: "Archive", icon: Archive, hint: "Taken off the board" },
] as const;

/**
 * Task management, in the top bar rather than the sidebar.
 *
 * Khalid moved it here (2026-09-02): it is crossed into from wherever you happen
 * to be, and the sidebar buries it under eleven collapsed groups. It is not a
 * place you navigate to so much as one you check.
 *
 * The trigger lights up whenever any of its pages is open, so the bar still says
 * where you are.
 */
export function TasksMenu() {
  const pathname = usePathname();
  const active = ITEMS.some(
    (i) => pathname === i.href || (i.href !== "/tasks" && pathname.startsWith(i.href)),
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          aria-label="Tasks"
          className={cn(
            "h-8 gap-1.5 text-xs font-medium",
            active && "bg-accent text-accent-foreground",
          )}
        >
          <KanbanSquare className="size-4" aria-hidden />
          <span className="hidden sm:inline">Tasks</span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuLabel>Tasks</DropdownMenuLabel>
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
