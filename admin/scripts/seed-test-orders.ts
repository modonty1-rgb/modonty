import { buildOrderSnapshot } from "@modonty/shared/lib/payments/build-order-snapshot";
import { nextOrderNumber } from "@modonty/shared/lib/payments/next-order-number";
import { SA_VAT_RATE_BP } from "@modonty/shared/lib/payments/vat-rate";
import { db } from "../lib/db";

/**
 * Dev-only fixtures for the orders screen (PAY-E1) and the admin actions built on top of
 * it (E2–E8) — every buyer is clearly marked TEST so it can never be mistaken for a real
 * customer. Safe to re-run: it deletes its own previous rows (by buyerEmail prefix) first.
 * Targets whatever DATABASE_URL is active — `modonty_dev` in local dev (PAY-EXEC).
 */
const TEST_EMAIL_PREFIX = "seed-test-order-";

async function run() {
  const existing = await db.checkoutOrder.findMany({ where: { buyerEmail: { startsWith: TEST_EMAIL_PREFIX } }, select: { id: true } });
  if (existing.length) {
    const ids = existing.map((o) => o.id);
    await db.paymentAttempt.deleteMany({ where: { orderId: { in: ids } } });
    await db.paymentWebhookEvent.deleteMany({ where: { orderId: { in: ids } } });
    await db.paymentTransaction.deleteMany({ where: { orderId: { in: ids } } });
    await db.checkoutOrder.deleteMany({ where: { id: { in: ids } } });
    console.log(`حذف ${ids.length} طلب اختبار سابق`);
  }

  const [starter, momentum] = await Promise.all([
    db.commercialPlan.findFirst({ where: { name: "الانطلاقة" }, include: { prices: true } }),
    db.commercialPlan.findFirst({ where: { name: "الزخم" }, include: { prices: true } }),
  ]);
  if (!starter) throw new Error('لا توجد باقة "الانطلاقة" — شغّل هذا بعد A-phase');
  const starterSa = starter.prices.find((p) => p.market === "SA");
  const starterEg = starter.prices.find((p) => p.market === "EG");
  const momentumSa = momentum?.prices.find((p) => p.market === "SA");
  if (!starterSa || !starterEg) throw new Error("أسعار باقة الانطلاقة ناقصة");

  const now = new Date();

  // 1) SA · PAID — the exact numbers PAY-E4 closes with: 399 × 6 + 1 bonus month.
  const paidSnapshot = buildOrderSnapshot({
    plan: { id: starter.id, slug: starter.slug, name: starter.name, articlesPerMonth: starter.articlesPerMonth },
    price: { market: "SA", currency: "SAR", monthlyBase: starterSa.monthlyBase },
    term: { paidMonths: 6, bonusServiceMonths: 1 },
    vatRateBp: SA_VAT_RATE_BP,
  });
  const paidOrder = await db.checkoutOrder.create({
    data: {
      number: await nextOrderNumber(db),
      buyerName: "عميل اختبار — مدفوع",
      buyerEmail: `${TEST_EMAIL_PREFIX}paid@example.test`,
      buyerPhone: "+966500000001",
      businessName: "منشأة اختبار",
      country: "SA",
      ...paidSnapshot,
      status: "PAID",
      paidAt: now,
    },
  });
  await db.paymentTransaction.create({
    data: { orderId: paidOrder.id, provider: "NGENIUS", providerOrderRef: "TEST-NGENIUS-0001", status: "SUCCESS", amountMinor: paidSnapshot.totalMinor, currency: "SAR", rawStatus: "CAPTURED", settledAt: now },
  });
  await db.paymentWebhookEvent.create({
    data: { provider: "NGENIUS", providerEventId: `test-webhook-${paidOrder.id}`, orderId: paidOrder.id, eventType: "order.captured", payload: { test: true, orderReference: paidOrder.number }, receivedAt: now, processedAt: now },
  });

  // 2) SA · AWAITING_PAYMENT — gateway session open, one declined attempt already logged.
  const pendingSnapshot = buildOrderSnapshot({
    plan: { id: (momentum ?? starter).id, slug: (momentum ?? starter).slug, name: (momentum ?? starter).name, articlesPerMonth: (momentum ?? starter).articlesPerMonth },
    price: { market: "SA", currency: "SAR", monthlyBase: momentumSa?.monthlyBase ?? starterSa.monthlyBase },
    term: { paidMonths: 3, bonusServiceMonths: 0 },
    vatRateBp: SA_VAT_RATE_BP,
  });
  const pendingOrder = await db.checkoutOrder.create({
    data: {
      number: await nextOrderNumber(db),
      buyerName: "عميل اختبار — بانتظار الدفع",
      buyerEmail: `${TEST_EMAIL_PREFIX}pending@example.test`,
      buyerPhone: "+966500000002",
      country: "SA",
      ...pendingSnapshot,
      status: "AWAITING_PAYMENT",
    },
  });
  await db.paymentAttempt.create({ data: { orderId: pendingOrder.id, provider: "NGENIUS", reasonCode: "DO_NOT_HONOR", message: "البطاقة مرفوضة من البنك المُصدر" } });

  // 3) EG · AWAITING_TRANSFER — Egypt VAT is unmeasured (PAY-UNKNOWN #5), so this snapshot
  //    is built by hand with vatRateBp 0 (placeholder, not a real invoice number) instead of
  //    calling buildOrderSnapshot, which throws on purpose for market "EG".
  const egMonthlyMinor = starterEg.monthlyBase * 100;
  const egTotalMinor = egMonthlyMinor * 6;
  const transferOrder = await db.checkoutOrder.create({
    data: {
      number: await nextOrderNumber(db),
      buyerName: "عميل اختبار — تحويل بنكي",
      buyerEmail: `${TEST_EMAIL_PREFIX}transfer@example.test`,
      buyerPhone: "+201000000003",
      country: "EG",
      market: "EG",
      currency: "EGP",
      planId: starter.id,
      planSlug: starter.slug,
      planName: starter.name,
      articlesPerMonth: starter.articlesPerMonth,
      monthlyBaseMinor: egMonthlyMinor,
      paidMonths: 6,
      bonusServiceMonths: 1,
      subtotalMinor: egTotalMinor,
      vatRateBp: 0,
      vatMinor: 0,
      totalMinor: egTotalMinor,
      status: "AWAITING_TRANSFER",
    },
  });

  // 4) SA · FAILED — gateway declined twice, buyer gave up.
  const failedSnapshot = buildOrderSnapshot({
    plan: { id: starter.id, slug: starter.slug, name: starter.name, articlesPerMonth: starter.articlesPerMonth },
    price: { market: "SA", currency: "SAR", monthlyBase: starterSa.monthlyBase },
    term: { paidMonths: 3, bonusServiceMonths: 0 },
    vatRateBp: SA_VAT_RATE_BP,
  });
  const failedOrder = await db.checkoutOrder.create({
    data: {
      number: await nextOrderNumber(db),
      buyerName: "عميل اختبار — فشل",
      buyerEmail: `${TEST_EMAIL_PREFIX}failed@example.test`,
      buyerPhone: "+966500000004",
      country: "SA",
      ...failedSnapshot,
      status: "FAILED",
      failedReason: "انتهت مهلة الجلسة قبل إتمام الدفع",
    },
  });
  await db.paymentAttempt.createMany({
    data: [
      { orderId: failedOrder.id, provider: "NGENIUS", reasonCode: "INSUFFICIENT_FUNDS", message: "رصيد غير كافٍ" },
      { orderId: failedOrder.id, provider: "NGENIUS", reasonCode: "SESSION_EXPIRED", message: "انتهت مهلة الجلسة" },
    ],
  });

  // 5) CANCELLED and 6) REFUNDED — so every status has at least one row in the filter.
  const cancelledSnapshot = buildOrderSnapshot({
    plan: { id: starter.id, slug: starter.slug, name: starter.name, articlesPerMonth: starter.articlesPerMonth },
    price: { market: "SA", currency: "SAR", monthlyBase: starterSa.monthlyBase },
    term: { paidMonths: 3, bonusServiceMonths: 0 },
    vatRateBp: SA_VAT_RATE_BP,
  });
  await db.checkoutOrder.create({
    data: {
      number: await nextOrderNumber(db),
      buyerName: "عميل اختبار — ملغى",
      buyerEmail: `${TEST_EMAIL_PREFIX}cancelled@example.test`,
      buyerPhone: "+966500000005",
      country: "SA",
      ...cancelledSnapshot,
      status: "CANCELLED",
    },
  });

  const refundedSnapshot = buildOrderSnapshot({
    plan: { id: starter.id, slug: starter.slug, name: starter.name, articlesPerMonth: starter.articlesPerMonth },
    price: { market: "SA", currency: "SAR", monthlyBase: starterSa.monthlyBase },
    term: { paidMonths: 6, bonusServiceMonths: 1 },
    vatRateBp: SA_VAT_RATE_BP,
  });
  const refundedOrder = await db.checkoutOrder.create({
    data: {
      number: await nextOrderNumber(db),
      buyerName: "عميل اختبار — مسترد",
      buyerEmail: `${TEST_EMAIL_PREFIX}refunded@example.test`,
      buyerPhone: "+966500000006",
      country: "SA",
      ...refundedSnapshot,
      status: "REFUNDED",
      paidAt: now,
    },
  });
  await db.paymentTransaction.create({
    data: { orderId: refundedOrder.id, provider: "NGENIUS", providerOrderRef: "TEST-NGENIUS-0002", status: "REFUNDED", amountMinor: refundedSnapshot.totalMinor, currency: "SAR", rawStatus: "REFUNDED", settledAt: now },
  });

  console.log("طلبات الاختبار:");
  console.log("PAID:", paidOrder.number, paidOrder.id);
  console.log("AWAITING_PAYMENT:", pendingOrder.number, pendingOrder.id);
  console.log("AWAITING_TRANSFER:", transferOrder.number, transferOrder.id);
  console.log("FAILED:", failedOrder.number, failedOrder.id);
}

run()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
