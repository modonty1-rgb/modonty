import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();

// السبعة التي لا وجود لها على بطاقات jbrseo.com/sa (مقروءة من الصفحة الحيّة ١٣ سبتمبر ٢٠٢٦)
const EXTRA = [
  "بحث الكلمات المفتاحية",
  "صور احترافية وبطاقات مشاركة",
  "آراء وتقييمات العملاء",
  "صلاحية Google Search Console",
  "مدة الرد على الاستفسارات",
  "سرعة تجهيز المقال",
  "تجهيز فني كامل للمقال",
];

const run = async () => {
  // حارس: لا تُوقَف ميزة مربوطة بباقة — إيقافها يسحب سطراً من بطاقة منشورة بلا أن يُلاحظ أحد.
  const linked = await db.commercialPlanFeature.findMany({
    where: { feature: { name: { in: EXTRA } } },
    select: { feature: { select: { name: true } } },
  });
  if (linked.length > 0) {
    console.log("!! موقوف: هذه مربوطة بباقات —", [...new Set(linked.map((l) => l.feature.name))].join(" · "));
    process.exit(1);
  }

  const res = await db.commercialFeature.updateMany({ where: { name: { in: EXTRA } }, data: { isActive: false } });
  console.log("أُوقفت:", res.count, "من", EXTRA.length);

  const all = await db.commercialFeature.findMany({ orderBy: { displayOrder: "asc" }, select: { name: true, isActive: true } });
  console.log("المكتبة: مفعَّلة", all.filter((f) => f.isActive).length, "· موقوفة", all.filter((f) => !f.isActive).length);
  console.log("\nالموقوفة:");
  all.filter((f) => !f.isActive).forEach((f) => console.log("  · " + f.name));
  await db.$disconnect();
};
run().catch((e) => { console.error(e.message); process.exit(1); });
