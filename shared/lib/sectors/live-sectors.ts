/**
 * Sector pages that are live on modonty — each has its own route under `/modonty/<slug>`.
 *
 * Read by modonty's sitemap and by the admin, which gives each entry its sector screen and sidebar
 * item. Adding a sector page means one line here plus its own folder in modonty.
 */
export const LIVE_SECTORS = [
  { slug: "football", label: "الكورة", adminLabel: "Football" },
  { slug: "ai", label: "الذكاء الاصطناعي", adminLabel: "AI" },
  { slug: "entrepreneurship", label: "ريادة الأعمال", adminLabel: "Entrepreneurship" },
  { slug: "education", label: "التعليم", adminLabel: "Education" },
  { slug: "entertainment", label: "الترفيه", adminLabel: "Entertainment" },
  { slug: "health", label: "الصحة والجمال", adminLabel: "Health" },
] as const;

export type LiveSectorSlug = (typeof LIVE_SECTORS)[number]["slug"];

/** How many picks a sector page shows in its «من مدونتي» card. The admin refuses one more. */
export const SECTOR_PICK_LIMIT = 4;
