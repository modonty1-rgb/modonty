import "server-only";

/**
 * يطلب من تطبيق الدفع ردّ مبلغ طلب تمارا عبر واجهتهم — قبل أن يكتب الأدمن «مُسترَد».
 *
 * مفاتيح تمارا في تطبيق الدفع وحده، فالأدمن لا يكلّم تمارا مباشرةً: يمرّ عبر
 * `payment/app/api/internal/tamara-refund` بسرّ داخلي مشترك (`PAYMENT_INTERNAL_SECRET`).
 * `PAY_INTERNAL_URL` محلياً = http://localhost:3003، وفي الإنتاج = https://pay.modonty.com.
 */
export async function refundTamaraOrder(
  orderId: string,
  reason: string,
): Promise<{ ok: true; refundId: string } | { ok: false; error: string }> {
  const base = process.env.PAY_INTERNAL_URL?.trim() || "https://pay.modonty.com";
  const secret = process.env.PAYMENT_INTERNAL_SECRET ?? "";
  if (!secret) return { ok: false, error: "PAYMENT_INTERNAL_SECRET غير مضبوط — لم يُرسَل الاسترداد لتمارا" };

  try {
    const res = await fetch(`${base}/api/internal/tamara-refund`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-internal-secret": secret },
      body: JSON.stringify({ orderId, reason }),
      cache: "no-store",
      signal: AbortSignal.timeout(30_000),
    });
    const body = (await res.json().catch(() => ({}))) as { ok?: boolean; refundId?: string; error?: string };
    if (!res.ok || !body.ok || !body.refundId) {
      return { ok: false, error: `تمارا رفضت الاسترداد: ${body.error ?? res.status}` };
    }
    return { ok: true, refundId: body.refundId };
  } catch (err) {
    return { ok: false, error: `تعذّر الوصول لتطبيق الدفع: ${err instanceof Error ? err.message : "unknown"}` };
  }
}
