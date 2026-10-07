import { decode, encode } from "next-auth/jwt";
import type { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { isObjectId } from "./params";

interface MobileSession {
  clientId: string;
  email: string | null;
  name: string;
  slug: string;
  /** `MobileSession.id` في القاعدة — الصفّ الذي يُلغى عند الخروج. */
  sessionId: string;
}

type MobileIdentity = Omit<MobileSession, "sessionId">;

const MOBILE_TOKEN_SALT = "modonty-console-mobile-v1";
const TOKEN_TTL_SECONDS = 60 * 60 * 24 * 30;

function secret() {
  const value = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET;
  if (!value && process.env.NODE_ENV === "production") throw new Error("AUTH_SECRET must be set for mobile API tokens");
  return value || "dev-only-secret-do-not-use-in-production";
}

function expiresAtFromNow() {
  return new Date(Date.now() + TOKEN_TTL_SECONDS * 1000);
}

/**
 * الجلسة صفٌّ في القاعدة، والتوكن يحمل معرّفه (`sid`).
 *
 * كان التوكن وحده هو الجلسة: ٣٠ يوماً بلا أثر في الخادم، فالخروج لا يُلغي شيئاً — من نسخ
 * التوكن قبل الخروج يبقى داخلاً، والتجديد يسكّ توكناً جديداً بلا سؤال. والبديل الأبسط
 * (رقم إصدار على العميل) يُخرج **كل** أجهزة العميل عند خروج جهاز واحد؛ الصفّ لكل دخول
 * يُخرج هذا الجوال وحده، وتغيير كلمة المرور يُخرجها كلّها.
 */
async function issueMobileToken(session: MobileSession) {
  const { sessionId, ...identity } = session;
  return encode({ secret: secret(), salt: MOBILE_TOKEN_SALT, maxAge: TOKEN_TTL_SECONDS, token: { ...identity, sid: sessionId, tokenUse: "mobile-api" } });
}

/** دخول جديد: صفّ جلسة + توكن يحمل معرّفه. */
export async function startMobileSession(identity: MobileIdentity) {
  const row = await db.mobileSession.create({ data: { clientId: identity.clientId, expiresAt: expiresAtFromNow() }, select: { id: true } });
  return issueMobileToken({ ...identity, sessionId: row.id });
}

/** التوقيع وحده — بلا سؤال القاعدة. للاستعمال الداخلي (الخروج يحتاجه حتى لو أُلغيت الجلسة). */
async function decodeMobileToken(request: NextRequest): Promise<MobileSession | null> {
  const token = request.headers.get("authorization")?.match(/^Bearer\s+(.+)$/i)?.[1];
  if (!token) return null;
  const payload = await decode({ secret: secret(), salt: MOBILE_TOKEN_SALT, token }).catch(() => null);
  if (!payload || payload.tokenUse !== "mobile-api" || typeof payload.clientId !== "string" || typeof payload.name !== "string" || typeof payload.slug !== "string") return null;
  // توكن بلا `sid` صدر قبل الجلسات القابلة للإلغاء: لا شيء يُلغيه، فلا يُقبل.
  if (typeof payload.sid !== "string" || !isObjectId(payload.sid)) return null;
  return { clientId: payload.clientId, name: payload.name, slug: payload.slug, email: typeof payload.email === "string" ? payload.email : null, sessionId: payload.sid };
}

/** كل نقطة محميّة تمرّ من هنا: توقيع سليم **و**صفّ جلسة حيّ لنفس العميل. */
export async function mobileSessionFromRequest(request: NextRequest): Promise<MobileSession | null> {
  const session = await decodeMobileToken(request);
  if (!session) return null;
  const row = await db.mobileSession.findUnique({ where: { id: session.sessionId }, select: { clientId: true, expiresAt: true, revokedAt: true } });
  if (!row || row.revokedAt !== null || row.clientId !== session.clientId || row.expiresAt.getTime() <= Date.now()) return null;
  return session;
}

/** تجديد: نفس الجلسة، مدّة جديدة، توكن جديد. الجلسة الملغاة لا تُجدَّد (يُفحص قبلها في `mobileSessionFromRequest`). */
export async function refreshMobileSession(session: MobileSession) {
  await db.mobileSession.update({ where: { id: session.sessionId }, data: { expiresAt: expiresAtFromNow() } });
  return issueMobileToken(session);
}

/**
 * الخروج: يُلغي جلسة **هذا** التوكن وحدها. يقرأ التوقيع لا الصفّ، فخروجٌ ثانٍ بنفس التوكن
 * (أو بعد انتهائه) لا يفشل. يُرجع هويّة صاحب التوكن، أو `null` لو التوكن مزوّر أو غائب.
 */
export async function endMobileSession(request: NextRequest): Promise<MobileSession | null> {
  const session = await decodeMobileToken(request);
  if (!session) return null;
  await db.mobileSession.updateMany({
    where: { id: session.sessionId, clientId: session.clientId, OR: [{ revokedAt: null }, { revokedAt: { isSet: false } }] },
    data: { revokedAt: new Date(), revokedReason: "SignedOut" },
  });
  return session;
}

/** يُخرج كل جوّالات العميل — بعد تغيير كلمة المرور. */
export async function revokeAllMobileSessions(clientId: string, reason: "PasswordChanged") {
  const result = await db.mobileSession.updateMany({
    where: { clientId, OR: [{ revokedAt: null }, { revokedAt: { isSet: false } }] },
    data: { revokedAt: new Date(), revokedReason: reason },
  });
  return result.count;
}

export const mobileTokenTtlSeconds = TOKEN_TTL_SECONDS;
