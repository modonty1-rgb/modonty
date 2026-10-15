/**
 * The ONE rule for "does this client have channel X" — shared by the server count
 * (segments.ts → getClientContactGaps, feeds the dashboard card) and the client table
 * (contact-channels-table.tsx). Plain data in, plain booleans out, so both sides can
 * import it without caring whether they run on the server or in the browser.
 *
 * Built 15 Oct 2026 (Khalid: "المفروض تكون في الكي بي آي واضحة ونفسها تظهر في الداشبورد")
 * — the table's KPIs and the dashboard's card used to compute "reach" two different
 * ways (one ctaMode-only, one per-channel) and could silently disagree.
 */
export interface ContactChannelFields {
  phone: string | null;
  email: string | null;
  url: string | null;
  sameAs: string[];
  ctaMode: string;
  ctaUrl: string | null;
}

export interface ContactChannelFlags {
  hasPhone: boolean;
  hasEmail: boolean;
  hasWebsite: boolean;
  hasSocial: boolean;
  /** FORM always counts; LINK only counts once it actually has a destination. */
  hasButton: boolean;
}

export function contactChannelFlags(c: ContactChannelFields): ContactChannelFlags {
  return {
    hasPhone: !!c.phone,
    hasEmail: !!c.email,
    hasWebsite: !!c.url,
    hasSocial: c.sameAs.length > 0,
    hasButton: c.ctaMode === "FORM" || (c.ctaMode === "LINK" && !!c.ctaUrl),
  };
}
