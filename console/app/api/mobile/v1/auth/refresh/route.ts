import type { NextRequest } from "next/server";
import { issueMobileToken, mobileSessionFromRequest, mobileTokenTtlSeconds } from "@/lib/mobile-api/auth";
import { fail, ok } from "@/lib/mobile-api/http";

export async function POST(request: NextRequest) {
  const session = await mobileSessionFromRequest(request);
  if (!session) return fail("UNAUTHORIZED", "انتهت الجلسة. سجّل الدخول مرة أخرى.");
  return ok({ accessToken: await issueMobileToken(session), tokenType: "Bearer", expiresIn: mobileTokenTtlSeconds });
}
