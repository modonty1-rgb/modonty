export interface PageConfig {
  slug: string;
  label: string;
  description: string;
  modontyPath: string;
}

export const PAGE_CONFIGS: PageConfig[] = [
  {
    slug: "about",
    label: "About",
    description: "About page content",
    modontyPath: "/about",
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
];

export function getPageConfig(slug: string): PageConfig | undefined {
  return PAGE_CONFIGS.find((config) => config.slug === slug);
}

export function getDefaultPageConfig(): PageConfig {
  return PAGE_CONFIGS[0];
}
