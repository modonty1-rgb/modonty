import { buildZatcaQrTlvBase64, decodeZatcaQrTlv } from "@modonty/shared/lib/payments/zatca-qr-tlv";

const b64 = buildZatcaQrTlvBase64({
  sellerName: "شركة جبر الجنوبية للمقاولات",
  vatNumber: "311021705709003",
  timestamp: new Date("2026-09-13T19:59:54Z"),
  totalWithVat: 7194,
  vatTotal: 938.35,
});
const names: Record<number, string> = { 1: "اسم البائع", 2: "الرقم الضريبي", 3: "تاريخ ووقت الفاتورة", 4: "الإجمالي شامل الضريبة", 5: "مقدار الضريبة" };
console.log("الطول:", b64.length, "حرفاً (الحدّ ٧٠٠)");
console.log("محتوى الرمز بعد فكّه:");
for (const { tag, value } of decodeZatcaQrTlv(b64)) console.log("  وسم", tag, "·", (names[tag] ?? "?").padEnd(22), "=", value);
