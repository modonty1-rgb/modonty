"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export interface SessionCleanerStats {
  expiredSessions: number;
  expiredVerificationTokens: number;
  total: number;
}

export async function getSessionCleanerStats(): Promise<SessionCleanerStats> {
  const now = new Date();
  const [expiredSessions, expiredVerificationTokens] = await Promise.all([
    db.session.count({ where: { expires: { lt: now } } }),
    db.verificationToken.count({ where: { expires: { lt: now } } }),
  ]);
  return { expiredSessions, expiredVerificationTokens, total: expiredSessions + expiredVerificationTokens };
}

export async function cleanExpiredSessions(): Promise<{ deleted: number }> {
  const now = new Date();
  const [s, v] = await Promise.all([
    db.session.deleteMany({ where: { expires: { lt: now } } }),
    db.verificationToken.deleteMany({ where: { expires: { lt: now } } }),
  ]);
  revalidatePath("/database");
  return { deleted: s.count + v.count };
}
