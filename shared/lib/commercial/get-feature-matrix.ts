import type { PrismaClient } from "@prisma/client";

/**
 * مصفوفة «ميزة × باقة» — كل المزايا المفعَّلة، وقيمة كل واحدة في كل باقة.
 *
 * بلا سوق وبلا سعر عمداً: صفحة الأوفرفيو واحدة للعالم كلّه (خالد ١٤ سبتمبر ٢٠٢٦ —
 * «الصفحة هذه عامة للكل لأن احنا ما بنحط أسعار هناك»)، والسوق يبدأ من صفحة الباقات.
 * فلو قرأت هذه الدالّة سعراً لاحتاجت سوقاً، ولاحتاجت الصفحة أن تعرف بلد الزائر، ولسقطت
 * سكونها — وهي أغلى صفحة في المسار من ناحية الأداء لأنها أوّل ما يُفتح.
 *
 * والمزايا نفسها في السعودية ومصر (الفرق في `CommercialPlanPrice` وحده)، فالمصفوفة
 * صحيحةٌ للسوقين. ولذلك تُقرأ الباقات هنا بلا `prices`.
 *
 * الخلية أربع حالات، بهذا الترتيب:
 *   `quantity` موجودة  → رقمٌ ووحدة («٨ مقال/شهر») ← أقوى ما في جدولنا
 *   `note` موجودة      → نصّ المكتبة كما هو
 *   الميزة مُسنَدة     → مشمولة بلا مقدار (✓)
 *   غير مُسنَدة        → غير مشمولة (—)
 *
 * عميل Prisma وسيطٌ لا استيراد، مثل `get-market-catalog` — كل تطبيق يملك عميله.
 */

export type MatrixCell =
  | { kind: "quantity"; quantity: number; unitLabel: string | null }
  | { kind: "note"; note: string }
  | { kind: "included" }
  | { kind: "absent" };

export interface MatrixRow {
  featureId: string;
  name: string;
  description: string | null;
  isHighlighted: boolean;
  /** بترتيب `plans` نفسه — طولها دائماً طول `plans`. */
  cells: MatrixCell[];
}

export interface MatrixPlan {
  id: string;
  slug: string;
  name: string;
  badge: string | null;
  hook: string | null;
  /** عدد المزايا المشمولة — يُطبع «١٣ من ١٧ ميزة» بلا عدٍّ في المكوّن. */
  includedCount: number;
}

export interface FeatureMatrix {
  plans: MatrixPlan[];
  rows: MatrixRow[];
  /** عدد الصفوف — يُقرأ في العنوان («١٧ ميزة») بلا `rows.length` في كل موضع. */
  featureCount: number;
}

export async function getFeatureMatrix(db: PrismaClient): Promise<FeatureMatrix> {
  const [plans, features] = await Promise.all([
    db.commercialPlan.findMany({
      where: { isPublished: true },
      orderBy: { displayOrder: "asc" },
      select: {
        id: true, slug: true, name: true, badge: true, hook: true,
        features: {
          select: {
            featureId: true, quantity: true, note: true,
            feature: { select: { isActive: true } },
          },
        },
      },
    }),
    db.commercialFeature.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: "asc" },
      select: { id: true, name: true, description: true, unitLabel: true, isHighlighted: true },
    }),
  ]);

  /** بحثٌ في O(١) بدل `find` داخل حلقتين متداخلتين (١٧×٣ اليوم، وتكبر بلا سقف). */
  const assigned = plans.map(
    (p) => new Map(p.features.filter((f) => f.feature.isActive).map((f) => [f.featureId, f])),
  );

  const rows: MatrixRow[] = features.map((f) => ({
    featureId: f.id,
    name: f.name,
    description: f.description,
    isHighlighted: f.isHighlighted,
    cells: assigned.map((map): MatrixCell => {
      const a = map.get(f.id);
      if (!a) return { kind: "absent" };
      if (a.quantity !== null) return { kind: "quantity", quantity: a.quantity, unitLabel: f.unitLabel };
      if (a.note?.trim()) return { kind: "note", note: a.note.trim() };
      return { kind: "included" };
    }),
  }));

  return {
    plans: plans.map((p, i) => ({
      id: p.id, slug: p.slug, name: p.name, badge: p.badge, hook: p.hook,
      includedCount: rows.filter((r) => r.cells[i].kind !== "absent").length,
    })),
    rows,
    featureCount: rows.length,
  };
}
