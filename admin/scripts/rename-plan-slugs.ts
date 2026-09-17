/**
 * سلَقٌ ذو معنى للباقات — بدل الهاش الذي وُلد معها.
 *
 * `plan-4e07fc71` لا يقول شيئاً: لا للمطوّر في الكود، ولا للعميل في رابط الدفع
 * (`/sa/checkout?plan=plan-4e07fc71`). وهو سببُ بقاء `SubscriptionTier`: الكود لم يجد
 * مفتاحاً مقروءاً يربط به الباقة، فاستعمل الإنم وسيطاً — والإنم أربع قيمٍ للأبد.
 *
 * يُبدَّل السلَق، ويُحدَّث معه كلُّ طلبٍ يحمل لقطتَه (`CheckoutOrder.planSlug`) حتى لا
 * يفترق سجلٌّ ماليّ عن كتالوجه. بيئةُ تطويرٍ فقط — يرفض أي قاعدةٍ غير modonty_dev.
 */
import fs from "node:fs";
import path from "node:path";

const line = fs.readFileSync(path.resolve(__dirname, "../../shared/.env.local"), "utf8")
  .split("\n").find((l) => /^\s*DATABASE_URL\s*=/.test(l));
if (!line) throw new Error("DATABASE_URL not found");
const url = line.replace(/^\s*DATABASE_URL\s*=\s*/, "").trim().replace(/^"|"$/g, "");
if (!/\/modonty_dev(\?|$)/.test(url)) throw new Error("refusing: DATABASE_URL is not modonty_dev");
process.env.DATABASE_URL = url;

import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();

/** الاسم العربيّ → سلَقٌ لاتينيّ مقروء. يُقرأ في الرابط وفي الكود معاً. */
const SLUG_BY_NAME: Record<string, string> = {
  "الانطلاقة": "intilaqa",
  "الزخم": "zakham",
  "الريادة": "riyada",
};

(async () => {
  const plans = await db.commercialPlan.findMany({ select: { id: true, slug: true, name: true } });
  console.log("قبل:", JSON.stringify(plans.map((p) => `${p.name} = ${p.slug}`)));

  let planCount = 0;
  let orderCount = 0;
  for (const p of plans) {
    const next = SLUG_BY_NAME[p.name];
    if (!next) { console.log(`  ✗ بلا خريطة: «${p.name}» — تُرك كما هو`); continue; }
    if (next === p.slug) continue;

    const taken = await db.commercialPlan.findFirst({ where: { slug: next, id: { not: p.id } }, select: { id: true } });
    if (taken) { console.log(`  ✗ السلَق «${next}» مستعمَل — تُرك`); continue; }

    await db.commercialPlan.update({ where: { id: p.id }, data: { slug: next } });
    planCount++;
    // اللقطة على الطلبات تتبع الكتالوج: سجلٌّ ماليّ يشير لسلَقٍ لا وجود له لا يُقرأ.
    const r = await db.checkoutOrder.updateMany({ where: { planSlug: p.slug }, data: { planSlug: next } });
    orderCount += r.count;
    console.log(`  ✓ ${p.name}: ${p.slug} → ${next}  (طلبات محدَّثة: ${r.count})`);
  }

  console.log(`\nباقات: ${planCount} · طلبات: ${orderCount}`);
  console.log("بعد:", JSON.stringify((await db.commercialPlan.findMany({ select: { slug: true, name: true } })).map((p) => `${p.name} = ${p.slug}`)));
  const orphan = await db.checkoutOrder.count({ where: { planSlug: { startsWith: "plan-" } } });
  console.log("طلباتٌ ما زالت على الهاش:", orphan);
  await db.$disconnect();
})();
