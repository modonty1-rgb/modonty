"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { MODONTY_KEY } from "@/app/(dashboard)/seo-images/helpers/load-groups";

/**
 * The ids the drafter should run over for one group — resolved on the SERVER.
 *
 * The browser must not decide this. It renders at most a page of a client's images,
 * and a list built from what happens to be on screen would quietly skip the rest —
 * the same silent-truncation bug that hid 370 production rows behind `take: 500`.
 *
 * Ownership is resolved the way `groupOf` resolves it in `load-groups.ts`: a LOGO or
 * HERO belongs to the client that points at it, a GALLERY to its own `clientId`, and
 * everything else (article and general images) falls into the مدوّنتي bucket. Grouping
 * by `clientId` alone would put a client's logo in the wrong pile.
 */
export async function getDraftTargets(
  groupKey: string,
): Promise<{ success: true; ids: string[] } | { success: false; error: string }> {
  const session = await auth();
  if (!session) return { success: false, error: "غير مصرّح" };
  if (!groupKey?.trim()) return { success: false, error: "المجموعة مفقودة" };

  // Only rows with NOTHING to derive a name from. `""` is included with the two absent
  // shapes: in Mongo a field never written is ABSENT and matches neither a value nor null.
  const emptyAlt = { OR: [{ altText: null }, { altText: { isSet: false } }, { altText: "" }] };

  const isModonty = groupKey === MODONTY_KEY;
  if (!isModonty && !/^[0-9a-fA-F]{24}$/.test(groupKey)) {
    return { success: false, error: "معرّف مجموعة غير صالح" };
  }

  const rows = await db.media.findMany({
    where: isModonty
      ? {
          // The bucket is everything NOT owned by a client through one of the three
          // relations above — mirrored from `groupOf`, not guessed from the type list.
          AND: [
            emptyAlt,
            { type: { notIn: ["GALLERY", "CLIENT_MINI"] } },
            { logoClients: { none: {} } },
            { heroImageClients: { none: {} } },
          ],
        }
      : {
          AND: [
            emptyAlt,
            {
              OR: [
                { clientId: groupKey, type: { in: ["GALLERY", "CLIENT_MINI"] } },
                { logoClients: { some: { id: groupKey } } },
                { heroImageClients: { some: { id: groupKey } } },
              ],
            },
          ],
        },
    select: { id: true },
    orderBy: { createdAt: "asc" },
    // A ceiling, not a display cap — and one the caller is told about, because a batch
    // that silently stops at N reports success while leaving work behind.
    take: 500,
  });

  return { success: true, ids: rows.map((r) => r.id) };
}
