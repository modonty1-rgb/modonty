import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();
const SA = {
  vatNote: "شامل ضريبة القيمة المضافة ١٥٪",
  installmentLabel: "قسّطها على دفعات",
  refundNote: "استرداد ١٤ يوم — لو ما فعّلنا حسابك",
  paymentFootnote: "الدفع بالبطاقة عبر بوابة معتمدة · والتقسيط عبر تمارا",
  paymentFootnoteSub: "Network International · PCI DSS",
  payMarks: ["mada", "visa", "mastercard"],
  installmentMark: "tamara",
};
const EG = { vatNote: null, installmentLabel: null, refundNote: null, paymentFootnote: null, paymentFootnoteSub: null, payMarks: [], installmentMark: null };
await db.paySectionContent.upsert({ where: { market: "SA" }, create: { market: "SA", trustItems: [], ...SA }, update: SA });
await db.paySectionContent.upsert({ where: { market: "EG" }, create: { market: "EG", trustItems: [], ...EG }, update: EG });
const rows = await db.paySectionContent.findMany({ select: { market: true, vatNote: true, refundNote: true, payMarks: true, installmentMark: true } });
rows.forEach((r) => console.log(" ", r.market, "| ضريبة:", r.vatNote ?? "—", "| ضمان:", r.refundNote ? "نعم" : "—", "| شعارات:", r.payMarks.join(",") || "—", "| تقسيط:", r.installmentMark ?? "—"));
await db.$disconnect();
