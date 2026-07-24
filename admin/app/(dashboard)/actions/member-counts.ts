"use server";

import { db } from "@/lib/db";

/**
 * Registered members (role EDITOR) — visitors who signed up on modonty.com.
 * Signup method is derived from `password`: a Google (OAuth) member has none,
 * an email+password member does. Only email+password members go through our
 * verification-link flow, so an unconfirmed link is the one actionable state
 * (Google verifies email ownership at sign-in). Distinct from /subscribers
 * (newsletter) and /users (admins).
 */

export interface MemberCounts {
  total: number;
  /** Signed in with Google (OAuth, no password) — email auto-verified. */
  google: number;
  /** Signed up with email + password. */
  emailPassword: number;
  /** Of the email+password members, confirmed their verification link. */
  linkConfirmed: number;
  /** Email+password members who never confirmed the link — the gap to chase. */
  awaitingLink: number;
  /** Joined in the last 30 days — this month's growth. */
  newLast30: number;
}

export async function getMemberCounts(): Promise<MemberCounts> {
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  // In MongoDB a Google member has NO `password`/`emailVerified` field at all —
  // a `{ field: null }` filter would miss those absent fields. So we only ever
  // count on `{ not: null }` (reliable for present values) and derive the
  // complement by subtraction, matching the JS logic in members-actions.
  const [total, emailPassword, linkConfirmed, newLast30] = await Promise.all([
    db.user.count({ where: { role: "EDITOR" } }),
    db.user.count({ where: { role: "EDITOR", password: { not: null } } }),
    db.user.count({
      where: { role: "EDITOR", password: { not: null }, emailVerified: { not: null } },
    }),
    db.user.count({ where: { role: "EDITOR", createdAt: { gte: since } } }),
  ]);

  const google = total - emailPassword;
  const awaitingLink = emailPassword - linkConfirmed;

  return { total, google, emailPassword, linkConfirmed, awaitingLink, newLast30 };
}
