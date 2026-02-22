"use server";

import { auth } from "@/lib/auth";
import {
  computeLeadScoresForClient,
  upsertLeadScoring,
} from "@/lib/lead-scoring/compute";

export type RefreshLeadScoresResult =
  | { ok: true; processed: number }
  | { ok: false; error: string };

export async function refreshLeadScores(): Promise<RefreshLeadScoresResult> {
  const session = await auth();
  const clientId = (session as { clientId?: string })?.clientId;

  if (!session || !clientId) {
    return { ok: false, error: "Unauthorized or missing client" };
  }

  try {
    const payloads = await computeLeadScoresForClient(clientId);
    const processed = await upsertLeadScoring(payloads);
    return { ok: true, processed };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return { ok: false, error: message };
  }
}
