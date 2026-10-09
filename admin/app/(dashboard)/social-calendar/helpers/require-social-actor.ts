import "server-only";

import type { StaffRole } from "@prisma/client";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

import { canSocial, type SocialPermission } from "./post-permissions";

export interface SocialActor {
  staffId: string;
  role: StaffRole;
  name: string;
}

export const NO_PERMISSION_ERROR = "ليس لدورك صلاحية هذا الإجراء";

/**
 * هويّة الموظّف ودوره، مقروءان من القاعدة لا من التوكن — نفس قاعدة `lib/admin-guard.ts`:
 * تغيير الدور أو إيقاف الموظّف يسري من الطلب التالي.
 *
 * يرجع الموظّف إن كان نشطاً ويملك الصلاحية المطلوبة، وإلّا `{ error }` يعيده الأكشن كما هو.
 */
export async function requireSocialActor(
  permission: SocialPermission = "view",
): Promise<SocialActor | { error: string }> {
  const session = await auth().catch(() => null);
  const staffId = (session?.user as { id?: string } | undefined)?.id;
  if (!staffId) return { error: "غير مصرّح — سجّل الدخول من جديد" };

  const staff = await db.staff
    .findUnique({ where: { id: staffId }, select: { role: true, isActive: true, name: true, email: true } })
    .catch(() => null);
  if (!staff || staff.isActive === false) return { error: "غير مصرّح" };
  if (!canSocial(staff.role, permission)) return { error: NO_PERMISSION_ERROR };

  return { staffId, role: staff.role, name: staff.name?.trim() || staff.email?.trim() || "موظّف" };
}
