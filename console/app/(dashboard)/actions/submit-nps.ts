"use server";

import { auth } from "@/lib/auth";
import { saveNpsResponse } from "@/lib/nps/save-nps-response";

/**
 * إجابة استبيان الرضا — أو إغلاقه بـ× (تأجيل ١٤ يوماً). العميل من جلسته لا من المتصفّح، ودخول فريقنا
 * بحساب العميل لا يُسجَّل رأياً له.
 */
export async function submitNps(raw: unknown): Promise<{ success: boolean; error?: string }> {
  const session = await auth();
  const clientId = (session as { clientId?: string } | null)?.clientId;
  if (!clientId) return { success: false, error: "غير مصرح" };
  if ((session as { impersonated?: boolean }).impersonated) return { success: false, error: "دخول الفريق لا يُسجَّل رأياً للعميل" };
  return saveNpsResponse(clientId, raw);
}
