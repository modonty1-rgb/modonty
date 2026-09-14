import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();
const Q = { "الانطلاقة": 8, "الزخم": 12, "الريادة": 16 };
const f = await db.commercialFeature.findFirst({ where: { name: "مقالات على مدونتي" }, select: { id: true } });
if (!f) { console.error("الميزة غير موجودة"); process.exit(1); }
const plans = await db.commercialPlan.findMany({ select: { id: true, name: true } });
for (const p of plans) {
  const q = Q[p.name];
  if (q === undefined) continue;
  await db.commercialPlanFeature.updateMany({ where: { planId: p.id, featureId: f.id }, data: { quantity: q } });
  await db.commercialPlan.update({ where: { id: p.id }, data: { articlesPerMonth: q } });
}
const after = await db.commercialPlan.findMany({
  orderBy: { displayOrder: "asc" },
  select: { name: true, articlesPerMonth: true, features: { where: { featureId: f.id }, select: { quantity: true } } },
});
after.forEach((p) => console.log(" ", p.name.padEnd(10), "حقل المقالات:", String(p.articlesPerMonth).padEnd(4), "· كمّية الميزة:", p.features[0]?.quantity ?? "—"));
await db.$disconnect();
