"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ComponentProps } from "react";

/**
 * مزوّد السمة — يضع صنف `dark` على `<html>` حسب تفضيل الجهاز، فتعمل توكنات الداكن
 * المولَّدة في `globals.css`. بدونه يبقى التطبيق فاتحاً دائماً مهما كان تفضيل الزائر.
 */
export function ThemeProvider({ children, ...props }: ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
