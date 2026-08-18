import type { ComponentType } from "react";

import { ColumnsFooter } from "./columns-footer";
import { SimpleFooter } from "./simple-footer";
import { BrandFooter } from "./brand-footer";
import { CenteredFooter } from "./centered-footer";
import type { FooterData } from "./footer-data";

export type { FooterData, FooterLink } from "./footer-data";

/** The stored value on the client row (`footerTemplate`). New file → new key here. */
export type FooterTemplateKey = "columns" | "simple" | "brand" | "centered";

export interface FooterTemplate {
  key: FooterTemplateKey;
  name: string;
  tier: "free";
  Component: ComponentType<{ data: FooterData; preview?: boolean }>;
}

/** The footer registry — one place a key becomes a component; console lists, modonty selects. */
export const FOOTER_TEMPLATES: readonly FooterTemplate[] = [
  { key: "columns", name: "الأعمدة", tier: "free", Component: ColumnsFooter },
  { key: "simple", name: "المختصر", tier: "free", Component: SimpleFooter },
  { key: "brand", name: "بلوك الهوية", tier: "free", Component: BrandFooter },
  { key: "centered", name: "المركزي", tier: "free", Component: CenteredFooter },
] as const;

export const DEFAULT_FOOTER_TEMPLATE: FooterTemplateKey = "columns";

export function getFooterTemplate(key: string | null | undefined): FooterTemplate {
  return FOOTER_TEMPLATES.find((t) => t.key === key) ?? FOOTER_TEMPLATES[0];
}
