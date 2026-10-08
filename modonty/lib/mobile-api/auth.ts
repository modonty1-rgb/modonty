import "server-only";

import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import { decode, encode } from "next-auth/jwt";

import { db } from "@/lib/db";
import type { ReaderActor } from "@/lib/users/reader-actor";
import { isObjectId } from "./params";

/**
 * جلسات قارئ التطبيق — نمط الكونسول (`console/lib/mobile-api/auth.ts`) بعد علاج ما ثبت فيه:
 *
 * - **توكن وصول** ١٥ دقيقة: `next-auth/jwt encode` (A256CBC-HS512 · HKDF من AUTH_SECRET) بـsalt
 *   خاصّ بالتطبيق، يحمل `sid` = صفّ `ReaderSession`. كل نقطة Bearer تفحص الصفّ حيّاً.
 * - **توكن تجديد** ٣٠ يوماً `<sid>.<secret>`: يُخزَّن هاشه فقط، ويُدوَّر عند كل تجديد؛ تقديم
 *   السابق مرّةً ثانية (نسخة مسروقة) يلغي الجلسة كلّها.
 * - الخروج يلغي **هذه** الجلسة وحدها.
 */
const TOKEN_SALT = "modonty-reader-mobile-v1";
const TOKEN_USE = "reader-api";
const ACCESS_TTL_SECONDS = 15 * 60;
const REFRESH_TTL_MS = 30 * 24 * 60 * 60 * 1000;

/**
 * «لم تُلغَ» — صراحةً null **أو** غائب. في مونغو `revokedAt: null` وحده لا يطابق حقلاً غائباً
 * (فخّ أعطى أصفاراً كاذبة ثلاث مرّات في هذا المستودع)؛ نفس صيغة الكونسول.
 */
const NOT_REVOKED = { OR: [{ revokedAt: null }, { revokedAt: { isSet: false } }] };

function secret(): string {
  const value = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET;
  // Same requirement lib/auth.ts enforces for the web — no fallback secret, ever.
  if (!value) throw new Error("AUTH_SECRET must be set for reader mobile tokens");
  return value;
}

function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

function sameHash(a: string, b: string): boolean {
  const left = Buffer.from(a, "hex");
  const right = Buffer.from(b, "hex");
  return left.length === right.length && timingSafeEqual(left, right);
}

export interface ReaderTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface ReaderSession {
  userId: string;
  sessionId: string;
}

async function issueAccessToken(session: ReaderSession): Promise<string> {
  return encode({
    secret: secret(),
    salt: TOKEN_SALT,
    maxAge: ACCESS_TTL_SECONDS,
    token: { sub: session.userId, sid: session.sessionId, tokenUse: TOKEN_USE },
  });
}

function newRefreshSecret(): string {
  return randomBytes(32).toString("base64url");
}

/** دخول جديد: صفّ جلسة + توكنان. */
export async function startReaderSession(
  userId: string,
  meta: { deviceId: string | null; userAgent: string | null },
): Promise<ReaderTokens> {
  const refreshSecret = newRefreshSecret();
  const row = await db.readerSession.create({
    data: {
      userId,
      refreshHash: sha256(refreshSecret),
      deviceId: meta.deviceId,
      userAgent: meta.userAgent?.slice(0, 300) ?? null,
      expiresAt: new Date(Date.now() + REFRESH_TTL_MS),
      prevRefreshHash: null,
      revokedAt: null,
      revokedReason: null,
    },
    select: { id: true },
  });
  return {
    accessToken: await issueAccessToken({ userId, sessionId: row.id }),
    refreshToken: `${row.id}.${refreshSecret}`,
    expiresIn: ACCESS_TTL_SECONDS,
  };
}

function bearerToken(request: Request): string | null {
  return request.headers.get("authorization")?.match(/^Bearer\s+(.+)$/i)?.[1]?.trim() ?? null;
}

/** التوقيع وحده — بلا سؤال القاعدة. */
async function decodeAccessToken(token: string): Promise<ReaderSession | null> {
  const payload = await decode({ secret: secret(), salt: TOKEN_SALT, token }).catch(() => null);
  if (!payload || payload.tokenUse !== TOKEN_USE) return null;
  if (typeof payload.sub !== "string" || !isObjectId(payload.sub)) return null;
  if (typeof payload.sid !== "string" || !isObjectId(payload.sid)) return null;
  return { userId: payload.sub, sessionId: payload.sid };
}

function isLive(row: { userId: string; expiresAt: Date; revokedAt: Date | null } | null, userId: string): boolean {
  return !!row && row.revokedAt === null && row.userId === userId && row.expiresAt.getTime() > Date.now();
}

/**
 * كل نقطة محميّة تمرّ من هنا: توقيع سليم **و**صفّ جلسة حيّ **و**مستخدم ما زال موجوداً.
 * يُرجع هويّة الفاعل (للتنبيهات والتحليلات بنفس شكل جلسة الويب) أو `null`.
 */
