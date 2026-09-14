/** يعرض قالب الفاتورة ببيانات الطلب الحقيقي — قراءة فقط، لا يكتب في القاعدة. */
import { writeFileSync } from "node:fs";
import { PrismaClient } from "@prisma/client";
import { invoiceEmail } from "./lib/email/templates/invoice";

const db = new PrismaClient();
const order = await db.checkoutOrder.findUnique({ where: { id: "6aa700a4455717416eee6bc5" } });
if (!order) throw new Error("الطلب غير موجود");

const settings = await db.settings.findFirst({
  select: { orgLegalName: true, orgVatNumber: true, orgCrNumber: true, orgAddress: true },
}).catch(() => null);

const tpl = await invoiceEmail({
  clientName: order.buyerName,
  email: order.buyerEmail,
  invoiceNumber: "MOD-2026-PREVIEW",
  tierName: order.planName,
  periodLabel: `${order.paidMonths} أشهر`,
  amount: order.totalMinor / 100,
  currency: order.currency as "SAR" | "EGP",
  paymentStatus: "PAID",
  issuedAt: order.paidAt ?? new Date(),
  tax: {
    subtotal: order.subtotalMinor / 100,
    vatRateBp: order.vatRateBp,
    vat: order.vatMinor / 100,
    total: order.totalMinor / 100,
    paidMonths: order.paidMonths,
    bonusServiceMonths: order.bonusServiceMonths,
    orderNumber: order.number,
  },
  seller: {
    legalName: settings?.orgLegalName ?? null,
    vatNumber: settings?.orgVatNumber ?? null,
    crNumber: settings?.orgCrNumber ?? null,
    address: settings?.orgAddress ?? null,
  },
  buyer: { legalName: order.businessName, vatNumber: null, address: null },
});

writeFileSync("../invoice-preview.html", tpl.html, "utf8");
console.log("الموضوع:", tpl.subject);
console.log("الطول:", tpl.html.length, "حرفاً · كُتب في invoice-preview.html");
console.log("بيانات البائع من الإعدادات:", JSON.stringify(settings));
await db.$disconnect();
