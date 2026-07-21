"use server";

import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-guard";

/**
 * One-time migration: copy the admin accounts out of `users` (role = ADMIN) into
 * the separate `staff` collection, PRESERVING _id so every existing reference
 * (createdBy / reviewedBy / authorId / notifications …) keeps resolving.
 *
 * COPY not move — the source `users` rows are left UNTOUCHED. They are deleted only
 * after login from `staff` is verified live in production (a later, deliberate step).
 * Idempotent: an admin already present in `staff` (same _id) is skipped, so running
 * twice is a no-op. Safe to run while the login/guard fallback (`staff ?? user`) is
 * active — the fallback keeps admins signed in throughout the copy.
 */

export interface StaffMigrationStats {
  adminsInUsers: number;
  alreadyInStaff: number;
  pending: number;
  sample: Array<{ id: string; email: string | null }>;
}

export async function getStaffMigrationStats(): Promise<StaffMigrationStats> {
  const gate = await requireAdmin();
  if ("error" in gate) return { adminsInUsers: 0, alreadyInStaff: 0, pending: 0, sample: [] };

  const admins = await db.user.findMany({
    where: { role: "ADMIN" },
    select: { id: true, email: true },
    take: 100,
  });
  const existing = await db.staff.findMany({
    where: { id: { in: admins.map((a) => a.id) } },
    select: { id: true },
  });
  const existingIds = new Set(existing.map((e) => e.id));
  const pending = admins.filter((a) => !existingIds.has(a.id));

  return {
    adminsInUsers: admins.length,
    alreadyInStaff: existing.length,
    pending: pending.length,
    sample: pending.slice(0, 8).map((a) => ({ id: a.id, email: a.email })),
  };
}

export interface StaffMigrationResult {
  success: boolean;
  copied: number;
  skipped: number;
  failed: number;
  error?: string;
}

export async function migrateAdminsToStaff(): Promise<StaffMigrationResult> {
  const gate = await requireAdmin();
  if ("error" in gate) return { success: false, copied: 0, skipped: 0, failed: 0, error: gate.error };

  try {
    const admins = await db.user.findMany({
      where: { role: "ADMIN" },
      select: {
        id: true,
        name: true,
        email: true,
        emailVerified: true,
        image: true,
        bio: true,
        password: true,
        passwordResetToken: true,
        passwordResetExpires: true,
        createdAt: true,
      },
      take: 100,
    });

    let copied = 0;
    let skipped = 0;
    let failed = 0;

    for (const u of admins) {
      try {
        const exists = await db.staff.findUnique({ where: { id: u.id }, select: { id: true } });
        if (exists) {
          skipped++;
          continue;
        }
        await db.staff.create({
          data: {
            id: u.id, // preserve _id — every existing reference keeps resolving
            name: u.name,
            email: u.email,
            emailVerified: u.emailVerified,
            image: u.image,
            bio: u.bio,
            password: u.password,
            passwordResetToken: u.passwordResetToken,
            passwordResetExpires: u.passwordResetExpires,
            role: "ADMIN",
            createdAt: u.createdAt,
          },
        });
        copied++;
      } catch {
        failed++;
      }
    }

    revalidatePath("/database");
    revalidatePath("/users");
    return { success: true, copied, skipped, failed };
  } catch (e) {
    return {
      success: false,
      copied: 0,
      skipped: 0,
      failed: 0,
      error: e instanceof Error ? e.message : "Migration failed",
    };
  }
}
