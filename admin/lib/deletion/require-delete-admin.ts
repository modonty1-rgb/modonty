import { checkFinanceAdmin } from "@/lib/require-finance-admin";

/**
 * الحذف للأدمن وحده (خالد ١٦ أكتوبر ٢٠٢٦: «أي حذف راجع لي الأدمين… من السيستم عند الأدمين»).
 * نفس فحص الفلوس: موظّف نشط ودوره ADMIN — لا `requireAdmin` الذي يقبل أي موظّف نشط.
 * يرجع رسالة الرفض بالعربي، أو null حين يُسمح.
 */
export async function requireDeleteAdmin(): Promise<string | null> {
  const gate = await checkFinanceAdmin();
  if (gate.status === "ok") return null;
  return gate.status === "unauthenticated"
    ? "سجّل الدخول أولاً."
    : "الحذف للأدمن فقط — حسابك ما عنده هذي الصلاحية.";
}
