/**
 * Pages that live under another section's door, not their own. The nav rings (desktop header
 * and the phone's bottom bar) always centre ONE section, so a page with no tab of its own must
 * say which section it belongs to — otherwise each ring fell back to its first slot and the
 * desktop lit «الرئيسية» on `/quran` (measured 26 Sep 2026).
 *
 * `/quran` is opened from the sector tiles on `/modonty`, so it belongs to مدونتي.
 */
const SECTION_OF: Record<string, string> = {
  "/quran": "/modonty",
  "/modo-link": "/modonty",
};

/** The path whose section the nav should mark as current — the page's own, or its parent's. */
export function getNavSectionPath(pathname: string): string {
  for (const [prefix, section] of Object.entries(SECTION_OF)) {
    if (pathname === prefix || pathname.startsWith(`${prefix}/`)) return section;
  }
  return pathname;
}
