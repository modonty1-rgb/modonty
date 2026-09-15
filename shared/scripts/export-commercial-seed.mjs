/**
 * يصدّر بيانات مسار الدفع الحالية إلى `shared/data/commercial-seed.json`.
 *
 * ── ليش موجود (خالد ١٥ سبتمبر ٢٠٢٦) ──
 * «أبغاها تكون في ملف جيسون عشان لما نطلع البرودكشن نعمل لود ديفولت». قاعدة الإنتاج
 * تبدأ فارغة، وصفحة الدفع لا تُرسم بلا الجداول الستّة كلّها — فبلا بذرةٍ جاهزة يُعاد
 * إدخال ١٧ ميزة وثلاث باقات وأسعار سوقين ونصوص ثلاثة أسواق باليد، وأي سطرٍ يسقط يظهر
 * نقصاً في صفحةٍ يدفع فيها الناس.
 *
 * ── ولا `_id` في الملفّ ──
 * الروابط كلّها بالـ**slug** و**السوق** و`paidMonths` — مفاتيح يقرأها الإنسان ويكتبها.
 * ومعرّفات مونغو تُولَّد عند الزرع، فحفظها يعني بذرةً تنكسر على أوّل قاعدةٍ جديدة، وتُظهر
 * فروقاً في `git diff` لا تعني شيئاً.
 *
 * التشغيل: `node shared/scripts/export-commercial-seed.mjs`
 * بعد كل تغييرٍ تريد أن يصير هو الافتراضيّ للإنتاج.
 */

import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { PrismaClient } from "@prisma/client";

const here = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(here, "../data/commercial-seed.json");

const db = new PrismaClient();

/** يحذف المفاتيح الفارغة كي لا يمتلئ الملفّ بـ`null` لا تعني شيئاً. */
const clean = (o) =>
  Object.fromEntries(
    Object.entries(o).filter(([, v]) => v !== null && v !== undefined && !(Array.isArray(v) && v.length === 0)),
  );

const features = await db.commercialFeature.findMany({
  orderBy: { displayOrder: "asc" },
  select: {
    name: true, description: true, unitLabel: true, isActive: true,
    isHighlighted: true, billable: true, displayOrder: true,
  },
});

const plans = await db.commercialPlan.findMany({
  orderBy: { displayOrder: "asc" },
  select: {
    slug: true, name: true, articlesPerMonth: true, highlights: true, badge: true,
    hook: true, ctaText: true, featuredBadge: true, tier: true, theme: true,
    isPublished: true, displayOrder: true,
    prices: {
      orderBy: { market: "asc" },
      select: { market: true, currency: true, monthlyBase: true, isActive: true },
    },
    features: {
      orderBy: { displayOrder: "asc" },
      select: {
        quantity: true, note: true, displayOrder: true,
        // الميزة تُربط باسمها لا بمعرّفها — الاسم هو مفتاحها في المكتبة.
        feature: { select: { name: true } },
      },
    },
  },
});

const terms = await db.commercialTermPolicy.findMany({
  orderBy: { displayOrder: "asc" },
  select: { paidMonths: true, bonusServiceMonths: true, displayOrder: true, isActive: true, isRecommended: true },
});

const content = await db.paySectionContent.findMany({
  orderBy: { market: "asc" },
  select: {
    market: true, announcement: true, headline: true, subheadline: true, trustItems: true,
    vatNote: true, installmentLabel: true, refundNote: true,
    paymentFootnote: true, paymentFootnoteSub: true, payMarks: true, installmentMark: true,
    teamHeadline: true, teamSubheadline: true,
  },
});

const seed = {
  /** يُقرأ عند الزرع للتحذير من بذرةٍ وُلّدت بمخطّطٍ أقدم. */
  version: 1,
  exportedAt: new Date().toISOString().slice(0, 10),
  source: "modonty_dev",
  features: features.map(clean),
  plans: plans.map((p) =>
    clean({
      ...p,
      prices: p.prices.map(clean),
      features: p.features.map((f) => clean({ featureName: f.feature.name, quantity: f.quantity, note: f.note, displayOrder: f.displayOrder })),
    }),
  ),
  terms: terms.map(clean),
  paySectionContent: content.map(clean),
};

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, JSON.stringify(seed, null, 2) + "\n", "utf8");

console.log(
  `OK  features=${seed.features.length}  plans=${seed.plans.length}` +
    `  prices=${seed.plans.reduce((n, p) => n + (p.prices?.length ?? 0), 0)}` +
    `  assignments=${seed.plans.reduce((n, p) => n + (p.features?.length ?? 0), 0)}` +
    `  terms=${seed.terms.length}  content=${seed.paySectionContent.length}`,
);
console.log("->", OUT);

await db.$disconnect();
