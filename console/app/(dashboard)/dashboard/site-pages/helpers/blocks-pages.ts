/** Site pages that have a block list today (server-safe: plain strings only). */
export const BLOCKS_PAGES = ["home", "about", "services", "photos", "faq", "contact", "articles", "book", "reviews"] as const;
export type BlocksPage = (typeof BLOCKS_PAGES)[number];

export function isBlocksPage(key: string): key is BlocksPage {
  return (BLOCKS_PAGES as readonly string[]).includes(key);
}
