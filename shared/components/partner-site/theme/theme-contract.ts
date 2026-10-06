import type { ComponentType } from "react";

import type { HomeBlock, HomeData } from "../free/home";
import type { HeaderData } from "../free/header";
import type { FooterData } from "../free/footer";
import type { ThemeTokens } from "./theme-tokens";

/**
 * What a partner-site THEME is — the contract every theme folder fulfils (4 Oct 2026).
 *
 * The model is Shopify's and Salla's (`.claude/skills/partner-site-templates`): the theme is CODE,
 * the partner's content is DATA (`HomeData` — one contract every theme reads), and the partner's
 * choices are VALUES (colour, header/footer shape, hidden sections). A new theme is a new folder
 * that exports one `PartnerTheme`; nothing else in modonty or the console changes.
 * How-to: `shared/components/partner-site/THEMES.md`.
 */

/** Every page a partner site has. A theme must give each one a block list (empty = page unused). */
export type PartnerPageKey = "home" | "about" | "services" | "photos" | "reviews" | "articles" | "faq" | "contact" | "book" | "reels";

export const PARTNER_PAGE_KEYS: readonly PartnerPageKey[] = ["home", "about", "services", "photos", "reviews", "articles", "faq", "contact", "book", "reels"];

/** One header shape the partner can pick. */
export interface ThemeHeader {
  key: string;
  /** Arabic name the partner sees in «تصميم الموقع». */
  name: string;
  tier: "free" | "premium";
  Component: ComponentType<{ data: HeaderData; preview?: boolean }>;
}

/** One footer shape the partner can pick. */
export interface ThemeFooter {
  key: string;
  name: string;
  tier: "free" | "premium";
  Component: ComponentType<{ data: FooterData; preview?: boolean }>;
}

/**
 * A setting the theme exposes to the partner — the console builds its form from this list
 * (Shopify `settings_schema.json` / Salla `twilight.json` fields). Values are stored per partner;
 * a theme adding a setting later gets `default` for partners who never set it.
 */
export type ThemeSetting =
  | { key: string; type: "color"; label: string; default: string | null }
  | { key: string; type: "choice"; label: string; default: string; options: readonly { value: string; label: string }[] };

export interface PartnerTheme {
  /** Stable id, also the folder name (`free` → `shared/components/partner-site/free/`). */
  key: string;
  /** Arabic name for the catalog. */
  name: string;
  description: string;
  /** Semver. Bump on any visible change; the catalog shows it. */
  version: string;
  tier: "free" | "premium";
  /** Public path of a 1280×800 screenshot for the catalog card (optional until the catalog ships). */
  previewImage?: string;
  /** The look: radii and rhythm as CSS variables, so two themes differ in feel, not only in order. */
  tokens: ThemeTokens;
  /** Page → blocks in visitor order. */
  pages: Record<PartnerPageKey, readonly HomeBlock[]>;
  headers: readonly ThemeHeader[];
  footers: readonly ThemeFooter[];
  defaultHeader: string;
  defaultFooter: string;
  settings: readonly ThemeSetting[];
}

/** Re-exported so a theme folder needs one import for the data it renders. */
export type { HomeBlock, HomeData };
