/**
 * بذرُ طلباتِ اختبارٍ تغطّي الدورة الماليّة كاملةً — ٤٠ طلباً.
 *
 *   node scripts/seed-test-orders.mjs          يزرع
 *   node scripts/seed-test-orders.mjs --wipe   يحذف ما زرعه هو وحده
 *   node scripts/seed-test-orders.mjs --list   يعرض ما زُرع بلا لمس
 *
 * **يرفض العمل على غير `modonty_dev`.** الطلبُ يمسّ المال، وقاعدةُ الإنتاج لا تُزرع
 * فيها تجارب — فالحارسُ أوّلُ سطرٍ ينفَّذ، لا شرطٌ في آخر دالّة.
 *
 * **وكلُّ صفٍّ يحمل وسمَه** (`T-TEST` في `notes` ورقمٌ يبدأ بـ`T-`)، فالحذفُ يعرف ما
 * صنعه هو ولا يقترب من طلبٍ حقيقيّ. وعملاءُ الاختبار ببريدٍ ينتهي `@t.local` للسبب نفسه.
 *
 * ما تغطّيه المصفوفة أدناه: سوقان (ضريبةُ السعوديّة ١٥٪ · مصرُ بلا ضريبة) · ستُّ حالات ·
 * أربعُ بوّابات · مددٌ من شهرٍ إلى سنة · أشهرٌ مجّانيّة · اشتراكٌ سارٍ ومقتربٌ ومنتهٍ ·
 * مربوطٌ بعميلٍ وغيرُ مربوط · بريدٌ مكرَّرٌ وهاتفٌ مكرَّر · مبلغٌ صفر · بمندوبٍ وبلا مندوب.
 */
import { config } from "dotenv";
import { fileURLToPath } from "node:url";
import path from "node:path";

const here = path.dirname(fileURLToPath(import.meta.url));
config({ path: path.join(here, "../../.env.shared") });
config({ path: path.join(here, "../.env.local"), override: true });

const dbName = (process.env.DATABASE_URL ?? "").split("/").pop()?.split("?")[0];
if (dbName !== "modonty_dev") {
  console.error(`رُفض — هذا السكربت لا يعمل إلّا على modonty_dev (الحاليّة: ${dbName ?? "غير محدَّدة"})`);
  process.exit(1);
}

const { PrismaClient } = await import("@prisma/client");
const db = new PrismaClient();

const TAG = "T-TEST";
const now = new Date();
const daysAgo = (d) => new Date(now.getTime() - d * 86400000);
/** الضريبةُ مستخرَجةٌ من الإجمالي — الإجماليُّ هو ما دفعه العميل فعلاً. */
const vatOf = (total, bp) => (bp ? Math.round(total - total / (1 + bp / 10000)) : 0);

/**
 * كلُّ صفٍّ احتمالٌ في الدورة.
 *   m سوق · st حالة · mo شهورٌ مدفوعة · bonus أشهرٌ مجّانيّة · tot الإجماليّ بالهللة/القرش
 *   tx بوّابة · act قبل كم يوماً فُعِّل (يصنع السارِيَ والمقتربَ والمنتهي) · link يُربط بعميل
 */
