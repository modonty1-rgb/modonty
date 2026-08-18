import type { ComponentType } from "react";

import { ClassicHeader } from "./classic-header";
import { CenteredHeader } from "./centered-header";
import { UtilityHeader } from "./utility-header";
import { TransparentHeader } from "./transparent-header";
import { PillHeader } from "./pill-header";
import type { HeaderData } from "./header-data";

export type { HeaderData, HeaderNavLink } from "./header-data";

/** The stored value on the client row (`headerTemplate`). New file → new key here. */
export type HeaderTemplateKey = "classic" | "centered" | "utility" | "transparent" | "pill";

export interface HeaderTemplate {
  key: HeaderTemplateKey;
  /** What the partner sees in the picker. */
  name: string;
  tier: "free";
  Component: ComponentType<{ data: HeaderData; preview?: boolean }>;
}

/**
 * The header registry — the ONE place a key becomes a component. The console lists it
 * (previews) and modonty selects from it (render). Adding a header = one file + one line.
 */
export const HEADER_TEMPLATES: readonly HeaderTemplate[] = [
  { key: "classic", name: "الأساسي", tier: "free", Component: ClassicHeader },
  { key: "centered", name: "المركزي", tier: "free", Component: CenteredHeader },
  { key: "utility", name: "شريط الخدمة", tier: "free", Component: UtilityHeader },
  { key: "transparent", name: "الداكن", tier: "free", Component: TransparentHeader },
  { key: "pill", name: "الكبسولة", tier: "free", Component: PillHeader },
] as const;

export const DEFAULT_HEADER_TEMPLATE: HeaderTemplateKey = "classic";

/** Unknown/retired key → the default, so a site never renders without a header. */
export function getHeaderTemplate(key: string | null | undefined): HeaderTemplate {
  return HEADER_TEMPLATES.find((t) => t.key === key) ?? HEADER_TEMPLATES[0];
}
