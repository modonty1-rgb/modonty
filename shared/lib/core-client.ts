import "server-only";

import { db } from "./db";

/**
 * Modonty Core key (T2, 2026-07-31).
 *
 * Modonty itself is a Client row; `Settings.coreClientId` points at it. This is THE single
 * switch every "is this Modonty?" question goes through — media ownership, picker scoping,
 * partner-list exclusion, featured article cards. Read it from here, never re-query Settings
 * ad-hoc and never hardcode the id.
 *
 * The value is set from the admin UI (/settings/system), never by a script.
 */

/** The Client id that IS the platform, or null if not configured yet. */
export async function getCoreClientId(): Promise<string | null> {
  const settings = await db.settings.findFirst({ select: { coreClientId: true } });
  return settings?.coreClientId ?? null;
}

/** True when `id` is the Modonty core client. Null/undefined ids are never core. */
export async function isCoreClient(id: string | null | undefined): Promise<boolean> {
  if (!id) return false;
  const coreId = await getCoreClientId();
  return coreId !== null && coreId === id;
}
