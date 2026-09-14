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
}> = {
  // Swatches must read at ≥ 3:1 against the select's surface (WCAG 1.4.11): `bg-secondary`
  // and `bg-accent` are near-surface grays in both themes and vanished in the dropdown.
  NEUTRAL: {
    label: "محايد",
    swatch: "bg-muted-foreground",
    border: "border-border",
    background: "bg-card",
    badge: "bg-secondary text-secondary-foreground",
  },
  // ⚠ الخلفية تُركَّب فوق `bg-card` لا فوق خلفية الصفحة.
  // قيس (١٤ سبتمبر ٢٠٢٦ على /sa داكناً): `bg-primary/5` وحدها = rgb(25,25,37) على صفحةٍ
  // rgb(21,21,25) — أي أن البطاقة **أغمق** من سطح البطاقة القياسي rgb(31,31,35)، فتُقرأ
  // حفرةً لا بطاقة. في الفاتح لا يظهر العطل لأن الشفّاف فوق الأبيض يبقى أبيضَ ملوّناً.
  // فالسطح أوّلاً ثم اللمسة فوقه: `bg-card` لوناً، واللمسة صورةً متدرّجة بلونٍ واحد.
  PRIMARY: {
    label: "أساسي",
    swatch: "bg-primary",
    border: "border-primary/40",
    background: "bg-card [background-image:linear-gradient(hsl(var(--primary)/0.07),hsl(var(--primary)/0.07))]",
    badge: "bg-primary text-primary-foreground",
  },
  ACCENT: {
    label: "مميَّز",
    swatch: "bg-chart-2",
    border: "border-chart-2/50",
    background: "bg-card [background-image:linear-gradient(hsl(var(--chart-2)/0.07),hsl(var(--chart-2)/0.07))]",
    badge: "bg-chart-2 text-background",
  },
  PREMIUM: {
    label: "بريميوم",
    swatch: "bg-chart-4",
    border: "border-chart-4/50",
    background: "bg-card [background-image:linear-gradient(hsl(var(--chart-4)/0.07),hsl(var(--chart-4)/0.07))]",
    badge: "bg-chart-4 text-background",
  },
};