const SCENARIOS = [
  // ── السعوديّة · بطاقة (NGENIUS) — المدّة تتدرّج
  { n: "T-01", m: "SA", st: "PAID", mo: 1, tot: 71940, tx: "NGENIUS", act: 5, link: true },
  { n: "T-02", m: "SA", st: "PAID", mo: 3, tot: 215820, tx: "NGENIUS", act: 40, link: true },
  { n: "T-03", m: "SA", st: "PAID", mo: 6, tot: 431640, tx: "NGENIUS", act: 100, link: true },
  { n: "T-04", m: "SA", st: "PAID", mo: 12, tot: 719400, tx: "NGENIUS", act: 200, link: true },
  // ── السعوديّة · تمارا (تقسيط)
  { n: "T-05", m: "SA", st: "PAID", mo: 6, tot: 359700, tx: "TAMARA", act: 20, link: true },
  { n: "T-06", m: "SA", st: "PAID", mo: 12, tot: 719400, tx: "TAMARA", act: 355, link: true },
  // ── مصر · إنستا باي
  { n: "T-07", m: "EG", st: "PAID", mo: 1, tot: 149900, tx: "INSTAPAY", act: 3, link: true },
  { n: "T-08", m: "EG", st: "PAID", mo: 3, tot: 449700, tx: "INSTAPAY", act: 60, link: true },
  // ── مصر · تحويل بنكيّ
  { n: "T-09", m: "EG", st: "PAID", mo: 6, tot: 899400, tx: "BANK_TRANSFER", act: 150, link: true },
  { n: "T-10", m: "EG", st: "PAID", mo: 12, tot: 1439880, tx: "BANK_TRANSFER", act: 300, link: true },

  // ── أشهرٌ مجّانيّة — المدّةُ تمتدّ بلا مالٍ إضافيّ
  { n: "T-11", m: "SA", st: "PAID", mo: 12, bonus: 2, tot: 719400, tx: "NGENIUS", act: 30, link: true },
  { n: "T-12", m: "EG", st: "PAID", mo: 6, bonus: 1, tot: 899400, tx: "INSTAPAY", act: 45, link: true },

  // ── اشتراكاتٌ منتهيةٌ ومقتربة (تُقاس من التفعيل + المدّة)
  { n: "T-13", m: "SA", st: "PAID", mo: 1, tot: 71940, tx: "NGENIUS", act: 45, link: true },   // منتهٍ
  { n: "T-14", m: "EG", st: "PAID", mo: 12, tot: 1439880, tx: "BANK_TRANSFER", act: 400, link: true }, // منتهٍ
  { n: "T-15", m: "SA", st: "PAID", mo: 1, tot: 71940, tx: "TAMARA", act: 26, link: true },    // يقترب
  { n: "T-16", m: "EG", st: "PAID", mo: 12, tot: 1439880, tx: "INSTAPAY", act: 360, link: true }, // يقترب

  // ── مدفوعٌ بلا حسابٍ بعد = «ينتظر التفعيل»
  { n: "T-17", m: "SA", st: "PAID", mo: 12, tot: 719400, tx: "NGENIUS" },
  { n: "T-18", m: "EG", st: "PAID", mo: 3, tot: 449700, tx: "INSTAPAY" },
  { n: "T-19", m: "EG", st: "PAID", mo: 1, tot: 149900, tx: "BANK_TRANSFER" },

  // ── لم يصل المال بعد
  { n: "T-20", m: "SA", st: "AWAITING_PAYMENT", mo: 12, tot: 719400 },
  { n: "T-21", m: "SA", st: "AWAITING_PAYMENT", mo: 1, tot: 71940 },
  { n: "T-22", m: "EG", st: "AWAITING_TRANSFER", mo: 12, tot: 1439880 },
  { n: "T-23", m: "EG", st: "AWAITING_TRANSFER", mo: 6, tot: 899400 },

  // ── مساراتٌ لم تكتمل
  { n: "T-24", m: "SA", st: "FAILED", mo: 12, tot: 719400, tx: "NGENIUS", txStatus: "FAILED", fail: "البطاقة مرفوضة من البنك" },
  { n: "T-25", m: "SA", st: "FAILED", mo: 6, tot: 359700, tx: "TAMARA", txStatus: "FAILED", fail: "تمارا رفضت التقسيط" },
  { n: "T-26", m: "EG", st: "CANCELLED", mo: 3, tot: 449700 },
  { n: "T-27", m: "SA", st: "CANCELLED", mo: 1, tot: 71940 },
  { n: "T-28", m: "EG", st: "REFUNDED", mo: 1, tot: 149900, tx: "INSTAPAY", act: 10, link: true, refund: "ألغى في أوّل أسبوع" },
  { n: "T-29", m: "SA", st: "REFUNDED", mo: 12, tot: 719400, tx: "NGENIUS", act: 15, link: true, refund: "خدمةٌ لم تبدأ" },

  // ── تصادماتٌ يجب أن تُرفض عند التفعيل
  { n: "T-30", m: "SA", st: "PAID", mo: 1, tot: 71940, tx: "NGENIUS", dupEmail: true },
  { n: "T-31", m: "SA", st: "PAID", mo: 1, tot: 71940, tx: "NGENIUS", dupPhone: true },

  // ── الحدود
  { n: "T-32", m: "SA", st: "PAID", mo: 1, tot: 0, tx: "NGENIUS" },                    // صفر — لا يُفوتَر
  { n: "T-33", m: "EG", st: "PAID", mo: 24, tot: 2879760, tx: "BANK_TRANSFER", act: 30, link: true }, // سنتان
  { n: "T-34", m: "SA", st: "PAID", mo: 12, tot: 2158200, tx: "NGENIUS", act: 10, link: true },       // باقةٌ غالية

  // ── بلا مندوب مقابل بمندوب
  { n: "T-35", m: "EG", st: "PAID", mo: 3, tot: 449700, tx: "INSTAPAY", act: 12, link: true, noRep: true },
  { n: "T-36", m: "SA", st: "PAID", mo: 6, tot: 431640, tx: "NGENIUS", act: 22, link: true, noRep: true },

  // ── تجديداتٌ لعميلٍ قائم (نفسُ البريد — المسارُ الصحيح «ربط بالعميل القائم»)
  { n: "T-37", m: "SA", st: "PAID", mo: 12, tot: 719400, tx: "NGENIUS", renewOf: "T-13" },
  { n: "T-38", m: "EG", st: "PAID", mo: 12, tot: 1439880, tx: "INSTAPAY", renewOf: "T-14" },

  // ── بوّابةٌ بلا معاملةٍ مسجَّلة (عطلٌ حقيقيّ يجب أن يظهر «—» لا أن يُفسَّر بحسن نيّة)
  { n: "T-39", m: "SA", st: "PAID", mo: 1, tot: 71940, act: 8, link: true },
  { n: "T-40", m: "EG", st: "PAID", mo: 1, tot: 149900, act: 8, link: true },
];

