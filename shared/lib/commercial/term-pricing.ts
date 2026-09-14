/**
 * أرقام العرض لمدّة واحدة — ما يُقنع المشتري بالمدّة الطويلة.
 *
 * الحكاية: من يشتري ١٢ شهراً يأخذ ٦ أشهر هدية، أي ١٨ شهر خدمة بسعر ١٢. والبطاقة بلا هذا
 * الاشتقاق تعرض ٤٬٧٨٨ مقابل ١٬١٩٧ للثلاثة أشهر — فتبدو المدّة الطويلة أغلى وهي أوفر بالثلث.
 *
 * 🔴 الحدّ الفاصل: هذه أرقام **عرض**. أرقام **المال** التي تدخل الطلب والفاتورة تُبنى في
 * `shared/lib/payments/build-order-snapshot.ts` وحده، ولا تُقرأ من هنا ولا تُكتب هنا.
 * خلط الاثنين هو عطل `PAY-AV-FIVE` بعينه: السعر الواحد في خمسة مواضع، واثنان يتناقضان.
 * ولهذا لا ضريبة هنا أصلاً — السعر شامل الضريبة (`PAY-Q7`)، والفصل شأن الفاتورة.
 *
 * دالّة نقيّة: أرقام تدخل وأرقام تخرج، بلا قاعدة بيانات — فتُختبر بأرقام مكشوفة ولا تنحرف
 * حسابياً عمّا يُعرض على الشاشة.
 */

const MINOR_PER_MAJOR = 100; // هللة / قرش

export interface TermPricingInput {
  /** السعر الشهري كما هو مخزَّن في الكتالوج — وحدة كبرى، شامل الضريبة. */
  monthlyBase: number;
  paidMonths: number;
  bonusServiceMonths: number;
}

export interface TermPricing {
  paidMonths: number;
  bonusServiceMonths: number;
  /** الأشهر التي يُخدَم فيها العميل فعلاً = المدفوعة + الهدية. */
  serviceMonths: number;
  /** ما يُدفع مرّة واحدة، بالوحدة الصغرى. */
  totalMinor: number;
  /** ما يساويه الشهر الواحد بعد احتساب الهدية، بالوحدة الصغرى. */
  effectiveMonthlyMinor: number;
  /** نسبة التوفير مقابل الشهري المعلن، مقرَّبة إلى عدد صحيح. صفر حين لا هدية. */
  savingsPct: number;
}

export function buildTermPricing({ monthlyBase, paidMonths, bonusServiceMonths }: TermPricingInput): TermPricing {
  if (!Number.isInteger(monthlyBase) || monthlyBase < 0) throw new Error("monthlyBase must be a non-negative integer");
  if (!Number.isInteger(paidMonths) || paidMonths < 1) throw new Error("paidMonths must be a positive integer");
  if (!Number.isInteger(bonusServiceMonths) || bonusServiceMonths < 0) throw new Error("bonusServiceMonths must be a non-negative integer");

  const monthlyBaseMinor = monthlyBase * MINOR_PER_MAJOR;
  const totalMinor = monthlyBaseMinor * paidMonths;
  const serviceMonths = paidMonths + bonusServiceMonths;
  const effectiveMonthlyMinor = Math.round(totalMinor / serviceMonths);

  // باقة بسعر صفر (لو وُجدت يوماً) لا توفير فيها — والقسمة على صفر تُرجع NaN وتطبعها الشاشة.
  const savingsPct = monthlyBaseMinor === 0 ? 0 : Math.round((1 - effectiveMonthlyMinor / monthlyBaseMinor) * 100);

  return { paidMonths, bonusServiceMonths, serviceMonths, totalMinor, effectiveMonthlyMinor, savingsPct };
}
