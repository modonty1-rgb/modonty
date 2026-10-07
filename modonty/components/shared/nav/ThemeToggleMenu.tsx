"use client";

import { useTheme } from "next-themes";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { IconDesktop, IconMoon, IconSun } from "@/lib/icons";

import { ThemeToggleButton, type ThemeLabels } from "./ThemeToggleButton";

/**
 * The light / dark / system menu itself. Loaded only through `ThemeToggle` — never imported
 * directly — because Radix DropdownMenu (popper, focus scope, scroll lock, collection) was ~50KB
 * gzip in the first load of every page for a control most readers never open (plan أ١, 3 Oct 2026).
 */
export function ThemeToggleMenu({ labels, defaultOpen = false }: { labels: ThemeLabels; defaultOpen?: boolean }) {
  const { setTheme } = useTheme();

  return (
    <DropdownMenu defaultOpen={defaultOpen}>
      <DropdownMenuTrigger asChild>
        <ThemeToggleButton label={labels.toggle} />
      </DropdownMenuTrigger>
      {/* Same surface as the header it drops from (slate-100 light / card dark) — the
          default popover white read as a glare against the bar (Khalid, 2026-08-16). */}
      <DropdownMenuContent align="end" className="min-w-36 bg-slate-100 dark:bg-card">
        <DropdownMenuItem onClick={() => setTheme("light")} className="gap-2">
          <IconSun className="h-4 w-4" aria-hidden />
          {labels.light}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")} className="gap-2">
          <IconMoon className="h-4 w-4" aria-hidden />
          {labels.dark}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")} className="gap-2">
          <IconDesktop className="h-4 w-4" aria-hidden />
          {labels.system}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
