const MINOR_PER_MAJOR = 100; // halala / piastre — same convention as shared/lib/payments/build-order-snapshot.ts

/** ar-SA for SAR, ar-EG for EGP — same convention as admin/lib/email/templates/invoice.ts. */
export function formatOrderMoney(amountMinor: number, currency: string): string {
  return new Intl.NumberFormat(currency === "SAR" ? "ar-SA" : "ar-EG", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amountMinor / MINOR_PER_MAJOR);
}
