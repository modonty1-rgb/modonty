import { writeFileSync } from "node:fs";
import { PrismaClient } from "@prisma/client";
import { invoiceEmail } from "@/lib/email/templates/invoice";
import { renderInvoiceQrPng } from "@/lib/invoices/render-invoice-qr";
import { buildZatcaQrTlvBase64 } from "@modonty/shared/lib/payments/zatca-qr-tlv";

const db = new PrismaClient();

async function main() {
  const order = await db.checkoutOrder.findFirst({ orderBy: { createdAt: "desc" } });
  if (!order) throw new Error("الطلب غير موجود");
  const s = await db.settings.findFirst({
    select: { orgLegalName: true, orgVatNumber: true, orgCommercialRegistrationNumber: true, orgStreetAddress: true, orgAddressLocality: true, orgAddressCountry: true },
  });

  const tpl = await invoiceEmail({
    clientName: order.buyerName,
    email: order.buyerEmail,
    invoiceNumber: "MOD-2026-00042",
    tierName: order.planName,
    periodLabel: `${order.paidMonths} أشهر`,
    amount: order.totalMinor / 100,
    currency: order.currency as "SAR" | "EGP",
    paymentStatus: "PAID",
    issuedAt: order.paidAt ?? new Date(),
    tax: {
      subtotal: order.subtotalMinor / 100, vatRateBp: order.vatRateBp, vat: order.vatMinor / 100,
      total: order.totalMinor / 100, paidMonths: order.paidMonths,
      bonusServiceMonths: order.bonusServiceMonths, orderNumber: order.number,
    },
    seller: {
      legalName: s?.orgLegalName ?? null, vatNumber: s?.orgVatNumber ?? null,
      crNumber: s?.orgCommercialRegistrationNumber ?? null,
      address: [s?.orgAddressCountry, s?.orgAddressLocality, s?.orgStreetAddress].filter(Boolean).join(" — ") || null,
    },
    buyer: { legalName: order.businessName, vatNumber: null, address: "SA — جدة" },
    commitments: order.planCommitments,
    qrCid: "zatca-qr",
  });

  const png = await renderInvoiceQrPng(buildZatcaQrTlvBase64({
    sellerName: s?.orgLegalName ?? "مُدَوَّنَتِي", vatNumber: s?.orgVatNumber ?? "",
    timestamp: order.paidAt ?? new Date(), totalWithVat: order.totalMinor / 100, vatTotal: order.vatMinor / 100,
  }));
  writeFileSync("../documents/tasks/invoice-preview.html", tpl.html.replace("cid:zatca-qr", "data:image/png;base64," + png.toString("base64")), "utf8");
  console.log("✓ الفاتورة");
  await db.$disconnect();
}
main();
