/**
 * Resolves which of the 3 client-page states to render (mockup BUILD 9):
 *  - "not-ready": active account but nothing substantive yet → قيد التجهيز panel + noindex.
 *  - "sparse":    new partner, minimal content → basics only, optional sections auto-hide, zero stats suppressed.
 *  - "strong":    rich profile → all sections.
 * Pure function (Server). The shell passes the resolved state down to hero + sections.
 */
export type ClientPageState = "strong" | "sparse" | "not-ready";

export interface ClientPageStateSignals {
  aboutText?: string | null;
  servicesCount: number;
  articlesCount: number;
  teamCount: number;
  achievementsCount: number;
  galleryCount: number;
  hasContact: boolean;
}

export function resolveClientPageState(s: ClientPageStateSignals): ClientPageState {
  const hasAbout = !!s.aboutText?.trim();
  const substantive = hasAbout || s.servicesCount > 0 || s.articlesCount > 0;
  if (!substantive) return "not-ready";

  // Count the meaningful "richness" signals — a real working page has several.
  const richSignals = [
    s.servicesCount > 0,
    s.articlesCount >= 3,
    s.teamCount > 0,
    s.achievementsCount > 0,
    s.galleryCount > 0,
    hasAbout,
  ].filter(Boolean).length;

  return richSignals <= 1 ? "sparse" : "strong";
}