const MARKET = {
  SA: { currency: "SAR", vatRateBp: 1500, country: "SA" },
  EG: { currency: "EGP", vatRateBp: 0, country: "EG" },
};

async function list() {
  const orders = await db.checkoutOrder.findMany({
    where: { number: { startsWith: "T-" } },
    select: { number: true, status: true, market: true, currency: true, totalMinor: true, clientId: true },
    orderBy: { number: "asc" },
  });
  const clients = await db.client.count({ where: { orders: { some: { number: { startsWith: "T-" } } } } });
  console.log(`طلباتُ اختبار: ${orders.length} · عملاءُ اختبار: ${clients}`);
  for (const o of orders) {
    console.log(`  ${o.number.padEnd(6)} ${o.market} ${o.status.padEnd(18)} ${o.currency} ${(o.totalMinor / 100).toFixed(2).padStart(11)}  ${o.clientId ? "مربوط" : "—"}`);
  }
}

async function wipe() {
  const orders = await db.checkoutOrder.findMany({ where: { number: { startsWith: "T-" } }, select: { id: true, clientId: true } });
  const ids = orders.map((o) => o.id);
  /**
   * العملاءُ يُعرفون **بطلباتهم** لا بنمط بريدهم.
   *
   * كان الشرط `email endsWith "@t.local"`، فحذف عميلين أنشأهما خالد بيده من الواجهة
   * لأنّه اختار لهما البريدَ نفسَه (مقيسٌ حيّاً ١٩ سبتمبر ٢٠٢٦) — وبقي طلباهما يشيران
   * إلى عميلٍ وفاتورةٍ محذوفَين. فالنمطُ يصف صدفةً في النصّ، والطلبُ يصف نسباً حقيقيّاً:
   * هذا العميلُ وُلد من طلبِ اختبارٍ زرعناه، فيسقط معه.
   */
  const clients = await db.client.findMany({
    where: { id: { in: [...new Set(orders.map((o) => o.clientId).filter(Boolean))] } },
    select: { id: true, _count: { select: { articles: true } } },
  });
  const withArticles = clients.filter((c) => c._count.articles > 0);
  if (withArticles.length) {
    console.error(`توقّف — عميلُ اختبارٍ له مقالات (${withArticles.length}). احذفها أوّلاً أو راجعه بيدك.`);
    process.exit(1);
  }
  const clientIds = clients.map((c) => c.id);

  // المؤشّراتُ تُفكّ قبل الحذف وإلّا أشارت لصفٍّ محذوف
  await db.checkoutOrder.updateMany({ where: { id: { in: ids } }, data: { invoiceId: null } });
  await db.client.updateMany({ where: { id: { in: clientIds } }, data: { activeOrderId: null } });
  const inv = await db.invoice.deleteMany({ where: { OR: [{ orderId: { in: ids } }, { clientId: { in: clientIds } }] } });
  const tx = await db.paymentTransaction.deleteMany({ where: { orderId: { in: ids } } });
  const ord = await db.checkoutOrder.deleteMany({ where: { id: { in: ids } } });
  const cli = await db.client.deleteMany({ where: { id: { in: clientIds } } });
  console.log(`حُذف — فواتير ${inv.count} · معاملات ${tx.count} · طلبات ${ord.count} · عملاء ${cli.count}`);
}

