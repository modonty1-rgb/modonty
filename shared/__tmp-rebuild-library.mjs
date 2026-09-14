import fs from "node:fs";
import { PrismaClient } from "@prisma/client";

/**
 * إعادة بناء مكتبة المزايا بمحتوى بطاقات jbrseo.com/sa حرفياً (خالد ١٣ سبتمبر ٢٠٢٦:
 * «ألغِ اللي موجود الآن في المكتبة وجيب اللي في جبر سيو»).
 *
 * المصدر: الصفحة الحيّة — سطور البطاقات المرسومة + حمولة RSC التي تحمل صفوف `Plan`
 * الحقيقية (tagline · hook · ctaText · badge · featuredBadge · highlights).
 *
 * نسخة احتياطية تُكتب قبل أي حذف، فالعودة ممكنة بصفّ واحد.
 */

const db = new PrismaClient();

const P = { START: "الانطلاقة", MOM: "الزخم", LEAD: "الريادة" };

/** مزايا المكتبة بنصّ جبر سيو — الاسم · الوحدة · الكمّية لكل باقة. */
const LIBRARY = [
  { name: "مقالات على مدونتي", unit: "مقال/شهر", q: { [P.START]: 4, [P.MOM]: 8, [P.LEAD]: 12 } },
  { name: "مقالات على موقعك", unit: "مقال/شهر", q: { [P.MOM]: 3, [P.LEAD]: 4 } },
  { name: "طلّات مدونتي", unit: "صورة أو فيديو/شهر", q: { [P.START]: 4, [P.MOM]: 8, [P.LEAD]: 12 } },
  { name: "صفحة عميل احترافية (بديل موقع إلكتروني)", unit: null, q: { [P.START]: null, [P.MOM]: null, [P.LEAD]: null } },
  { name: "نشر على منصة مدونتي", unit: null, q: { [P.START]: null, [P.MOM]: null, [P.LEAD]: null } },
  { name: "المقال الرئيسي ينشر على حسابات مدونتي", unit: null, q: { [P.START]: null, [P.MOM]: null, [P.LEAD]: null } },
  { name: "شارة «موثّق» + بيانات قانونية", unit: null, q: { [P.START]: null, [P.MOM]: null, [P.LEAD]: null } },
  { name: "زر واتساب + سؤال مباشر تحت المقال", unit: null, q: { [P.START]: null, [P.MOM]: null, [P.LEAD]: null } },
  { name: "رابط لموقعك الخاص", unit: null, q: { [P.MOM]: null, [P.LEAD]: null } },
  { name: "نظام حجوزات «احجز الآن»", unit: null, q: { [P.MOM]: null, [P.LEAD]: null } },
  { name: "حملات إيميل شهرياً — الإيميلات من عندك", unit: "حملة/شهر", q: { [P.MOM]: 4, [P.LEAD]: 8 } },
  { name: "محتواك جاهز للذكاء الاصطناعي", unit: null, q: { [P.MOM]: null, [P.LEAD]: null } },
  { name: "توثيق مؤهلات الكاتب (طبي/مالي/قانوني)", unit: null, q: { [P.MOM]: null, [P.LEAD]: null } },
  { name: "مدير حساب مخصص لك", unit: null, q: { [P.LEAD]: null } },
  { name: "تقرير شامل لموقعك — مشاكل السيو وحلولها", unit: null, q: { [P.LEAD]: null } },
  { name: "تنبيهات تيليجرام — تعرف بأي حدث لحظتها", unit: "تنبيه", q: { [P.LEAD]: 22 } },
  { name: "جلسة استراتيجية ربع سنوية", unit: null, q: { [P.LEAD]: null } },
];

