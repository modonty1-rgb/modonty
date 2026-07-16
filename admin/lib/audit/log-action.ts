import "server-only";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

/**
 * Who did what — one line per sensitive action (Khalid 2026-07-14: more than one person
 * works in the admin now, and until today every action was anonymous. If an article was
 * deleted by mistake, nothing on earth could tell you who did it).
 *
 * Usage — one line, AFTER the action has already succeeded:
 *
 *   await logAction("article.delete", { entity: "Article", entityId: id, summary: title });
 *
 * Three rules this file lives by:
 *
 *  1. NEVER breaks the action. Every failure is swallowed. A log is a witness, not a
 *     gatekeeper — if the witness trips, the work still stands.
 *  2. NEVER trusts the caller for identity. It reads the session itself, so no call site
 *     can log an action as somebody else, by accident or otherwise.
 *  3. NEVER records a password. It is bcrypt-hashed (unreadable to us), it would hand
 *     every account to anyone who opens the table, and it says nothing about WHO acted —
 *     userId already does.
 */

/** Dotted, stable keys. Add here; never invent one at a call site — the log screen filters on these. */
export type AuditAction =
  // 🔴 Destructive — no way back
  | "article.delete"
  | "client.delete"
  | "category.delete"
  | "tag.delete"
  | "media.delete"
  | "contactMessage.delete"
  // 🔴 Goes public / decides responsibility
  | "article.publish"
  | "article.transition"
  | "article.schedule"
  | "article.resetStatus"
  // 🟠 Changes the record
  | "article.update"
  | "article.create"
  | "client.update"
  | "client.create"
  | "user.create"
  | "user.update"
  | "user.delete"
  | "settings.update"
  // 🟡 Touches everything at once
  | "database.maintenance"
  | "seo.cascade";

export type AuditEntity =
  | "Article"
  | "Client"
  | "Category"
  | "Tag"
  | "Media"
  | "ContactMessage"
  | "User"
  | "Settings"
  | "Database"
  | "Seo";

interface LogOptions {
  entity: AuditEntity;
  /** Null for platform-wide actions (settings, a cascade) — they belong to no single row. */
  entityId?: string | null;
  /** The line a human reads: "نشر: أفضل واكس شعر للرجال". A snapshot — a later rename must not rewrite history. */
  summary?: string | null;
  /** Extra worth keeping that has no column: { from: "DRAFT", to: "PUBLISHED" }. No personal data, no secrets. */
  metadata?: Record<string, unknown> | null;
}

export async function logAction(action: AuditAction, options: LogOptions): Promise<void> {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    // No identity = no log. Every logged path is already behind auth(), so this only
    // fires if something calls us from outside a request — in which case a row claiming
    // an unknown actor would be worse than no row.
    if (!userId) return;

    const email = session.user?.email ?? null;
    const name = session.user?.name ?? null;

    // The role is NOT in the session (auth.config only carries id/email/name), and it is
    // worth having: it records what this person WAS allowed to do at the time, not what
    // they are allowed to do today. Best-effort — a failure here must not cost us the row.
    let role: string | null = null;
    try {
      const user = await db.user.findUnique({ where: { id: userId }, select: { role: true } });
      role = user?.role ?? null;
    } catch {
      // leave null
    }

    await db.auditLog.create({
      data: {
        userId,
        // Email is the snapshot that answers "who?" after the account is gone. If the
        // session somehow has none, say so plainly rather than write an empty string.
        userEmail: email ?? "(no email on session)",
        userName: name,
        userRole: role,
        action,
        entity: options.entity,
        entityId: options.entityId ?? null,
        summary: options.summary ?? null,
        metadata: (options.metadata ?? undefined) as never,
      },
    });
  } catch (error) {
    // Deliberate: the action already succeeded. Losing its log line is bad; undoing the
    // user's work because the log failed would be worse.
    console.error("[audit] failed to log", action, error);
  }
}
