export interface PageConfig {
  slug: string;
  label: string;
  description: string;
  modontyPath: string;
}

export const GENERATE_MJ_SLUG = "generate-mj";

export const PAGE_CONFIGS: PageConfig[] = [
  {
    slug: "about",
    label: "صفحة من نحن",
    description: "About page content",
    modontyPath: "/about",
  },
  {
    slug: "user-agreement",
    label: "اتفاقية المستخدم",
    description: "User agreement terms",
    modontyPath: "/legal/user-agreement",
  },
  {
    slug: "privacy-policy",
    label: "سياسة الخصوصية",
    description: "Privacy policy content",
    modontyPath: "/legal/privacy-policy",
  },
  {
    slug: "cookie-policy",
    label: "سياسة ملفات تعريف الارتباط",
    description: "Cookie policy content",
    modontyPath: "/legal/cookie-policy",
  },
  {
    slug: "copyright-policy",
    label: "سياسة حقوق النشر",
    description: "Copyright policy content",
    modontyPath: "/legal/copyright-policy",
  },
  {
    slug: GENERATE_MJ_SLUG,
    label: "Generate M/J (Home & list)",
    description: "Generate meta & JSON-LD for home, clients, categories, trending",
    modontyPath: "/",
  },
];

export function getPageConfig(slug: string): PageConfig | undefined {
  return PAGE_CONFIGS.find((config) => config.slug === slug);
}

export function getDefaultPageConfig(): PageConfig {
  return PAGE_CONFIGS[0];
}
