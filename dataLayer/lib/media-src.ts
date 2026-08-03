/**
 * Bunny dual-read resolver (INV-0). Pure, client+server safe (NO server-only).
 *
 * Every rendered image must resolve through this: prefer the migrated Bunny copy
 * (`bunnyUrl`), fall back to the original Cloudinary `url`. Any row not yet migrated
 * has `bunnyUrl == null` → automatically serves Cloudinary. Zero breakage during rollout.
 *
 * The switch (Epic 3.5) lives HERE — flip is centralized, not per call site.
 *
 * ── Why `bunnyUrl` is REQUIRED and not optional ──────────────────────────────────────
 * It used to be `bunnyUrl?`. That made every narrowed shape — `{ url: string }` — a valid
 * argument, so a Prisma select that forgot the field, a `.map()` that dropped it, or a prop
 * type that narrowed it away all compiled clean and silently served Cloudinary forever.
 * Four separate leak classes were traced to exactly this on 2026-07-30, including the LCP
 * hero on every article.
 *
 * Requiring the key (it may still be `null`) turns each of those into a compile error at the
 * call site, which is where the information actually is. If a caller genuinely has no Bunny
 * copy to offer, it must say so explicitly with `bunnyUrl: null` — a deliberate, reviewable
 * act instead of an invisible omission.
 */
export interface MediaSrcInput {
  url?: string | null;
  /** REQUIRED key (value may be null). See the note above — optional here hid real bugs. */
  bunnyUrl: string | null;
}

/** Resolve a Media-like object to its best image url (Bunny → Cloudinary), or null. */
export function mediaSrc(media: MediaSrcInput | null | undefined): string | null {
  if (!media) return null;
  return media.bunnyUrl ?? media.url ?? null;
}
