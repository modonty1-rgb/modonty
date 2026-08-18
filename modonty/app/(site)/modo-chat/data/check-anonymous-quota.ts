import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

/** Khalid's decision (2026-08-18): three free questions, then the sign-in wall. */
export const FREE_TRIAL_QUESTIONS = 3;

const COOKIE = "modo_trial";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

export interface TrialVerdict {
  allowed: boolean;
  /** How many free questions are left AFTER this one. */
  remaining: number;
  message: string;
}

/**
 * The free trial for a visitor with no account.
 *
 * The count lives in a SIGNED cookie, not in the database: an anonymous turn has no `userId`,
 * and `ChatbotMessage.userId` is required with a real relation — so there is nothing to count
 * rows against. Signing matters because the cookie is the only ceiling: unsigned, anyone could
 * set `used=0` forever and every question costs us an embed, a rerank and a generation.
 *
 * A determined visitor can still clear cookies and get three more. That is accepted: the cost of
 * three questions is far below the cost of the sign-in wall that made every ad click bounce.
 * The per-account limiter (`check-rate-limit`) is what guards real volume.
 */
function sign(value: string): string {
  const secret = process.env.AUTH_SECRET ?? "";
  return createHmac("sha256", secret).update(value).digest("base64url");
}

function readUsed(raw: string | undefined): number {
  if (!raw) return 0;
  const [count, mac] = raw.split(".");
  if (!count || !mac) return 0;
  const expected = sign(count);
  // Both are base64url of the same digest length, so the comparison is safe to time-guard.
  if (expected.length !== mac.length) return 0;
  if (!timingSafeEqual(Buffer.from(expected), Buffer.from(mac))) return 0;
  const n = Number.parseInt(count, 10);
  return Number.isFinite(n) && n >= 0 ? n : 0;
}

/** Reads the trial state without spending anything — for rendering the counter. */
export async function readAnonymousTrial(): Promise<{ used: number; remaining: number }> {
  const store = await cookies();
  const used = readUsed(store.get(COOKIE)?.value);
  return { used, remaining: Math.max(0, FREE_TRIAL_QUESTIONS - used) };
}

/** Spends one free question. Call BEFORE any paid upstream call. */
export async function spendAnonymousQuestion(): Promise<TrialVerdict> {
  if (!process.env.AUTH_SECRET) {
    // Unsigned cookies are not a ceiling at all — refuse rather than hand out free calls.
    return { allowed: false, remaining: 0, message: "الخدمة غير متاحة الآن. سجّل دخولك وأكمل." };
  }

  const store = await cookies();
  const used = readUsed(store.get(COOKIE)?.value);

  if (used >= FREE_TRIAL_QUESTIONS) {
    return {
      allowed: false,
      remaining: 0,
      message: "خلّصت أسئلتك المجّانية. سجّل دخولك وأكمل — والمحادثة تنحفظ لك.",
    };
  }

  const next = used + 1;
  store.set(COOKIE, `${next}.${sign(String(next))}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });

  return { allowed: true, remaining: FREE_TRIAL_QUESTIONS - next, message: "" };
}
