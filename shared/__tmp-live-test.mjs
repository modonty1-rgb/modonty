import { PrismaClient } from "@prisma/client";

/**
 * اختبار حيّ (١٣ سبتمبر ٢٠٢٦): ربط مزايا الكتالوج بالباقات بنفس ما تعرضه بطاقات جبر سيو
 * الحيّة على jbrseo.com/sa — مقروءاً من الصفحة نفسها لا من الذاكرة.
 *
 * بياناتٌ قابلة للمسح، لا نصّ نهائي: الغرض أن يرى خالد بطاقاتنا بمحتوى حقيقي ويقارنها.
 */

const db = new PrismaClient();

// ما قرأته حرفياً من بطاقات jbrseo.com/sa (١٣ سبتمبر ٢٠٢٦):
//   الانطلاقة: صفحة عميل · نشر على مدونتي · المقال الرئيسي على سوشال · شارة موثّق ·
//              زر واتساب + سؤال مباشر · ٤ مقالات/شهر · ٤ طلّات/شهر
//   الزخم    : + رابط لموقعك · حجوزات · ٤ حملات إيميل · محتوى للذكاء الاصطناعي ·
//              توثيق مؤهلات الكاتب · ٨ مقالات · ٣ مقالات لموقعك · ٨ طلّات
//   الريادة  : + مدير حساب · ٨ حملات إيميل · تقرير شامل · ٢٢ تنبيه تيليجرام ·
//              جلسة استراتيجية · ١٢ مقالاً · ٤ مقالات لموقعك · ١٢ طلّة
const PLAN = { START: "الانطلاقة", MOMENTUM: "الزخم", LEAD: "الريادة" };

/** اسم الميزة عندنا → { اسم الباقة: الكمّية (أو null حين لا كمّية) } */
const MAP = {
  "صفحة عميل عامة": { [PLAN.START]: null, [PLAN.MOMENTUM]: null, [PLAN.LEAD]: null },
  "النشر على منصة مدونتي": { [PLAN.START]: null, [PLAN.MOMENTUM]: null, [PLAN.LEAD]: null },
  "مقالات منشورة على مدونتي": { [PLAN.START]: 4, [PLAN.MOMENTUM]: 8, [PLAN.LEAD]: 12 },
  "نشر المقال الرئيسي على سوشال مدونتي": { [PLAN.START]: 1, [PLAN.MOMENTUM]: 1, [PLAN.LEAD]: 1 },
  "طلّات مدونتي": { [PLAN.START]: 4, [PLAN.MOMENTUM]: 8, [PLAN.LEAD]: 12 },
  "شارة موثّق وبيانات قانونية": { [PLAN.START]: null, [PLAN.MOMENTUM]: null, [PLAN.LEAD]: null },
  "زر واتساب في صفحة العميل": { [PLAN.START]: null, [PLAN.MOMENTUM]: null, [PLAN.LEAD]: null },
  "سؤال مباشر تحت المقال": { [PLAN.START]: null, [PLAN.MOMENTUM]: null, [PLAN.LEAD]: null },
  "موافقة العميل قبل النشر": { [PLAN.START]: null, [PLAN.MOMENTUM]: null, [PLAN.LEAD]: null },

  // تبدأ من الزخم
  "رابط خارجي لموقع العميل": { [PLAN.MOMENTUM]: null, [PLAN.LEAD]: null },
  "مقالات لموقع العميل عبر الربط البرمجي": { [PLAN.MOMENTUM]: 3, [PLAN.LEAD]: 4 },
  "نظام حجوزات احجز الآن": { [PLAN.MOMENTUM]: null, [PLAN.LEAD]: null },
  "حملات إيميل للعملاء": { [PLAN.MOMENTUM]: 4, [PLAN.LEAD]: 8 },
  "محتوى جاهز للذكاء الاصطناعي": { [PLAN.MOMENTUM]: null, [PLAN.LEAD]: null },
  "توثيق مؤهلات الكاتب": { [PLAN.MOMENTUM]: null, [PLAN.LEAD]: null },

  // الريادة وحدها
  "مدير حساب مخصص": { [PLAN.LEAD]: 1 },
  "جلسة استراتيجية مع مدير الحساب": { [PLAN.LEAD]: 1 },
  "تنبيهات تيليجرام": { [PLAN.LEAD]: 22 },
  "تقارير مباشرة في اللوحة": { [PLAN.LEAD]: null },
};

const run = async () => {
  const plans = await db.commercialPlan.findMany({ select: { id: true, name: true } });
  const planId = Object.fromEntries(plans.map((p) => [p.name, p.id]));

  const features = await db.commercialFeature.findMany({ select: { id: true, name: true } });
  const featureId = Object.fromEntries(features.map((f) => [f.name, f.id]));

  const missing = Object.keys(MAP).filter((name) => !featureId[name]);
  if (missing.length) console.log("!! مزايا في الخريطة بلا مقابل في المكتبة:", missing.join(" · "));

  let links = 0;
  let order = 0;
  for (const [featureName, byPlan] of Object.entries(MAP)) {
    const fid = featureId[featureName];
    if (!fid) continue;
    order += 1;
    for (const [planName, quantity] of Object.entries(byPlan)) {
      const pid = planId[planName];
      if (!pid) { console.log("!! باقة غير موجودة:", planName); continue; }
      await db.commercialPlanFeature.upsert({
        where: { planId_featureId: { planId: pid, featureId: fid } },
        create: { planId: pid, featureId: fid, quantity, displayOrder: order },
        update: { quantity, displayOrder: order },
      });
      links += 1;
    }
  }

  console.log("روابط مكتوبة:", links);
  for (const p of plans) {
    const n = await db.commercialPlanFeature.count({ where: { planId: p.id } });
    console.log("  " + p.name.padEnd(10) + " مزايا مربوطة: " + n);
  }
  const unlinked = features.filter((f) => !MAP[f.name]).map((f) => f.name);
  console.log("\nمزايا بلا ربط (لا دليل لها على بطاقات جبر سيو) — " + unlinked.length + ":");
  unlinked.forEach((n) => console.log("  · " + n));
  await db.$disconnect();
};

run().catch((e) => { console.error(e.message); process.exit(1); });
