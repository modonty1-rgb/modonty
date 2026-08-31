/**
 * The site's page keys and their labels — plain strings, zero component imports.
 * Kept apart from `page-blocks.ts` on purpose: that file pulls every block component in,
 * and a client component that only needs a label must not drag the whole site into its bundle.
 */
export const BLOCKS_PAGES = ["home", "about", "services", "photos", "faq", "contact", "articles", "book", "reviews"] as const;
export type BlocksPage = (typeof BLOCKS_PAGES)[number];

export function isBlocksPage(key: string | undefined): key is BlocksPage {
  return (BLOCKS_PAGES as readonly string[]).includes(key ?? "");
}

/** The partner's word for each page — the same labels his own menu uses. */
export const PAGE_LABELS: Record<BlocksPage, string> = {
  home: "الرئيسية",
  about: "من نحن",
  services: "خدماتنا",
  photos: "ألبوم أعمالنا",
  faq: "الأسئلة الشائعة",
  contact: "تواصل معنا",
  articles: "مقالاتي",
  book: "احجز",
  reviews: "آراء العملاء",
};
