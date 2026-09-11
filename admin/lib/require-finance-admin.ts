import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

/**
 * Money-moving actions are restricted to active ADMIN staff — not any active staff
 * member like `checkAdmin` (admin-guard.ts) allows for the panel at large. Shared by
 * commercial-plans/commercial-features (pricing) and orders (confirming a transfer,
 * PAY-Q12) — both write numbers a client is billed on.
 *
 * Same shape as admin-guard.ts: a status a page can render around, and a throwing
 * wrapper a server action can call unconditionally at its top.
 */
type FinanceAdminGate = { status: "ok" } | { status: "unauthenticated" } | { status: "forbidden" };

export async function checkFinanceAdmin(): Promise<FinanceAdminGate> {
  const session = await auth().catch(() => null);
  const id = (session?.user as { id?: string } | undefined)?.id;
  if (!id) return { status: "unauthenticated" };
  const staff = await db.staff.findUnique({ where: { id }, select: { role: true, isActive: true } });
  if (!staff || staff.isActive === false || staff.role !== "ADMIN") return { status: "forbidden" };
  return { status: "ok" };
}

export async function requireFinanceAdmin(): Promise<void> {
  const gate = await checkFinanceAdmin();
  if (gate.status === "unauthenticated") throw new Error("غير مصرح");
  if (gate.status === "forbidden") throw new Error("هذه الصفحة مخصصة لمدير النظام فقط");
}
