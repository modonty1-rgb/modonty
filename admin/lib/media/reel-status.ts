/**
 * Reel status as the card says it. All of a client's reels show here, whatever their state
 * (Khalid, 26 Sep 2026): whoever looks after the client sees a reel still waiting for a
 * decision without opening the Reels section.
 */
export const REEL_STATUS: Record<string, { label: string; tone: "ok" | "warn" | "bad" | "muted" }> = {
  DRAFT: { label: "Draft", tone: "muted" },
  PENDING_APPROVAL: { label: "Pending approval", tone: "warn" },
  APPROVED: { label: "Approved", tone: "ok" },
  PUBLISHED: { label: "Published", tone: "ok" },
  REJECTED: { label: "Rejected", tone: "bad" },
  ARCHIVED: { label: "Archived", tone: "muted" },
};

/** Reel status → the Reels page that lists it (the reels section has no per-reel page). */
export const REEL_VIEW: Record<string, string> = {
  PENDING_APPROVAL: "pending",
  PUBLISHED: "published",
  REJECTED: "rejected",
  ARCHIVED: "archived",
};
