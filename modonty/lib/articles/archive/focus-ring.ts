/**
 * The keyboard focus ring, written once.
 *
 * Four of this route's six components shipped without one (measured 2026-08-19) — a keyboard user
 * could tab through the whole archive and never see where they were. Kept as a constant rather
 * than repeated per component so it cannot drift again.
 */
export const FOCUS_RING = "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary";
