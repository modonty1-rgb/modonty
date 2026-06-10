"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { buildConsoleAccessUrl } from "@/lib/console-access";

/**
 * Mint a short-lived, signed handoff ticket so an admin can open the client's
 * console AS the client (to edit data on their behalf) — no password, no
 * decryption. Admin-only; the client's id is signed so a tampered link fails.
 */
export async function openClientConsoleAction(
  clientId: string,
): Promise<{ url: string } | { error: string }> {
  // 1. ADMIN-only — impersonating a client is a privileged power. The session
  // doesn't carry the role, so fetch it and fail closed (reject EDITOR/CLIENT,
  // missing user, or any lookup error).
  const session = await auth();
  if (!session?.user) {
    return { error: "Not authorized." };
  }
  const userId = (session.user as { id?: string }).id;
  const me = userId
    ? await db.user.findUnique({ where: { id: userId }, select: { role: true } }).catch(() => null)
    : null;
  if (me?.role !== "ADMIN") {
    return { error: "Admins only — you don't have permission to open a client console." };
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
    admin: session.user.email ?? session.user.name ?? "unknown",
    clientId: client.id,
    clientName: client.name,
    at: new Date().toISOString(),
  });

  return { url };
}
