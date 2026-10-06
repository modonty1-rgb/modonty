import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";

import { db } from "@/lib/db";
import { TamaraError } from "@/lib/tamara/client";
import { getOrder, refundOrder } from "@/lib/tamara/orders";

/**
 * استرداد طلب تمارا — يستدعيه زرّ «استرداد» في الأدمن وحده.
 *
 * قائمة تمارا للإطلاق (online-go-live-testing-checklist): «a refund API call is triggered to
 * Tamara on refund happening from different initiation points» · «All Tamara orders refunds
 * are handled over Tamara ONLY». فالأدمن لا يكتفي بكتابة REFUNDED لطلب تمارا: يطلب الردّ من
 * هنا أوّلاً، ولا يكتب شيئاً إن رفضت تمارا.
 *
 * المبلغ من تمارا لا من قاعدتنا: `captured_amount` هو ما قُبض فعلاً، فلا يُردّ أكثر منه
 * ولا أقلّ. والحالة النهائية (REFUNDED) يكتبها الأدمن مع سجلّ التدقيق، ويؤكّدها ويبهوك تمارا.
 */
const schema = z.object({
  orderId: z.string().regex(/^[a-f0-9]{24}$/),
  reason: z.string().trim().min(3).max(300),
});

function authorised(req: Request): boolean {
  const secret = process.env.PAYMENT_INTERNAL_SECRET ?? "";
  const provided = req.headers.get("x-internal-secret") ?? "";
  if (secret.length < 32) return false;
  const a = Buffer.from(secret);
  const b = Buffer.from(provided);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function POST(req: Request) {
  if (!authorised(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "bad-request" }, { status: 400 });
  const { orderId, reason } = parsed.data;

  const order = await db.checkoutOrder.findUnique({
    where: { id: orderId },
    select: { number: true, status: true },
  });
  if (!order) return NextResponse.json({ error: "order-not-found" }, { status: 404 });
  if (order.status !== "PAID") return NextResponse.json({ error: `order-not-paid:${order.status}` }, { status: 409 });

  const txn = await db.paymentTransaction.findFirst({
    where: { orderId, provider: "TAMARA", providerOrderRef: { not: null } },
    orderBy: { createdAt: "desc" },
    select: { id: true, providerOrderRef: true },
  });
  if (!txn?.providerOrderRef) return NextResponse.json({ error: "not-a-tamara-order" }, { status: 422 });

  try {
    const tamara = await getOrder(txn.providerOrderRef);
    const captured = tamara.captured_amount;
    if (!captured || captured.amount <= 0) {
      return NextResponse.json({ error: `nothing-captured:${tamara.status}` }, { status: 409 });
    }

    const refund = await refundOrder(txn.providerOrderRef, captured, `${order.number} — ${reason}`.slice(0, 250));
    const after = await getOrder(txn.providerOrderRef).then((o) => o.status).catch(() => refund.status);

    await db.paymentTransaction.update({
      where: { id: txn.id },
      data: { status: after, rawStatus: after },
    });

    return NextResponse.json({ ok: true, refundId: refund.refund_id, status: after, refunded: refund.refunded_amount });
  } catch (err) {
    console.error("[internal/tamara-refund] failed", err);
    const message = err instanceof TamaraError ? `${err.status} ${err.code ?? ""} ${err.message}`.trim() : "tamara-unreachable";
    return NextResponse.json({ error: message.slice(0, 300) }, { status: 502 });
  }
}
