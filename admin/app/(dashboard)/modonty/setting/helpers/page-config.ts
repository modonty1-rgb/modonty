export interface PageConfig {
  slug: string;
  label: string;
  description: string;
  modontyPath: string;
  /**
   * The page's body is built in code, so only its SEO is editable here. Set it and the
   * content editor is hidden — a rich-text box whose output nothing renders is worse than
   * no box: it invites the team to write something that silently goes nowhere.
   */
  seoOnly?: boolean;
}

export const PAGE_CONFIGS: PageConfig[] = [
  {
    slug: "about",
    label: "About",
    description: "About page content",
    modontyPath: "/about",
  },
  {
    // Contact carries the phone, email and address a visitor acts on — the details most
    // likely to change and the ones a deploy should never gate. It was the last modonty
    // page still hardcoded (PG3, 2026-08-14).
    slug: "contact",
    label: "Contact",
    description: "Contact page content",
    modontyPath: "/contact",
  },
  {
    slug: "terms",
    label: "Terms of Service",
    description: "Terms of service content",
    modontyPath: "/terms",
  },
  {
    slug: "user-agreement",
    label: "User Agreement",
    description: "User agreement terms",
    modontyPath: "/legal/user-agreement",
  },
  {
    slug: "privacy-policy",
    label: "Privacy Policy",
    description: "Privacy policy content",
    modontyPath: "/legal/privacy-policy",
  },
  {
    slug: "cookie-policy",
    label: "Cookie Policy",
    description: "Cookie policy content",
    modontyPath: "/legal/cookie-policy",
  },
  {
    slug: "copyright-policy",
    label: "Copyright Policy",
    description: "Copyright policy content",
    modontyPath: "/legal/copyright-policy",
  },
  {
    // Trust and Story are indexed pages whose title and description were the last two still
    // written in code — changing a word meant a deploy (SOT3, 2026-08-15). Their bodies stay
    // in code: Trust renders the certificate, facts table and map; Story is an audio player.
    slug: "trust",
    label: "Trust",
    description: "Trust page SEO (page body is built in code)",
    modontyPath: "/trust",
    seoOnly: true,
  },
  {
    slug: "story",
    label: "Story",
    description: "Story page SEO (page body is built in code)",
    modontyPath: "/story",
    seoOnly: true,
  },
];

export function getPageConfig(slug: string): PageConfig | undefined {
  return PAGE_CONFIGS.find((config) => config.slug === slug);
}

export function getDefaultPageConfig(): PageConfig {
  return PAGE_CONFIGS[0];
}
