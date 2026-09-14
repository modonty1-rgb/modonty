import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();
const COUNTS = { "الانطلاقة": 8, "الزخم": 12, "الريادة": 16 };
const run = async () => {
  const plans = await db.commercialPlan.findMany({ select: { id: true, name: true } });
  const feature = await db.commercialFeature.findFirst({ where: { name: "مقالات منشورة على مدونتي" }, select: { id: true } });
  for (const p of plans) {
    const n = COUNTS[p.name];
    if (n === undefined) { console.log("!! بلا رقم:", p.name); continue; }
    await db.commercialPlan.update({ where: { id: p.id }, data: { articlesPerMonth: n } });
    if (feature) {
      await db.commercialPlanFeature.updateMany({ where: { planId: p.id, featureId: feature.id }, data: { quantity: n } });
    }
  }
  const after = await db.commercialPlan.findMany({
    select: { name: true, articlesPerMonth: true, features: { where: { featureId: feature?.id }, select: { quantity: true } } },
    orderBy: { displayOrder: "asc" },
  });
  after.forEach((p) => console.log(" ", p.name.padEnd(10), "articlesPerMonth:", String(p.articlesPerMonth).padEnd(4), "كمّية الميزة:", p.features[0]?.quantity ?? "—"));
  await db.$disconnect();
};
run().catch((e) => { console.error(e.message); process.exit(1); });
