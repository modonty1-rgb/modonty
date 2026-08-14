"use server";

import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-guard";

/**
 * Modonty Core key (T2). `Settings.coreClientId` marks the Client row that IS the platform.
 * Set from /settings/system only — never a script. Read everywhere through
 * `@modonty/shared/lib/core-client`.
 */

export interface CoreClientOption {
  id: string;
  name: string;
  slug: string;
}

export async function getCoreClientState(): Promise<
  { current: string | null; options: CoreClientOption[] } | { error: string }
> {
  const gate = await requireAdmin();
  if ("error" in gate) return { error: gate.error };

  const [settings, clients] = await Promise.all([
    db.settings.findFirst({ select: { coreClientId: true } }),
    db.client.findMany({ select: { id: true, name: true, slug: true }, orderBy: { name: "asc" } }),
  ]);
  return { current: settings?.coreClientId ?? null, options: clients };
}

export async function saveCoreClientId(
  id: string,
): Promise<{ success: true } | { error: string }> {
  const gate = await requireAdmin();
  if ("error" in gate) return { error: gate.error };

  // Must be a real client — a dangling id would silently disable every core check.
  const client = await db.client.findUnique({ where: { id }, select: { id: true, name: true } });
  if (!client) return { error: "Client not found" };

  const settings = await db.settings.findFirst({ select: { id: true } });
  if (!settings) return { error: "Settings row missing" };

  await db.settings.update({ where: { id: settings.id }, data: { coreClientId: id } });
  revalidatePath("/settings/system");
  return { success: true };
}
