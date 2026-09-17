import type { CommercialPlanTheme, PrismaClient } from "@prisma/client";

/**
 * The published catalog for ONE market, shaped for a selling card.
 *
 * Lives in `shared` because two consumers read the same rows: the admin preview screen
 * (`/pay-preview`) and, from PAY-C1, modonty's real `/pay`. A second copy would let the
 * preview drift from what the visitor is actually sold — the exact failure PAY-AV-FIVE
 * records (one price, five places, two of them contradicting).
 *
 * The Prisma client is a parameter, not an import: each app owns its own client
 * (`admin/lib/db`, `modonty/lib/db`) and shared must not pick one.
 *
 * NOTE ON CACHING: none here. Caching is a per-app decision — modonty wraps this in its
 * own `"commercial-catalog"` tag (PAY-C1) so the admin can invalidate it; the admin
 * preview must always read live rows, since its whole purpose is to show the edit you
 * just made.
 */

export interface CatalogFeature {
  id: string;
  name: string;
  /** e.g. "مقال" · "منشور/شهر"; null means a fixed inclusion with no quantity. */
  unitLabel: string | null;
  /** سطرٌ يُطبع عريضاً على البطاقة — قرار تسويق من المكتبة. */
  isHighlighted: boolean;
  quantity: number | null;
  note: string | null;
  /** هل تنزل في الفاتورة بوصفها التزاماً؟ البطاقة تعرض الكلّ، والفاتورة المُعلَّم فقط. */
  billable: boolean;
}

export interface CatalogTerm {
  paidMonths: number;
  bonusServiceMonths: number;
  /** الصفّ الذي تفتح عليه الصفحة ويُوسم «الأنسب» — واحد على الأكثر (PAY-G8). */
  isRecommended: boolean;
}

export interface CatalogPlan {
  id: string;
  slug: string;
  name: string;
  badge: string | null;
  /** سطر خاطف واحد تحت السعر · نصّ الزرّ · شارة التمييز (PAY-G11). */
  hook: string | null;
  ctaText: string | null;
  featuredBadge: string | null;
  theme: CommercialPlanTheme;
  // سقط `tier` (١٧ سبتمبر ٢٠٢٦) مع الحقل نفسه من `CommercialPlan`: كان يربط الباقة
  // بفئةٍ من إنم، وهو ما حبس الكتالوج في أربع باقاتٍ للأبد. المفتاحُ اليوم `slug`.
  articlesPerMonth: number | null;
  highlights: string[];
  /** Major units, VAT-inclusive (PAY-Q7). */
  monthlyBase: number;
  currency: string;
  features: CatalogFeature[];
  /**
   * اسم الباقة الأدنى حين تشملها هذه بالكامل — فتُطبع «كل ما في الزخم +» بدل تكرار
   * صفوفها. `null` حين لا وراثة، فتُعرض كل المزايا.
   */
  inheritsFrom: string | null;
}

export interface MarketCatalog {
  market: string;
  plans: CatalogPlan[];
  /** One policy for every plan — PAY-Q3. */
  terms: CatalogTerm[];
}

export async function getMarketCatalog(db: PrismaClient, market: string): Promise<MarketCatalog> {
  const [rows, terms] = await Promise.all([
    db.commercialPlan.findMany({
      where: { isPublished: true, prices: { some: { market, isActive: true } } },
      orderBy: { displayOrder: "asc" },
      select: {
        id: true,
        slug: true,
        name: true,
        badge: true,
        hook: true,
        ctaText: true,
        featuredBadge: true,
        theme: true,
        articlesPerMonth: true,
        highlights: true,
        prices: {
          where: { market, isActive: true },
          select: { currency: true, monthlyBase: true },
        },
        features: {
          orderBy: { displayOrder: "asc" },
          select: {
            quantity: true,
            note: true,
            feature: { select: { id: true, name: true, unitLabel: true, isActive: true, billable: true, isHighlighted: true } },
          },
        },
      },
    }),
    db.commercialTermPolicy.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: "asc" },
      select: { paidMonths: true, bonusServiceMonths: true, isRecommended: true },
    }),
  ]);

  const plans: CatalogPlan[] = [];
  for (const row of rows) {
    // `prices.some` above guarantees one, but a row narrowed to zero by a concurrent edit
    // must not render a card with no price — a card is a price promise.
    const price = row.prices[0];
    if (!price) continue;

    plans.push({
      id: row.id,
      slug: row.slug,
      name: row.name,
      badge: row.badge,
      hook: row.hook,
      ctaText: row.ctaText,
      featuredBadge: row.featuredBadge,
      theme: row.theme,
      articlesPerMonth: row.articlesPerMonth,
      highlights: row.highlights,
      monthlyBase: price.monthlyBase,
      currency: price.currency,
      inheritsFrom: null, // يُملأ بعد بناء المصفوفة — الوراثة علاقةٌ بين باقتين لا صفةُ صفّ.
      features: row.features
        .filter((a) => a.feature.isActive)
        .map((a) => ({
          id: a.feature.id,
          name: a.feature.name,
          unitLabel: a.feature.unitLabel,
          isHighlighted: a.feature.isHighlighted,
          quantity: a.quantity,
          note: a.note,
          billable: a.feature.billable,
        })),
    });
  }

  // الوراثة تُحسب هنا لا في المكوّن: البطاقة ترى باقتها وحدها، والوراثة علاقةٌ بين بطاقتين.
  // القاعدة: الميزة موروثة فقط إن وُجدت في الباقة الأدنى **بنفس الكمّية** — فميزةٌ ارتفعت
  // كمّيتها (٤ مقالات ← ٨) ترقيةٌ يجب أن تُرى، لا تكراراً يُطوى.
  // وشرط الوراثة أن تشمل الباقة الأعلى كل مزايا الأدنى؛ وإلا فالعبارة تكذب على المشتري.
  // المقارنة تجري على النسخ **الأصلية** لا على `plans[i].features` بعد تصفيتها: الباقة
  // الوسطى تُصفّى في الدورة الأولى، فلو قُرئت منها في الدورة الثانية صار المرجع ناقصاً
  // وظهرت مزايا مكرَّرة في الباقة العليا. حدث فعلاً ١٣ سبتمبر ٢٠٢٦ قبل هذا التعليق.
  const originalFeatures = plans.map((plan) => plan.features);
  const key = (f: CatalogFeature) => `${f.id}:${f.quantity ?? ""}`;

  for (let i = 1; i < plans.length; i += 1) {
    const lower = originalFeatures[i - 1];
    const higher = originalFeatures[i];
    if (lower.length === 0) continue;

    const coversAll = lower.every((f) => higher.some((h) => h.id === f.id && (h.quantity ?? 0) >= (f.quantity ?? 0)));
    if (!coversAll) continue;

    const lowerKeys = new Set(lower.map(key));
    plans[i].inheritsFrom = plans[i - 1].name;
    plans[i].features = higher.filter((f) => !lowerKeys.has(key(f)));
  }

  return { market, plans, terms };
}
