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
  // Paused 28 Sep 2026 (Khalid: «وقف الاوبشن تبع الصحة والجمال مؤقت لحد ما نشوف حل»): its data
  // lives on open.data.gov.sa, which answers only from inside Saudi Arabia — Vercel (iad1) gets
  // «fetch failed». The page shows «قريباً», stays out of the sitemap; the admin keeps its screen.
  { slug: "health", label: "الصحة والجمال", adminLabel: "Health", paused: true },
] as const;

export type LiveSectorSlug = (typeof LIVE_SECTORS)[number]["slug"];

/** A sector whose page is built but switched off for now — «قريباً» on the site, still in the admin. */
export const isSectorPaused = (slug: LiveSectorSlug) => LIVE_SECTORS.some((s) => s.slug === slug && "paused" in s && s.paused);

/** How many picks a sector page shows in its «من مدونتي» card. The admin refuses one more. */
export const SECTOR_PICK_LIMIT = 4;
