import type { PartnerTheme } from "../theme/theme-contract";
import { freeTheme } from "../free/theme";
import { CREATIVE_HOME_BLOCKS } from "./home";

/**
 * «إبداعي» — the second theme, and the worked example of THEMES.md §3 (4 Oct 2026): it reuses
 * every section of the free theme and changes the LOOK (softer, larger radii · more air between
 * sections), the HOME page (split cover · proof first) and the default header/footer. Inner pages
 * keep the free theme's lists. Free tier while premium checkout does not exist.
 */
export const creativeTheme: PartnerTheme = {
  ...freeTheme,
  key: "creative",
  name: "إبداعي",
  description: "غلاف مقسوم بصورة كبيرة، زوايا ناعمة، ومساحات أوسع — يبدأ بالأرقام والخدمات.",
  version: "1.0.0",
  tier: "free",
  tokens: {
    radiusCard: "1.25rem",
    radiusControl: "0.875rem",
    sectionY: "3.5rem",
    sectionYDesktop: "6rem",
  },
  pages: { ...freeTheme.pages, home: CREATIVE_HOME_BLOCKS },
  defaultHeader: "pill",
  defaultFooter: "brand",
  settings: freeTheme.settings.map((s) =>
    s.key === "headerTemplate" ? { ...s, default: "pill" } : s.key === "footerTemplate" ? { ...s, default: "brand" } : s,
  ),
};
