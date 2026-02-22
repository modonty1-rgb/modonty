import { db } from "@/lib/db";
import { cookies } from "next/headers";
import type { ConversionType } from "@prisma/client";

const VIEW_SESSION_COOKIE = "modonty_view_sid";
const SESSION_MAX_AGE = 60 * 60 * 24 * 365;

export async function getOrCreateSessionId(): Promise<string> {
  const cookieStore = await cookies();
  let sessionId = cookieStore.get(VIEW_SESSION_COOKIE)?.value;
  if (!sessionId) {
    sessionId = `view-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
    cookieStore.set(VIEW_SESSION_COOKIE, sessionId, {
      maxAge: SESSION_MAX_AGE,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });
  }
  return sessionId;
}

export interface CreateConversionData {
  type: ConversionType;
  userId?: string;
  clientId?: string;
  articleId?: string;
  sessionId?: string;
  value?: number;
  currency?: string;
  ipAddress?: string;
  userAgent?: string;
  referrer?: string | null;
}

export async function createConversion(data: CreateConversionData): Promise<void> {
  await db.conversion.create({
    data: {
      type: data.type,
      userId: data.userId,
      clientId: data.clientId,
      articleId: data.articleId,
      sessionId: data.sessionId,
      value: data.value,
      currency: data.currency,
      ipAddress: data.ipAddress,
      userAgent: data.userAgent,
      referrer: data.referrer ?? undefined,
    },
  });
}
