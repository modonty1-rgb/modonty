import type { CommercialPlanTheme } from "@prisma/client";

/**
 * Colors stay in code, never in the admin — see PAY-Q11. jbrseo's `PLAN_STYLES`
 * keyed styling by plan name/slug, so every new plan fell through to `default`
 * with no identity. Here identity is a themed enum value the admin picks from
 * a fixed list, so a new plan always renders correctly.
 */
export const COMMERCIAL_PLAN_THEMES: Record<CommercialPlanTheme, {
  label: string;
  swatch: string;
  border: string;
  background: string;
  badge: string;
  button: string;
}> = {
  // Swatches must read at ≥ 3:1 against the select's surface (WCAG 1.4.11): `bg-secondary`
  // and `bg-accent` are near-surface grays in both themes and vanished in the dropdown.
  NEUTRAL: {
    label: "محايد",
    swatch: "bg-muted-foreground",
    border: "border-border",
    background: "bg-card",
    badge: "bg-secondary text-secondary-foreground",
    button: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
  },
  PRIMARY: {
    label: "أساسي",
    swatch: "bg-primary",
    border: "border-primary/40",
    background: "bg-primary/5",
    badge: "bg-primary text-primary-foreground",
    button: "bg-primary text-primary-foreground hover:bg-primary/90",
  },
  ACCENT: {
    label: "مميَّز",
    swatch: "bg-chart-2",
    border: "border-chart-2/50",
    background: "bg-chart-2/10",
    badge: "bg-chart-2 text-background",
    button: "bg-chart-2 text-background hover:bg-chart-2/90",
  },
  PREMIUM: {
    label: "بريميوم",
    swatch: "bg-chart-4",
    border: "border-chart-4/50",
    background: "bg-chart-4/10",
    badge: "bg-chart-4 text-background",
    button: "bg-chart-4 text-background hover:bg-chart-4/90",
  },
};
