import "server-only";

import type { Prisma } from "@prisma/client";
import { auth } from "@/lib/auth";

export interface StaffScope {
  userId: string | null;
  role: string | null;
  /** A sales rep is scoped to the clients they brought; every other role sees all. */
  isSales: boolean;
}

export async function getStaffScope(): Promise<StaffScope> {
  const session = await auth();
  const userId = session?.user?.id ?? null;
  const role = (session?.user as { role?: string } | undefined)?.role ?? null;
  return { userId, role, isSales: role === "SALES" };
}

/**
 * Prisma Client where-fragment for list queries: sales reps only ever see their own
 * clients; everyone else (Admin/Editor/Creative/Social/QC) sees all. Spread into an
 * existing `where` — it ANDs with the rest.
 */
export function salesClientWhere(scope: StaffScope): Prisma.ClientWhereInput {
  return scope.isSales && scope.userId ? { salesRepId: scope.userId } : {};
}

/** True when this scope is NOT allowed to view the given client (a rep opening someone else's). */
export function isClientOutOfScope(scope: StaffScope, clientSalesRepId: string | null): boolean {
  return scope.isSales && clientSalesRepId !== scope.userId;
}
