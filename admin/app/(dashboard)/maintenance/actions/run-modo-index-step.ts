"use server";

import { requireAdmin } from "@/lib/admin-guard";
import { callModoReindex, type ModoReindexResult } from "@/lib/modo/call-modo-reindex";

/**
 * One step of the Modo backlog from the maintenance card — a few articles per call, so the
 * card can draw progress and wait out the embedding vendor's per-minute limit between steps.
 */
export async function runModoIndexStep(): Promise<ModoReindexResult> {
  const gate = await requireAdmin();
  if ("error" in gate) return { ok: false, error: gate.error };
  return callModoReindex({ limit: 5 });
}
