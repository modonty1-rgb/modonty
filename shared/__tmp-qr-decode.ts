import { buildZatcaQrTlvBase64, decodeZatcaQrTlv } from "./lib/payments/zatca-qr-tlv";
(async () => {
  const b64 = buildZatcaQrTlvBase64({ sellerName: "شركة جبر الجنوبية للمقاولات", vatNumber: "311021705709003", timestamp: new Date("2026-09-11T19:13:11.522Z"), totalWithVat: 2394, vatTotal: 312.26 });
  console.log("base64 length:", b64.length);
  console.log("decoded:", JSON.stringify(decodeZatcaQrTlv(b64)));
})();