async function seed() {
  const existing = await db.checkoutOrder.count({ where: { number: { startsWith: "T-" } } });
  if (existing > 0) {
    console.error(`توقّف — ${existing} طلبَ اختبارٍ موجودٌ أصلاً. شغّل --wipe أوّلاً.`);
    process.exit(1);
  }

  // مرجعٌ للتصادم: عميلٌ حقيقيٌّ قائم، وبريدُه وهاتفُه هما ما يجب أن يُرفض
  const real = await db.client.findFirst({ where: { NOT: { email: { endsWith: "@t.local" } } }, select: { email: true, phone: true, name: true } });
  const rep = await db.staff.findFirst({ where: { isActive: true }, select: { id: true, name: true } });
  const plan = await db.commercialPlan.findFirst({ select: { id: true, slug: true, nameAr: true, name: true } }).catch(() => null);

  const made = [];
  for (const s of SCENARIOS) {
    const mk = MARKET[s.m];
    const bonus = s.bonus ?? 0;
    const vatMinor = vatOf(s.tot, mk.vatRateBp);
    const activatedAt = s.act != null ? daysAgo(s.act) : null;
    const paidAt = s.st === "PAID" || s.st === "REFUNDED" ? (activatedAt ?? daysAgo(2)) : null;

    // التجديدُ يحمل بريدَ الطلب الذي يجدّده — وهو ما يُظهر «ربط بالعميل القائم»
    const renewSource = s.renewOf ? SCENARIOS.find((x) => x.n === s.renewOf) : null;
    const email = s.dupEmail
      ? (real?.email ?? "dup@t.local")
      : renewSource
        ? `${renewSource.n.toLowerCase()}@t.local`
        : `${s.n.toLowerCase()}@t.local`;

    const order = await db.checkoutOrder.create({
      data: {
        number: s.n,
        buyerName: `مشترٍ ${s.n}`,
        buyerEmail: email,
        buyerPhone: s.dupPhone ? (real?.phone ?? "+966500000000") : `+9665${String(10000000 + made.length * 137).slice(0, 8)}`,
        businessName: `منشأة ${s.n}`,
        country: mk.country,
        market: s.m,
        currency: mk.currency,
        planId: plan?.id ?? null,
        planSlug: plan?.slug ?? "plan-test",
        planName: s.mo >= 12 ? "الزخم" : "الانطلاقة",
        articlesPerMonth: s.mo >= 12 ? 8 : 4,
        monthlyBaseMinor: s.mo > 0 ? Math.round(s.tot / s.mo) : s.tot,
        paidMonths: s.mo,
        bonusServiceMonths: bonus,
        subtotalMinor: s.tot - vatMinor,
        vatRateBp: mk.vatRateBp,
        vatMinor,
        totalMinor: s.tot,
        status: s.st,
        paidAt,
        serviceStartedAt: activatedAt,
        activatedAt,
        failedReason: s.fail ?? null,
        salesRepId: s.noRep ? null : (rep?.id ?? null),
        notes: s.refund
          ? `${TAG} — يُحذف بـ--wipe\n↩ مُسترَد ${now.toISOString().slice(0, 10)} — ${s.refund}`
          : `${TAG} — يُحذف بـ--wipe`,
      },
      select: { id: true, number: true },
    });

    if (s.tx) {
      await db.paymentTransaction.create({
        data: {
          orderId: order.id,
          provider: s.tx,
          status: s.txStatus ?? "SUCCESS",
          amountMinor: s.tot,
          currency: mk.currency,
          providerReference: `${s.n}-REF`,
          settledAt: paidAt,
        },
      });
    }
    made.push({ n: s.n, id: order.id, link: !!s.link });
  }

  // العملاءُ يُصنعون للطلبات الموسومة `link` وحدها — والباقي يبقى «ينتظر التفعيل»
  // عمداً، لأنّه أحدُ الاحتمالات التي يجب أن تُختبر من الواجهة.
  let linked = 0;
  for (const m of made.filter((x) => x.link)) {
    const o = await db.checkoutOrder.findUnique({ where: { id: m.id }, select: { buyerEmail: true, buyerPhone: true, businessName: true, articlesPerMonth: true, activatedAt: true, serviceStartedAt: true, salesRepId: true, paidMonths: true, bonusServiceMonths: true } });
    const client = await db.client.create({
      data: {
        name: o.businessName,
        slug: `t-${m.n.toLowerCase()}`,
        email: o.buyerEmail,
        phone: o.buyerPhone,
        // كلمةُ مرورٍ ثابتةٌ لعميلِ اختبار — لا تُستعمل خارج modonty_dev
        password: "$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy",
        articlesPerMonth: o.articlesPerMonth,
        subscriptionStatus: "ACTIVE",
        activatedAt: o.activatedAt,
        subscriptionStartDate: o.serviceStartedAt,
        activeOrderId: m.id,
        ...(o.salesRepId ? { salesRep: { connect: { id: o.salesRepId } } } : {}),
      },
      select: { id: true },
    });
    // نهايةُ الاشتراك بنفس صيغة `recompute-subscription-end.ts`: التفعيل + المدفوع + المجّانيّ
    const end = o.activatedAt ? new Date(o.activatedAt) : null;
    if (end) end.setMonth(end.getMonth() + o.paidMonths + o.bonusServiceMonths);
    await db.client.update({ where: { id: client.id }, data: { subscriptionEndDate: end } });
    await db.checkoutOrder.update({ where: { id: m.id }, data: { clientId: client.id } });
    linked++;
  }

  console.log(`زُرع ${made.length} طلباً · مربوطٌ بعميل ${linked} · بلا عميل ${made.length - linked}`);
  console.log(`مرجعُ التصادم: ${real?.name ?? "—"} (${real?.email ?? "—"} · ${real?.phone ?? "—"})`);
  console.log(`المندوب: ${rep?.name ?? "بلا مندوب"} · الباقة: ${plan?.nameAr ?? plan?.name ?? "بلا صفٍّ في الكتالوج"}`);
  console.log(`\nللحذف: node scripts/seed-test-orders.mjs --wipe`);
}

const mode = process.argv[2];
if (mode === "--wipe") await wipe();
else if (mode === "--list") await list();
else await seed();
await db.$disconnect();
