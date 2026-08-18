/** Everything a footer template needs — plain data, filled from the client row by whoever renders it. */
export interface FooterLink {
  href: string;
  label: string;
}

export interface FooterData {
  name: string;
  tagline: string | null;
  logoUrl: string | null;
  homeHref?: string;
  description: string | null;
  phone: string | null;
  email: string | null;
  /** «الشارع، المدينة» — one line. */
  address: string | null;
  whatsappHref?: string | null;
  /** Service titles → the «خدماتنا» column (empty list = no column). */
  services: FooterLink[];
  /** Site pages → the «الصفحات» column. */
  pages: FooterLink[];
  /** `Client.sameAs` — brand icons. */
  socialLinks: string[];
  registrationNumber: string | null;
  privacyHref?: string;
  /** Copyright year, supplied by the caller: on modonty it comes from a cached helper (Next forbids `new Date()` in a prerendered server component). */
  year: string;
  primaryColor: string | null;
}