export async function readerFromRequest(request: Request): Promise<(ReaderActor & { sessionId: string }) | null> {
  const token = bearerToken(request);
  if (!token) return null;
  const session = await decodeAccessToken(token);
  if (!session) return null;
  const [row, user] = await Promise.all([
    db.readerSession.findUnique({
      where: { id: session.sessionId },
      select: { userId: true, expiresAt: true, revokedAt: true },
    }),
    db.user.findUnique({ where: { id: session.userId }, select: { id: true, name: true, email: true } }),
  ]);
  if (!isLive(row, session.userId) || !user) return null;
  return { id: user.id, name: user.name, email: user.email, sessionId: session.sessionId };
}

function parseRefreshToken(raw: string): { sessionId: string; secret: string } | null {
  const dot = raw.indexOf(".");
  if (dot <= 0) return null;
  const sessionId = raw.slice(0, dot);
  const refreshSecret = raw.slice(dot + 1);
  if (!isObjectId(sessionId) || refreshSecret.length < 20 || refreshSecret.length > 100) return null;
  return { sessionId, secret: refreshSecret };
}

/**
 * تجديد بتدوير: التوكن الحالي يُستبدل، والسابق يُحفظ هاشه لكشف إعادة الاستعمال. تقديم توكن
 * سابق = نسخة خرجت من الجهاز → تُلغى الجلسة كلّها. يُرجع `null` لأي توكن غير صالح.
 */
export async function refreshReaderSession(rawRefreshToken: string): Promise<ReaderTokens | null> {
  const parsed = parseRefreshToken(rawRefreshToken);
  if (!parsed) return null;
  const row = await db.readerSession.findUnique({
    where: { id: parsed.sessionId },
    select: { id: true, userId: true, refreshHash: true, prevRefreshHash: true, expiresAt: true, revokedAt: true },
  });
  if (!row || row.revokedAt !== null || row.expiresAt.getTime() <= Date.now()) return null;

  const presented = sha256(parsed.secret);
  if (!sameHash(presented, row.refreshHash)) {
    if (row.prevRefreshHash && sameHash(presented, row.prevRefreshHash)) {
      await db.readerSession.updateMany({
        where: { id: row.id, ...NOT_REVOKED },
        data: { revokedAt: new Date(), revokedReason: "RefreshReuse" },
      });
    }
    return null;
  }

  const nextSecret = newRefreshSecret();
  // Conditional on the hash we just checked: two refreshes racing with the same token — only
  // one rotates; the loser gets null instead of minting a second valid pair.
  const rotated = await db.readerSession.updateMany({
    where: { id: row.id, refreshHash: row.refreshHash, ...NOT_REVOKED },
    data: {
      refreshHash: sha256(nextSecret),
      prevRefreshHash: row.refreshHash,
      expiresAt: new Date(Date.now() + REFRESH_TTL_MS),
      lastSeenAt: new Date(),
    },
  });
  if (rotated.count !== 1) return null;

  return {
    accessToken: await issueAccessToken({ userId: row.userId, sessionId: row.id }),
    refreshToken: `${row.id}.${nextSecret}`,
    expiresIn: ACCESS_TTL_SECONDS,
  };
}

/**
 * الخروج: يلغي جلسة التوكن المقدَّم وحدها — توكن الوصول (حتى لو أُلغيت الجلسة قبلاً) أو توكن
 * التجديد (لو انتهى توكن الوصول). خروجٌ ثانٍ بنفس التوكن لا يفشل. يُرجع معرّف القارئ صاحب
 * الجلسة (لتعطيل جهاز الدفع في نقطة الخروج) أو `null` = لا توكن صالح.
 */
export async function endReaderSession(request: Request, rawRefreshToken: string | undefined): Promise<string | null> {
  const access = bearerToken(request);
  const fromAccess = access ? await decodeAccessToken(access) : null;
  if (fromAccess) {
    await db.readerSession.updateMany({
      where: { id: fromAccess.sessionId, userId: fromAccess.userId, ...NOT_REVOKED },
      data: { revokedAt: new Date(), revokedReason: "SignedOut" },
    });
    return fromAccess.userId;
  }
  const parsed = rawRefreshToken ? parseRefreshToken(rawRefreshToken) : null;
  if (!parsed) return null;
  const row = await db.readerSession.findUnique({
    where: { id: parsed.sessionId },
    select: { id: true, userId: true, refreshHash: true },
  });
  if (!row || !sameHash(sha256(parsed.secret), row.refreshHash)) return null;
  await db.readerSession.updateMany({
    where: { id: row.id, ...NOT_REVOKED },
    data: { revokedAt: new Date(), revokedReason: "SignedOut" },
  });
  return row.userId;
}

/** التوكن الخام من الرأس — لنقطة التجديد التي تقبل التوكن في `Authorization`. */
export function bearerFrom(request: Request): string | null {
  return bearerToken(request);
}
