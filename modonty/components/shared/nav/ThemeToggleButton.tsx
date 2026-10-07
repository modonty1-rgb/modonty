"use client";

import { forwardRef, type ComponentPropsWithoutRef } from "react";

import { Button } from "@/components/ui/button";
// Direct import, not the `@/lib/icons` barrel: from a client tree the barrel pulled all 69 registry
// icons into every page (bundle analyzer, 3 Oct 2026). Same brand marks, same names.
import { ModontyThemeDarkMark as IconMoon, ModontyThemeLightMark as IconSun } from "@/components/icons/modonty-brand-icons";

export type ThemeLabels = { toggle: string; light: string; dark: string; system: string };

/**
 * The sun/moon button, alone — no menu code. It is the placeholder `ThemeToggle` shows before the
 * menu loads AND the trigger inside the menu once it has, so the swap is invisible. forwardRef +
 * spread so Radix's `asChild` trigger can attach its ref and handlers.
 */
export const ThemeToggleButton = forwardRef<HTMLButtonElement, ComponentPropsWithoutRef<"button"> & { label: string }>(
  function ThemeToggleButton({ label, ...props }, ref) {
    return (
      // Muted like the other navigation controls; the moon is stacked on the sun.
      <Button ref={ref} variant="navigation" size="mobileIcon" aria-label={label} className="relative rounded-xl" {...props}>
        <IconSun className="rotate-0 scale-100 transition-transform dark:-rotate-90 dark:scale-0" aria-hidden />
        <IconMoon className="absolute rotate-90 scale-0 transition-transform dark:rotate-0 dark:scale-100" aria-hidden />
      </Button>
    );
  },
);
