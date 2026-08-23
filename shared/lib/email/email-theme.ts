/**
 * The ONE place the email look lives — the three apps used to carry three diverging copies
 * of these values (admin / console / modonty `base.ts`). Plain constants, no `server-only`,
 * so a template can import them from anywhere.
 */
export const EMAIL_COLORS = {
  navy: "#0E065A",
  blue: "#3030FF",
  teal: "#00D8D8",
  gray: "#5b5b5b",
  lightGray: "#f5f5f5",
  border: "#dbdbdb",
  text: "#333333",
} as const;

/** Arabic brand name as it is written in every email — same spelling everywhere. */
export const EMAIL_BRAND_AR = "مُدَوَّنَتِي";

/**
 * Always the public site, never the sending app's own host: an email from the admin or
 * the console still sends the reader to modonty.com (the console/admin URLs are not for
 * readers). Hardcoded on purpose — `NEXT_PUBLIC_SITE_URL` differs per app.
 */
export const EMAIL_SITE_URL = "https://www.modonty.com";

export const EMAIL_CONTACT_ADDRESS = "modonty@modonty.com";

/**
 * Legal registry FALLBACK — used only when Settings has no CR + unified number yet.
 * The live values come from `getLegalFooterHtml()` (Settings.org*), the same source /trust
 * shows, so an email can never state a different registry than the site.
 */
export const EMAIL_LEGAL_FALLBACK_HTML =
  "شركة جبر الجنوبية &nbsp;·&nbsp; السجل التجاري 4030524305 &nbsp;·&nbsp; الرقم الوطني الموحّد 7036024383<br/>" +
  "جدة — حي الشرفية — شارع أبو بكر الصديق &nbsp;·&nbsp; رأس المال 8,000,000 ﷼";
