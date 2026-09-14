import { buildZatcaQrTlvBase64, decodeZatcaQrTlv } from "@modonty/shared/lib/payments/zatca-qr-tlv";
// قيم فاتورة MOD-2026-00017 كما ظهرت في الشاشة الحيّة
const b64 = buildZatcaQrTlvBase64({
  sellerName: "مُدَوَّنَتِي",
  vatNumber: "311111111111113",
  timestamp: new Date("2026-09-11T22:13:00.000Z"),
  totalWithVat: 2394,
  vatTotal: 312.26,
});
console.log("طول Base64:", b64.length, "(الحدّ ٧٠٠)");
console.log(b64);
console.log("الوسوم المفكوكة:");
for (const t of decodeZatcaQrTlv(b64)) console.log("  tag", t.tag, "=", JSON.stringify(t.value));
