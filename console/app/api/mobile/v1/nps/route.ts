import type { NextRequest } from "next/server";

import { mobileSessionFromRequest } from "@/lib/mobile-api/auth";
import { fail, ok } from "@/lib/mobile-api/http";
import { getNpsDue } from "@/lib/nps/get-nps-due";
import { saveNpsResponse } from "@/lib/nps/save-nps-response";

/**
 * استبيان رضا العميل (NPS) في تطبيق الكونسول — نفس قاعدة الويب (`lib/nps/*`): يظهر بعد أوّل مقال
 * منشور ثم كل ٩٠ يوماً، والإغلاق تأجيل ١٤ يوماً. النصوص من هنا لا من التطبيق (قاعدة التطبيق: صفر نصّ
 * في الكود)، فتغيير السؤال لا يحتاج إصدار تطبيق.
 */
export async function GET(request: NextRequest) {
  const session = await mobileSessionFromRequest(request);
  if (!session) return fail("UNAUTHORIZED", "سجّل الدخول للمتابعة.");

  const due = await getNpsDue(session.clientId, false);
  return ok({
    due,
    title: "ما مدى احتمال أن توصي بمدونتي لصديق أو زميل؟",
    subtitle: "اختر رقماً من ٠ إلى ١٠.",
    lowLabel: "غير مرجّح أبداً",
    highLabel: "مرجّح جداً",
    commentLabel: "وش أكثر شي أثّر في تقييمك؟ (اختياري)",
    commentPlaceholder: "اكتب بكلماتك…",
    submitLabel: "إرسال",
    submitWithoutCommentLabel: "أرسل التقييم بلا تعليق",
    submittingLabel: "يُرسل…",
    closeLabel: "إغلاق",
    thanksTitle: "شكراً لك",
    thanksBody: "رأيك وصل لفريق مدونتي، ونشتغل عليه.",
    errorLabel: "تعذّر الإرسال. جرّب مرة ثانية.",
  });
}

export async function POST(request: NextRequest) {
  const session = await mobileSessionFromRequest(request);
  if (!session) return fail("UNAUTHORIZED", "سجّل الدخول للمتابعة.");

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return fail("VALIDATION_ERROR", "بيانات التقييم غير صحيحة.");
  }
  const r = await saveNpsResponse(session.clientId, body);
  if (!r.success) return fail("VALIDATION_ERROR", "بيانات التقييم غير صحيحة.");
  return ok({ saved: true });
}
