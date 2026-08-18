"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";

/** Same wiring as modonty: `class` drives Tailwind's `dark:`, system by default, no colour transition on switch. */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      {children}
    </NextThemesProvider>
  );
}
