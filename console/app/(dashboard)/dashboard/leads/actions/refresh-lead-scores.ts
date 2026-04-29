"use server";

import { auth } from "@/lib/auth";
import {
  computeLeadScoresForClient,
  refreshLeadScoring,
  type RefreshResult,
} from "@/lib/lead-scoring/compute";
import { messages } from "@/lib/messages";
import { revalidatePath } from "next/cache";

export type RefreshLeadScoresResult =
  | { ok: true; result: RefreshResult; refreshedAt: string }
  | { ok: false; error: string };

export async function refreshLeadScores(): Promise<RefreshLeadScoresResult> {
  const session = await auth();
  const clientId = (session as { clientId?: string })?.clientId;
  if (!session || !clientId) {
    return { ok: false, error: messages.error.unauthorized };
  }

  try {
    const payloads = await computeLeadScoresForClient(clientId);
    const result = await refreshLeadScoring(clientId, payloads);
    revalidatePath("/dashboard/leads");
    return { ok: true, result, refreshedAt: new Date().toISOString() };
  } catch {
    return { ok: false, error: messages.error.serverError };
  }
}
