/**
 * The 8 colours a partner may pick as `themeSettings.primaryColor` — no free hex
 * field, so the site can never end up unreadable (Khalid's rule «الشريك ليس تقنياً»,
 * decision ٢: one colour, from the partner's identity, contrast guaranteed).
 *
 * Every value passes WCAG 2.x AA (≥ 4.5:1) both as a filled button under white text and
 * as text on a white ground — measured 2026-08-17 with the WCAG relative-luminance
 * formula (teal 5.47 · blue 6.70 · indigo 7.90 · purple 6.98 · rose 6.29 · orange 5.18 ·
 * emerald 5.48 · slate 10.35). On a dark ground the accent as TEXT only reaches ~2–3.8,
 * so the renderer must lighten it for dark mode (large text / borders only) — a
 * renderer concern, not a data one.
 */
export interface PartnerSitePaletteColor {
  /** Stored value — always the hex, so a saved colour survives palette renames. */
  hex: string;
  /** What the partner sees in the picker. */
  label: string;
}

export const PARTNER_SITE_PALETTE: readonly PartnerSitePaletteColor[] = [
  { hex: "#0F766E", label: "أخضر مزرقّ" },
  { hex: "#1D4ED8", label: "أزرق" },
  { hex: "#4338CA", label: "نيلي" },
  { hex: "#7E22CE", label: "بنفسجي" },
  { hex: "#BE123C", label: "أحمر وردي" },
  { hex: "#C2410C", label: "برتقالي" },
  { hex: "#047857", label: "أخضر" },
  { hex: "#334155", label: "رمادي داكن" },
] as const;

export const PARTNER_SITE_PALETTE_HEXES = PARTNER_SITE_PALETTE.map((c) => c.hex);
