import type { Prisma } from "@prisma/client";

/**
 * Sections served by modonty's proxy.ts 308 layer (must match its matcher).
 * A redirect is one permanent hop: (section, fromSlug) → toSlug, both in the same section.
 */
export type RedirectSection = "articles" | "categories" | "tags" | "industries" | "clients";

/** Minimal surface both `db` and an interactive-transaction client satisfy. */
type RedirectDb = Pick<Prisma.TransactionClient, "redirect">;

/**
 * Record a permanent (308) redirect after a merge/rename so modonty's proxy sends the
 * old slug to its successor (Google treats 308 ≡ 301 → link equity passes).
 *
 * Two invariants enforced here:
 *   1. No self-redirect — fromSlug === toSlug is a no-op (would loop).
 *   2. No redirect chains — any existing redirect that pointed AT `fromSlug` is
 *      repointed to `toSlug`, collapsing old→source→target into old→target
 *      (Google follows one hop reliably; chains dilute/《drop》equity).
 *
 * Idempotent via the (section, fromSlug) unique key: re-running upserts, never duplicates.
 * Pass a transaction client (`tx`) to make the redirect part of the same atomic merge.
 */
export async function recordRedirect(
  db: RedirectDb,
  section: RedirectSection,
  fromSlug: string,
  toSlug: string,
): Promise<void> {
  const from = fromSlug.trim();
  const to = toSlug.trim();
  if (!from || !to || from === to) return; // never write a self-redirect

  // Collapse chains: whatever used to land on `from` now lands on `to` directly.
  await db.redirect.updateMany({
    where: { section, toSlug: from },
    data: { toSlug: to },
  });

  // Upsert the source → target hop (idempotent on the unique key).
  await db.redirect.upsert({
    where: { section_fromSlug: { section, fromSlug: from } },
    update: { toSlug: to },
    create: { section, fromSlug: from, toSlug: to },
  });
}
