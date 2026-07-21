"use server";

import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-guard";
import { buildConsoleAccessUrl } from "@/lib/console-access";

/**
 * Mint a short-lived, signed handoff ticket so an admin can open the client's
 * console AS the client (to edit data on their behalf) — no password, no
 * decryption. Admin-only; the client's id is signed so a tampered link fails.
 */
export async function openClientConsoleAction(
  clientId: string,
): Promise<{ url: string } | { error: string }> {
  // 1. ADMIN-only — impersonating a client is a privileged power. Shared guard
  // reads the role fresh from the DB and fails closed (EDITOR/CLIENT, missing
  // user, or any lookup error all reject).
  const gate = await requireAdmin();
  if ("error" in gate) {
    return { error: gate.error };
  }

  // 2. Client must exist.
  const client = await db.client.findUnique({
    where: { id: clientId },
    select: { id: true, name: true },
  });
  if (!client) {
    return { error: "Client not found." };
  }

  // 3. Sign the 60s ticket + build the console handoff URL.
  const url = buildConsoleAccessUrl(client.id);

  // 4. Audit (v1: log — a permanent audit trail is the hardening follow-up).
  console.log("[admin-console-access]", {
    adminId: gate.userId,
    clientId: client.id,
    clientName: client.name,
    at: new Date().toISOString(),
  });

  return { url };
}