/** صفوف `Plan` كما هي في قاعدة جبر سيو (من حمولة RSC). */
const PLAN_COPY = {
  [P.START]: {
    hook: "احنا نكتب وننشر، الزبون يجيك من جوجل لحاله",
    ctaText: "ابدأ الحين",
    badge: null,
    featuredBadge: null,
    highlights: [
      "نكتب + نصمم + ١ فيديو شهرياً — كل المحتوى البصري عنا",
      "نشر على modonty.com + قنواتنا الرسمية: X · Meta · LinkedIn",
      "تحسين تقني آلي + الظهور المحلي على خرائط جوجل",
      "تيليجرام (٥ تنبيهات): زيارة · اشتراك · تعليق · مشاركة · مقال جديد",
      "نجمع لك المشتركين تلقائياً من زوار مقالاتك",
      "شغلك الوحيد: افتح لوحة التحكم، اعتمد — احنا البقية",
    ],
  },
  [P.MOM]: {
    hook: "نعرّفك على العميل الجاهز للشراء قبل غيرك",
    ctaText: "ابدأ الحين",
    badge: null,
    featuredBadge: "الأكثر اختياراً ✦",
    highlights: [
      "تقييم ذكي للزوار (٠-١٠٠) — اعرف الجاهز للشراء قبل ما يكلّمك",
      "تيليجرام (١٢ تنبيه بدل ٥) — يشمل عميل جاهز للشراء + تعبئة نماذج",
      "٢ فيديو شهرياً (بدل ١)",
      "تحليلات معمّقة + توصيات ذكية (أفضل يوم للنشر · وقت الذروة)",
      "إيميلات آلية موجّهة لزوّارك حسب سلوكهم (حتى ٢٠٠٠ مشترك)",
      "ظهورك في البحث الذكي (ChatGPT · Perplexity)",
    ],
  },
  [P.LEAD]: {
    hook: "فريق متفرّغ يشتغل معاك — أنت تركّز على البيع",
    ctaText: "ابدأ الحين",
    badge: "للمؤسسات",
    featuredBadge: null,
    highlights: [
      "مدير حساب خاص يتابع نشاطك ويوافيك بتقارير شهرية",
      "تيليجرام (٢٢ تنبيه كامل) + توجيه ذكي للأحداث الحرجة",
      "٣ فيديو شهرياً (بدل ٢)",
      "فحص موقعك الخارجي بشكل مستمر (٢٦+ فحص: أمان · محركات البحث · أداء · إعدادات النطاق)",
      "تخصيصات حسب احتياج موقعك ومتجرك",
      "متخصّص للقطاعات الحساسة (طبي · مالي · قانوني) + دعم ٢٤/٧ + صلاحيات فريق",
    ],
  },
};

const run = async () => {
  // ── نسخة احتياطية قبل أي حذف ───────────────────────────────────────────────
  const backup = {
    at: new Date().toISOString(),
    features: await db.commercialFeature.findMany(),
    links: await db.commercialPlanFeature.findMany(),
    plans: await db.commercialPlan.findMany({ select: { id: true, name: true, hook: true, ctaText: true, badge: true, featuredBadge: true, highlights: true } }),
  };
  const path = "__backup-library-before-jbrseo.json";
  fs.writeFileSync(path, JSON.stringify(backup, null, 2));
  console.log("نسخة احتياطية:", path, "—", backup.features.length, "ميزة ·", backup.links.length, "رابط");

  // ── مسح المكتبة القديمة بالكامل ────────────────────────────────────────────
  const delLinks = await db.commercialPlanFeature.deleteMany({});
  const delFeatures = await db.commercialFeature.deleteMany({});
  console.log("حُذف:", delLinks.count, "رابط ·", delFeatures.count, "ميزة");

  // ── بناء المكتبة الجديدة ───────────────────────────────────────────────────
  const plans = await db.commercialPlan.findMany({ select: { id: true, name: true } });
  const planId = Object.fromEntries(plans.map((p) => [p.name, p.id]));

  let order = 0;
  let links = 0;
  for (const item of LIBRARY) {
    const feature = await db.commercialFeature.create({
      data: { name: item.name, unitLabel: item.unit, displayOrder: order, isActive: true },
    });
    for (const [plan, quantity] of Object.entries(item.q)) {
      const pid = planId[plan];
      if (!pid) { console.log("!! باقة غير موجودة:", plan); continue; }
      await db.commercialPlanFeature.create({
        data: { planId: pid, featureId: feature.id, quantity, displayOrder: order },
      });
      links += 1;
    }
    order += 1;
  }
  console.log("أُنشئ:", LIBRARY.length, "ميزة ·", links, "رابط");

  // ── نصوص الباقات بنصّ جبر سيو ──────────────────────────────────────────────
  for (const [name, copy] of Object.entries(PLAN_COPY)) {
    const pid = planId[name];
    if (!pid) continue;
    await db.commercialPlan.update({ where: { id: pid }, data: copy });
  }
  console.log("حُدّثت نصوص الباقات الثلاث (hook · ctaText · badge · featuredBadge · highlights)");

  // ── القراءة النهائية ───────────────────────────────────────────────────────
  const after = await db.commercialPlan.findMany({
    orderBy: { displayOrder: "asc" },
    select: { name: true, articlesPerMonth: true, featuredBadge: true, badge: true, highlights: true, _count: { select: { features: true } } },
  });
  console.log("");
  after.forEach((p) =>
    console.log(" ", p.name.padEnd(10), "مزايا:", String(p._count.features).padStart(2), "· سطور مميّزة:", p.highlights.length, "· مقالات/شهر:", p.articlesPerMonth, "· شارات:", [p.badge, p.featuredBadge].filter(Boolean).join(" / ") || "—"),
  );
  await db.$disconnect();
};

run().catch((e) => { console.error(e.message); process.exit(1); });
