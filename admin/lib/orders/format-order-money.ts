const MINOR_PER_MAJOR = 100; // halala / piastre — same convention as shared/lib/payments/build-order-snapshot.ts

/**
 * ar-SA for SAR, ar-EG for EGP — same convention as admin/lib/email/templates/invoice.ts.
 *
 * `maximumFractionDigits: 0` used to round every amount to the nearest whole riyal —
 * subtotal/vat/total on this screen are exactly the halala-precision figures E4's closing
 * evidence matches against (208174 minor → 2081.74, not 2082), so rounding them away here
 * hid real money (Fable, 11 Sep). `minimumFractionDigits: 0` keeps whole amounts clean
 * (2394 → "٢٬٣٩٤" not "٢٬٣٩٤٫٠٠").
 */
export function formatOrderMoney(amountMinor: number, currency: string): string {
  return new Intl.NumberFormat(currency === "SAR" ? "ar-SA" : "ar-EG", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amountMinor / MINOR_PER_MAJOR);
}
