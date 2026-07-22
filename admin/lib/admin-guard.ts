import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

/**
 * Authoritative ADMIN gate. The session JWT does NOT carry the role, so we read
 * it fresh from the DB — this reflects role changes immediately and, critically,
 * locks out any already-issued session of a non-admin (their 30-day token stays
 * valid until it expires; this gate rejects them on their next request).
 */
type AdminGate =
  | { status: "ok"; userId: string }
  | { status: "unauthenticated" }
  | { status: "forbidden" };

export async function checkAdmin(): Promise<AdminGate> {
  const session = await auth().catch(() => null);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) return { status: "unauthenticated" };

  // Authoritative role from `staff` — the admin panel's only identity table.
  const staffRow = await db.staff
    .findUnique({ where: { id: userId }, select: { role: true } })
    .catch(() => null);
  if (staffRow?.role !== "ADMIN") return { status: "forbidden" };

  return { status: "ok", userId };
}

/**
 * Server-action guard. Returns the admin's `userId`, or a typed `error` the
 * action returns to the client. Use at the top of every privileged action:
 *   const gate = await requireAdmin();
 *   if ("error" in gate) return gate;
 */
export async function requireAdmin(): Promise<{ userId: string } | { error: string }> {
  const g = await checkAdmin();
  if (g.status === "ok") return { userId: g.userId };
  return {
    error:
      g.status === "unauthenticated"
        ? "Not authenticated."
        : "Admins only — you don't have permission to do this.",
  };
}
