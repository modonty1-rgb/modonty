"use client";

import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { IconDesktop, IconMoon, IconSun } from "@/lib/icons";

// shadcn's official "mode toggle" over next-themes (already the app's provider:
// attribute="class", enableSystem): an icon-only button that opens light · dark ·
// system. Lives in the header's utility group so signed-out visitors get it too.
// The sun/moon swap is CSS-only (`dark:` classes), so there is no hydration mismatch
// and no need to wait for mount.
export function ThemeToggle() {
  const { setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {/* relative: the moon is absolutely stacked on the sun. h-11: same hit size as the bell. */}
        {/* Muted like the other bar controls; full-strength white read as glare (Khalid). */}
        <Button variant="ghost" size="icon" aria-label="تغيير المظهر" className="relative h-11 w-11 rounded-full text-muted-foreground hover:text-foreground">
          <IconSun className="h-5 w-5 rotate-0 scale-100 transition-transform dark:-rotate-90 dark:scale-0" aria-hidden />
          <IconMoon className="absolute h-5 w-5 rotate-90 scale-0 transition-transform dark:rotate-0 dark:scale-100" aria-hidden />
        </Button>
      </DropdownMenuTrigger>
      {/* Same surface as the header it drops from (slate-100 light / card dark) — the
          default popover white read as a glare against the bar (Khalid, 2026-08-16). */}
      <DropdownMenuContent align="end" className="min-w-36 bg-slate-100 dark:bg-card">
        <DropdownMenuItem onClick={() => setTheme("light")} className="gap-2">
          <IconSun className="h-4 w-4" aria-hidden />
          فاتح
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")} className="gap-2">
          <IconMoon className="h-4 w-4" aria-hidden />
          داكن
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")} className="gap-2">
          <IconDesktop className="h-4 w-4" aria-hidden />
          حسب الجهاز
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
