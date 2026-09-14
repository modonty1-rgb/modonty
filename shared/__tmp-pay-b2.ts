import { PrismaClient } from "@prisma/client";
import { buildOrderSnapshot } from "./lib/payments/build-order-snapshot";
import { vatRateBpForMarket } from "./lib/payments/vat-rate";
import { nextOrderNumber } from "./lib/payments/next-order-number";

(async () => {
const snap = buildOrderSnapshot({
  plan: { id: "000000000000000000000000", slug: "test", name: "اختبار", tier: "STANDARD", articlesPerMonth: 4 },
  price: { market: "SA", currency: "SAR", monthlyBase: 399 },
  term: { paidMonths: 6, bonusServiceMonths: 1 },
  vatRateBp: vatRateBpForMarket("SA"),
});
console.log("B2 snapshot 399×6+1:", JSON.stringify({ totalMinor: snap.totalMinor, subtotalMinor: snap.subtotalMinor, vatMinor: snap.vatMinor, paidMonths: snap.paidMonths, bonusServiceMonths: snap.bonusServiceMonths, vatRateBp: snap.vatRateBp }));
console.log("B2 check sum:", snap.subtotalMinor + snap.vatMinor === snap.totalMinor);
try { vatRateBpForMarket("EG"); } catch (e) { console.log("B2 EG throws:", (e as Error).message); }
const db = new PrismaClient();
const n1 = await nextOrderNumber(db); const n2 = await nextOrderNumber(db);
console.log("B2 order numbers:", n1, n2);
await db.$disconnect();
})();
