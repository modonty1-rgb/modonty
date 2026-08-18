/**
 * Everything a header template needs — plain data, no DB types. modonty fills it from
 * the client row; the console fills it from the same row for the preview. Same object,
 * same component, same pixels.
 */
export interface HeaderNavLink {
  href: string;
  label: string;
}

export interface HeaderData {
  name: string;
  tagline: string | null;
  logoUrl: string | null;
  /** Where the logo/name link to (the site's home). Omit in previews. */
  homeHref?: string;
  phone: string | null;
  email: string | null;
  /** `https://wa.me/…` — omit in previews (button renders inert). */
  whatsappHref?: string | null;
  /** Nav links in visitor order; the first is the current page in previews. */
  links: HeaderNavLink[];
  /** Palette hex or null → modonty's primary. */
  primaryColor: string | null;
}
