import { db } from "@/lib/db";
import { getSalesReps } from "@/app/(dashboard)/users/actions/users-actions";

/**
 * ما تحتاجه شاشة «طلب اشتراك جديد» لترسم نفسها — الباقات بأسعار السوقين، والمدد.
 *
 * كلّه من الكتالوج: الشاشة لا تعرف سعراً ولا تكتبه، تختار باقةً ومدّةً فقط،
 * والأكشن يعيد قراءتهما من القاعدة ويحسب. فما يُعرض للموظّف هو ما سيُحفظ.
 */

export interface OrderFormPlan {
  id: string;
  name: string;
  articlesPerMonth: number | null;
  /** سعر الشهر بالوحدات الكبرى لكل سوق — للعرض وحده. */
  priceByMarket: Record<string, { currency: string; monthlyBase: number }>;
}

export interface OrderFormTerm {
  paidMonths: number;
  bonusServiceMonths: number;
  isRecommended: boolean;
}

export interface OrderFormData {
  plans: OrderFormPlan[];
  terms: OrderFormTerm[];
  salesReps: Array<{ id: string; name: string }>;
}

export async function loadOrderFormData(): Promise<OrderFormData> {
  const [plans, terms, salesReps] = await Promise.all([
    db.commercialPlan.findMany({
      where: { isPublished: true },
      orderBy: { displayOrder: "asc" },
      select: {
        id: true,
        name: true,
        articlesPerMonth: true,
        prices: {
          where: { isActive: true },
          select: { market: true, currency: true, monthlyBase: true },
        },
      },
    }),
    db.commercialTermPolicy.findMany({
      where: { isActive: true },
      orderBy: { paidMonths: "asc" },
      select: { paidMonths: true, bonusServiceMonths: true, isRecommended: true },
    }),
    /**
     * المندوبون من `getSalesReps` لا بقراءةٍ خاصّة (خالد ١٥ سبتمبر ٢٠٢٦:
     * «المندوب المفروض تعرض بس الرول تبعتهم سيلز»). وكانت هنا قراءةٌ ترجع **كل**
     * الموظّفين — محرّرين ومصمّمين ومدقّقين — فيُنسَب بيعٌ إلى من لا يبيع، ويدخل تقرير
     * المبيعات باسمه. والدالّة هي نفسها التي يستعملها نموذج إنشاء العميل، فالقائمتان
     * لا تفترقان.
     */
    getSalesReps(),
  ]);

  return {
    plans: plans.map((plan) => ({
      id: plan.id,
      name: plan.name,
      articlesPerMonth: plan.articlesPerMonth,
      priceByMarket: Object.fromEntries(
        plan.prices.map((p) => [p.market, { currency: p.currency, monthlyBase: p.monthlyBase }]),
      ),
    })),
    terms,
    salesReps,
  };
}
