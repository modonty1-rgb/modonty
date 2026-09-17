/**
 * بذرُ طلباتٍ للعملاء القائمين — بيانات اختبارٍ تُحاكي ما سينتجه الترحيل الحقيقيّ.
 *
 * لماذا: الكونسول وكرت العميل صارا يقرآن السعر والمدّة واسم الباقة من **الطلب الساري**
 * (MONEY-FLOW · قاعدة المصدر الواحد). وعلى `modonty_dev` عميلٌ واحد فقط له طلب — وهي
 * بيانات اختبارٍ من صنعنا، لا قيدٌ على التصميم. فبدل احتياطيٍّ في الكود يشقّ مصدر
 * الحقيقة، يُزرع الناقص هنا ويُفحص الشكل النهائيّ على بياناتٍ حقيقيّة البنية.
 *
 * المبالغ تُحسب بـ`buildOrderSnapshot` نفسها التي تستعملها صفحة الدفع — لا حساب موازٍ،
 * وإلّا اختبرنا رياضياتٍ غير التي تعمل في الإنتاج.
 *
 *   pnpm exec tsx scripts/seed-orders-for-clients.ts          بذر
 *   pnpm exec tsx scripts/seed-orders-for-clients.ts --clean  حذف ما زُرع
 *
 * كل صفٍّ يحمل `notes: SEED_TAG` ليُحذف بأمان، ولا يُمسّ طلبٌ لم يزرعه هذا السكربت.
 */
import fs from "node:fs";
import path from "node:path";

const line = fs
  .readFileSync(path.resolve(__dirname, "../../shared/.env.local"), "utf8")
  .split("\n")
  .find((l) => /^\s*DATABASE_URL\s*=/.test(l));
if (!line) throw new Error("DATABASE_URL not found");
const url = line.replace(/^\s*DATABASE_URL\s*=\s*/, "").trim().replace(/^"|"$/g, "");
// حارسٌ لا يُتجاوز: هذا السكربت يكتب صفوفاً ماليّة.
if (!/\/modonty_dev(\?|$)/.test(url)) throw new Error("refusing: DATABASE_URL is not modonty_dev");
process.env.DATABASE_URL = url;

const SEED_TAG = "seed:orders-for-clients";
const VAT_RATE_BP = 1500;

async function run() {
  const { db } = await import("../lib/db");
  const { buildOrderSnapshot } = await import("@modonty/shared/lib/payments/build-order-snapshot");
  const clean = process.argv.includes("--clean");

  if (clean) {
    const seeded = await db.checkoutOrder.findMany({ where: { notes: SEED_TAG }, select: { id: true, clientId: true } });
    const clientIds = [...new Set(seeded.map((o) => o.clientId).filter((x): x is string => !!x))];
    await db.checkoutOrder.deleteMany({ where: { notes: SEED_TAG } });
    // المؤشّر يعود فارغاً فقط لمن كان طلبه مزروعاً.
    for (const id of clientIds) {
      const c = await db.client.findUnique({ where: { id }, select: { activeOrderId: true } });
      if (c && !(await db.checkoutOrder.findFirst({ where: { id: c.activeOrderId ?? "" }, select: { id: true } }))) {
        await db.client.update({ where: { id }, data: { activeOrderId: null } });
      }
    }
    console.log(`حُذف ${seeded.length} طلباً مزروعاً · أُفرغ المؤشّر عن ${clientIds.length} عميلاً`);
    return;
  }

  const plans = await db.commercialPlan.findMany({
    select: { id: true, slug: true, name: true, tier: true, articlesPerMonth: true,
      prices: { where: { isActive: true }, select: { market: true, currency: true, monthlyBase: true } } },
  });
  if (plans.length === 0) throw new Error("لا باقات في الكتالوج التجاريّ");

  const terms = await db.commercialTermPolicy.findMany({
    where: { isActive: true },
    select: { paidMonths: true, bonusServiceMonths: true },
    orderBy: { paidMonths: "asc" },
  });
  if (terms.length === 0) throw new Error("لا مدد في سياسة الفترات");

  const reps = await db.staff.findMany({ where: { role: "SALES" }, select: { id: true } });

  // العملاء الذين لا طلب لهم — والداخليّون مستثنون: مجّانيّون بطبعهم، ولا طلب لهم أصلاً.
  const clients = await db.client.findMany({
    where: { NOT: { isInternal: true } },
    select: { id: true, name: true, email: true, phone: true, addressCountry: true, createdAt: true, activeOrderId: true },
    orderBy: { createdAt: "asc" },
  });
  const linked = new Set(
    (await db.checkoutOrder.findMany({ where: { clientId: { not: null } }, select: { clientId: true } }))
      .map((o) => o.clientId!)
  );
  const targets = clients.filter((c) => !linked.has(c.id));
  if (targets.length === 0) { console.log("كل العملاء لهم طلبٌ مربوط — لا شيء يُزرع."); return; }

  const year = new Date().getFullYear();
  let seq = (await db.checkoutOrder.count()) + 500; // بعيدٌ عن ترقيم الإنتاج
  let made = 0;
  const byCurrency = new Map<string, number>();

  for (const [i, c] of targets.entries()) {
    const plan = plans[i % plans.length];
    const term = terms[i % terms.length];
    const isEgypt = /مصر|egypt|\beg\b/i.test(c.addressCountry ?? "");
    const price = plan.prices.find((p) => p.market === (isEgypt ? "EG" : "SA")) ?? plan.prices[0];
    if (!price) continue;

    // نفس الدالّة التي تستعملها صفحة الدفع — لا رياضيات موازية.
    const snap = buildOrderSnapshot({
      plan: { id: plan.id, slug: plan.slug, name: plan.name, articlesPerMonth: plan.articlesPerMonth },
      price: { market: price.market, currency: price.currency, monthlyBase: price.monthlyBase },
      term: { paidMonths: term.paidMonths, bonusServiceMonths: term.bonusServiceMonths },
      vatRateBp: VAT_RATE_BP,
    });

    // تاريخ الدفع = يوم إنشاء العميل: هو أقرب ما نملك لواقعة الشراء.
    const paidAt = c.createdAt;

    const order = await db.checkoutOrder.create({
      data: {
        number: `ORD-${year}-${String(++seq).padStart(5, "0")}`,
        ...snap,
        buyerName: c.name,
        buyerEmail: c.email,
        buyerPhone: c.phone ?? "+966500000000",
        businessName: c.name,
        country: c.addressCountry ?? (isEgypt ? "مصر" : "السعودية"),
        status: "PAID",
        paidAt,
        serviceStartedAt: paidAt,
        salesRepId: reps.length ? reps[i % reps.length].id : null,
        clientId: c.id,
        notes: SEED_TAG,
      },
      select: { id: true, currency: true, totalMinor: true },
    });

    await db.client.update({ where: { id: c.id }, data: { activeOrderId: order.id } });
    byCurrency.set(order.currency, (byCurrency.get(order.currency) ?? 0) + order.totalMinor);
    made++;
  }

  console.log(`زُرع ${made} طلباً لـ${made} عميلاً · وُضع المؤشّر لكلٍّ منهم`);
  for (const [cur, minor] of byCurrency) console.log(`  ${minor / 100} ${cur}`);
}

run().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
