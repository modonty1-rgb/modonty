import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

/**
 * Authoritative access gate for the panel. Checked fresh from the DB (not the JWT)
 * so a change takes effect on the next request — a deactivated staff member holding
 * a still-valid token is rejected at once.
 *
 * Access is by EMPLOYMENT STATUS, not role: any active staff member (Admin, Editor,
 * Creative, Social, QC, Sales) can open the panel. Per-role PERMISSIONS — who can see
 * or do what inside — are a separate layer not built yet; until then every role has the
 * same access (Sales is the one exception already scoped: it only sees its own clients
 * on the accounts surface, see clients/helpers/sales-scope.ts).
 */
type AdminGate =
  | { status: "ok"; userId: string }
  | { status: "unauthenticated" }
  | { status: "forbidden" };

export async function checkAdmin(): Promise<AdminGate> {
  const session = await auth().catch(() => null);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) return { status: "unauthenticated" };

  // Authoritative employment status from `staff`. Inactive = no access, any role = access.
  const staffRow = await db.staff
    .findUnique({ where: { id: userId }, select: { isActive: true } })
    .catch(() => null);
  if (!staffRow || staffRow.isActive === false) return { status: "forbidden" };

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
