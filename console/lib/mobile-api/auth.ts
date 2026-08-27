import { decode, encode } from "next-auth/jwt";
import type { NextRequest } from "next/server";

export interface MobileSession {
  clientId: string;
  email: string | null;
  name: string;
  slug: string;
}

const MOBILE_TOKEN_SALT = "modonty-console-mobile-v1";
const TOKEN_TTL_SECONDS = 60 * 60 * 24 * 30;

function secret() {
  const value = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET;
  if (!value && process.env.NODE_ENV === "production") throw new Error("AUTH_SECRET must be set for mobile API tokens");
  return value || "dev-only-secret-do-not-use-in-production";
}

export async function issueMobileToken(session: MobileSession) {
  return encode({ secret: secret(), salt: MOBILE_TOKEN_SALT, maxAge: TOKEN_TTL_SECONDS, token: { ...session, tokenUse: "mobile-api" } });
}

export async function mobileSessionFromRequest(request: NextRequest): Promise<MobileSession | null> {
  const token = request.headers.get("authorization")?.match(/^Bearer\s+(.+)$/i)?.[1];
  if (!token) return null;
  const payload = await decode({ secret: secret(), salt: MOBILE_TOKEN_SALT, token }).catch(() => null);
  if (!payload || payload.tokenUse !== "mobile-api" || typeof payload.clientId !== "string" || typeof payload.name !== "string" || typeof payload.slug !== "string") return null;
  return { clientId: payload.clientId, name: payload.name, slug: payload.slug, email: typeof payload.email === "string" ? payload.email : null };
}

export const mobileTokenTtlSeconds = TOKEN_TTL_SECONDS;
