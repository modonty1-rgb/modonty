import { freeTheme } from "../free/theme";
import { creativeTheme } from "../creative/theme";
import type { PartnerPageKey, PartnerTheme, ThemeFooter, ThemeHeader } from "./theme-contract";

/**
 * Every theme modonty can render. Adding a theme = one folder + one line here (THEMES.md).
 * Order is the catalog order.
 */
export const THEMES: readonly PartnerTheme[] = [freeTheme, creativeTheme];

export const DEFAULT_THEME_KEY = "free";

/**
 * The partner's theme, or the free one. A missing/retired key never breaks a site. When premium
 * themes ship, entitlement is checked BEFORE this call (the catalog decides; see THEMES.md §5) —
 * this function only resolves code.
 */
export function getTheme(key: string | null | undefined): PartnerTheme {
  return THEMES.find((t) => t.key === key) ?? THEMES.find((t) => t.key === DEFAULT_THEME_KEY)!;
}

/**
 * THE way a partner's theme is chosen at render time — modonty and the console preview both call
 * this, never `getTheme(site.themeKey)` directly. A premium theme renders only when the partner is
 * entitled to it; otherwise the free theme (no purchase model yet → premium is never entitled, so
 * a premium key stored by mistake can never give a theme away). THEMES.md §5.
 */
export function resolvePartnerTheme(themeKey: string | null | undefined, options?: { ownsPremium?: (key: string) => boolean }): PartnerTheme {
  const theme = getTheme(themeKey);
  if (theme.tier === "premium" && !options?.ownsPremium?.(theme.key)) return getTheme(DEFAULT_THEME_KEY);
  return theme;
}

/** A page's blocks in the given theme. */
export function getThemePage(theme: PartnerTheme, page: PartnerPageKey) {
  return theme.pages[page];
}

/** The chosen header shape in this theme, or the theme's default. */
export function getThemeHeader(theme: PartnerTheme, key: string | null | undefined): ThemeHeader {
  return theme.headers.find((h) => h.key === key) ?? theme.headers.find((h) => h.key === theme.defaultHeader) ?? theme.headers[0];
}

/** The chosen footer shape in this theme, or the theme's default. */
export function getThemeFooter(theme: PartnerTheme, key: string | null | undefined): ThemeFooter {
  return theme.footers.find((f) => f.key === key) ?? theme.footers.find((f) => f.key === theme.defaultFooter) ?? theme.footers[0];
}
