import type { NextRequest } from "next/server";
import { mobileSessionFromRequest, mobileTokenTtlSeconds, refreshMobileSession } from "@/lib/mobile-api/auth";
import { fail, ok } from "@/lib/mobile-api/http";

// التجديد يمرّ من نفس فحص الجلسة: جلسةٌ خرج منها صاحبها أو أُلغيت بتغيير كلمة المرور لا تُجدَّد.
export async function POST(request: NextRequest) {
  const session = await mobileSessionFromRequest(request);
  if (!session) return fail("UNAUTHORIZED", "انتهت الجلسة. سجّل الدخول مرة أخرى.");
  return ok({ accessToken: await refreshMobileSession(session), tokenType: "Bearer", expiresIn: mobileTokenTtlSeconds });
}
