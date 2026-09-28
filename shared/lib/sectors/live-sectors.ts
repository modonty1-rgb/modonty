/**
 * Sector pages that are live on modonty — each has its own route under `/modonty/<slug>`.
 *
 * Two readers, one list: modonty's `[sector]` placeholder skips these (their own folder serves
 * them), and the admin's sector-picks screen shows one tab per entry. Adding a sector page means
 * one line here, not two edits that can drift.
 */
export const LIVE_SECTORS = [
  { slug: "football", label: "الكورة", adminLabel: "Football" },
  { slug: "ai", label: "الذكاء الاصطناعي", adminLabel: "AI" },
  { slug: "entrepreneurship", label: "ريادة الأعمال", adminLabel: "Entrepreneurship" },
  { slug: "education", label: "التعليم", adminLabel: "Education" },
] as const;

export type LiveSectorSlug = (typeof LIVE_SECTORS)[number]["slug"];

/** How many picks a sector page shows in its «من مدونتي» card. The admin refuses one more. */
export const SECTOR_PICK_LIMIT = 4;
