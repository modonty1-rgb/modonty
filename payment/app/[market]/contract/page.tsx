import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FileText } from "lucide-react";

import { formatCatalogMoneyMinor } from "@modonty/shared/lib/commercial/format-money";
import { formatMonths } from "@modonty/shared/lib/commercial/arabic-months";
import { buildPlanCommitments } from "@modonty/shared/lib/commercial/build-plan-commitments";
import { TERM_PARAM, resolveTermFromParams } from "@modonty/shared/lib/commercial/resolve-term-from-params";
import { vatRateBpForMarket } from "@modonty/shared/lib/payments/vat-rate";

import { getCachedMarketCatalog } from "../../data/get-cached-catalog";
import { getSellerLegal } from "../../data/get-seller-legal";
import { PayHeader } from "../../components/pay-header/PayHeader";
import { PayFooter } from "../../components/pay-footer/PayFooter";
import { modontyUrl } from "@/lib/modonty-url";

/**
 * نموذج العقد — يُبنى من الباقة نفسها لا من ملفٍّ ثابت.
 *
 * خالد (١٤ سبتمبر ٢٠٢٦): «العميل أحياناً بيطلب: أبغى أشوف نموذج للعقد».
 *
 * ولماذا مولَّد لا PDF مرفوع: العقد الثابت يشيخ في أوّل تعديل سعرٍ أو مدّة، فيقرأ العميل
 * شروطاً غير التي سيشتريها — وهو أسوأ من ألّا يرى شيئاً. وهذه الصفحة تقرأ نفس الكتالوج
 * الذي تقرؤه البطاقة، ونفس بيانات المنشأة التي تقرؤها الفاتورة، فلا يختلف ثلاثتها أبداً.
 *
 * وما ليس فيها عمداً: لا توقيع ولا خانة قبول. العقد يُبرم بالدفع (البند ١١)، وهذه
 * نسخةٌ للاطّلاع — فزرّ «وافق» هنا يوهم بالتزامٍ لم يقع.
 */

export const instant = false;

const MARKETS = { sa: "SA", eg: "EG" } as const;
type MarketSlug = keyof typeof MARKETS;

export const metadata: Metadata = {
  title: { absolute: "نموذج العقد — مدونتي" },
  robots: { index: false, follow: false },
};

export default async function ContractPage({
  params,
  searchParams,
}: {
  params: Promise<{ market: string }>;
  searchParams: Promise<{ plan?: string; months?: string; duration?: string }>;
}) {
  const { market: slug } = await params;
  if (!(slug in MARKETS)) notFound();
  const market = MARKETS[slug as MarketSlug];

  const [catalog, seller, search] = await Promise.all([
    getCachedMarketCatalog(market),
    getSellerLegal(),
    searchParams,
  ]);

  const term = resolveTermFromParams(catalog.terms, search);
  // باقةٌ بعينها إن جاءت في العنوان، وإلّا الموصى بها — فالصفحة تعمل نموذجاً عامّاً أيضاً.
  const plan = catalog.plans.find((p) => p.slug === search.plan) ?? catalog.plans.find((p) => p.featuredBadge) ?? catalog.plans[0];
  if (!plan || !term) notFound();

  /**
   * نفس حساب البطاقة: `monthlyBase` بوحدةٍ كبرى شاملاً الضريبة (PAY-Q7)، والإجمالي
   * يُضرب في الأشهر **المدفوعة** لا أشهر الخدمة — فالهدية خدمةٌ لا سعر.
   */
  const serviceMonths = term.paidMonths + term.bonusServiceMonths;
  const totalMinor = Math.round(plan.monthlyBase * 100) * term.paidMonths;
  const commitments = buildPlanCommitments(plan.features, serviceMonths);
  /**
   * جملة الضريبة تتبع نسبة السوق لا نصّاً ثابتاً: مصر صفر (vat-rate.ts)، فلا يُقال
   * للمشتري المصري «شاملةً الضريبة» ولا «فاتورة ضريبية» — وطلبه يُحفظ بضريبة صفر.
   * ٢٣ سبتمبر ٢٠٢٦ — خالد: مصدرٌ واحد.
   */
  const hasVat = vatRateBpForMarket(market) > 0;
  /**
   * لا تاريخ في هذه الصفحة (خالد ١٤ سبتمبر ٢٠٢٦).
   *
   * سببان، والثاني أهمّ:
   * ١ · `new Date()` قيمةٌ غير مستقرّة يرفضها `cacheComponents` عند التقديم المسبق، فيخرج
   *     النموذج من السكون إلى خادمٍ يرسمه في كل زيارة — بلا مقابل.
   * ٢ · وهو **مضلّل**: «حُرِّر هذا العقد بتاريخ كذا» على نموذج اطّلاع يوحي بعقدٍ أُنشئ
   *     لهذا المشتري اليوم، والعقد لا يُبرَم إلا بالدفع (بند ١١). فتاريخ التحرير الحقيقي
   *     هو `paidAt` في صفّ الطلب، لا يوم فتح الصفحة.
   */

  const Clause = ({ n, title, children }: { n: number; title: string; children: React.ReactNode }) => (
    <section className="border-t border-border/60 py-5">
      <h2 className="mb-2 flex items-baseline gap-2 text-[15px] font-extrabold text-foreground">
        <span className="text-[13px] text-muted-foreground">{n}</span>
        {title}
      </h2>
      <div className="space-y-2 text-[13.5px] leading-[1.9] text-muted-foreground">{children}</div>
    </section>
  );

  return (
    <>
      <PayHeader />
      <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6" dir="rtl">
        <div className="mb-6 flex items-start gap-3">
          <div className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-xl bg-secondary">
            <FileText className="size-5 text-muted-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-foreground">نموذج عقد تقديم خدمة</h1>
            <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">
              نسخةٌ للاطّلاع، مولَّدة من باقة <span className="font-semibold text-foreground">{plan.name}</span> بمدّة{" "}
              {formatMonths(serviceMonths)}. تتحدّث تلقائياً مع أي تعديل على الباقة أو سعرها —
              فما تقرؤه هنا هو ما ستشتريه.
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card px-5 py-1 sm:px-7">
          <div className="py-5">
            <p className="text-[13.5px] leading-[1.9] text-muted-foreground">
              يُبرَم هذا العقد بإتمام الدفع، بين كلٍّ من:
            </p>
            <dl className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl bg-secondary/60 p-4">
                <dt className="mb-1 text-[11.5px] font-bold text-muted-foreground">الطرف الأول — مقدّم الخدمة</dt>
                <dd className="text-[13.5px] leading-[1.9] text-foreground">
                  <div className="font-extrabold">{seller.legalName ?? "—"}</div>
                  {seller.crNumber ? <div>السجل التجاري <span dir="ltr">{seller.crNumber}</span></div> : null}
                  {seller.vatNumber ? <div>الرقم الضريبي <span dir="ltr">{seller.vatNumber}</span></div> : null}
                  {seller.address ? <div className="text-muted-foreground">{seller.address}</div> : null}
                  {seller.email ? <div dir="ltr" className="text-muted-foreground">{seller.email}</div> : null}
                  <div className="mt-1 text-[12px] text-muted-foreground">المشغّل لمنصّة «مدونتي»</div>
                </dd>
              </div>
              <div className="rounded-xl border border-dashed border-border p-4">
                <dt className="mb-1 text-[11.5px] font-bold text-muted-foreground">الطرف الثاني — العميل</dt>
                <dd className="space-y-1.5 text-[13.5px] text-muted-foreground">
                  <div>الاسم / اسم المنشأة: ——————</div>
                  <div>السجل التجاري: ——————</div>
                  <div>الرقم الضريبي (إن وُجد): ——————</div>
                  <div>البريد والجوال: ——————</div>
                  <p className="mt-2 text-[12px] leading-relaxed">
                    تُملأ تلقائياً من بيانات الطلب عند الشراء.
                  </p>
                </dd>
              </div>
            </dl>
          </div>

          <Clause n={1} title="موضوع العقد">
            <p>
              يقدّم الطرف الأول للطرف الثاني خدمة النشر والمحتوى على منصّة «مدونتي» ضمن باقة{" "}
              <span className="font-semibold text-foreground">{plan.name}</span>، ولمدّة{" "}
              <span className="font-semibold text-foreground">{formatMonths(serviceMonths)}</span>
              {term.bonusServiceMonths > 0 ? (
                <> — منها {formatMonths(term.bonusServiceMonths)} خدمة مجانية مضافة إلى المدّة المدفوعة</>
              ) : null}.
            </p>
          </Clause>

          <Clause n={2} title="التزامات الطرف الأول — ما يُسلَّم بالضبط">
            <p>يلتزم الطرف الأول بتسليم ما يلي خلال مدّة العقد:</p>
            <ul className="mt-1 space-y-1.5">
              {commitments.map((c) => (
                <li key={c} className="flex gap-2">
                  <span aria-hidden className="mt-[9px] size-1.5 shrink-0 rounded-full bg-primary" />
                  <span className="text-foreground">{c}</span>
                </li>
              ))}
            </ul>
            <p className="mt-2 text-[12.5px]">
              وهذه القائمة نفسها تُطبع في {hasVat ? "الفاتورة الضريبية" : "الفاتورة"}، فلا يختلف ما وُعد به عمّا وُثِّق.
            </p>
          </Clause>

          <Clause n={3} title="المقابل المالي">
            <p>
              قيمة الاشتراك{" "}
              <span className="font-extrabold text-foreground" dir="ltr">
                {formatCatalogMoneyMinor(totalMinor, plan.currency)}
              </span>{" "}
              {hasVat ? "شاملةً ضريبة القيمة المضافة، " : ""}تُسدَّد دفعةً واحدة قبل بدء التنفيذ، أو تقسيطاً عبر
              مزوّد التقسيط المعتمد إن كان متاحاً للباقة.
            </p>
            <p>
              {hasVat ? "تُصدر فاتورة ضريبية نظامية" : "تُصدر فاتورة"} بعد تأكيد استلام المبلغ، وتُرسل إلى بريد
              الطرف الثاني.
            </p>
          </Clause>

          <Clause n={4} title="مدّة العقد وبدء التنفيذ">
            <p>
              تبدأ المدّة من تاريخ تفعيل الحساب، ويُفعَّل خلال ٧٢ ساعة عمل من تأكيد السداد، وبحدٍّ
              أقصى أربعة عشر يوماً. وإن تأخّر الطرف الأول عن ذلك، تُمدَّد مدّة الاشتراك بمقدار
              التأخير دون مقابل.
            </p>
          </Clause>

          <Clause n={5} title="التزامات الطرف الثاني">
            <ul className="space-y-1.5">
              <li>تزويد الطرف الأول بالمعلومات والمواد اللازمة لتنفيذ الخدمة في وقتٍ معقول.</li>
              <li>ألّا يكون ما يُنشر مخالفاً لأنظمة المملكة أو حقوق الغير.</li>
              <li>المحافظة على سرّية بيانات الدخول إلى حسابه.</li>
            </ul>
          </Clause>

          <Clause n={6} title="الملكية الفكرية">
            <p>
              المحتوى المُنتَج للطرف الثاني ملكٌ له بعد سداد كامل المقابل. ويحتفظ الطرف الأول بحقّ
              عرض أعمالٍ منه ضمن معرض أعماله ما لم يعترض الطرف الثاني كتابةً.
            </p>
          </Clause>

          <Clause n={7} title="الإلغاء والاسترداد">
            <p>
              للطرف الثاني إلغاء الاشتراك خلال أربعة عشر يوماً من التفعيل واسترداد المبلغ كاملاً ما لم
              يكن قد استُهلك جزء من الخدمة. وبعدها يُحسب المسترد بنسبة ما تبقّى من المدّة.
              وتفاصيلها في <a href={modontyUrl("/terms")} target="_blank" rel="noopener noreferrer" className="text-foreground underline underline-offset-2">الشروط والأحكام</a>.
            </p>
          </Clause>

          <Clause n={8} title="السرّية">
            <p>
              يلتزم كلا الطرفين بعدم إفشاء ما يطّلع عليه من بيانات الآخر لغير أغراض تنفيذ هذا العقد،
              وتبقى هذه المادّة سارية بعد انتهائه.
            </p>
          </Clause>

          <Clause n={9} title="حماية البيانات">
            <p>
              تُعالَج بيانات الطرف الثاني وفق{" "}
              <a href={modontyUrl("/legal/privacy-policy")} target="_blank" rel="noopener noreferrer" className="text-foreground underline underline-offset-2">سياسة الخصوصية</a>{" "}
              المعلنة، ولا تُشارَك مع طرفٍ ثالث إلا لتنفيذ الخدمة أو بحكم نظاميّ.
            </p>
          </Clause>

          <Clause n={10} title="القوّة القاهرة وإنهاء العقد">
            <p>
              لا يُسأل أيّ طرف عن تأخّرٍ سببه قوّة قاهرة خارجة عن إرادته. ولكلٍّ منهما إنهاء العقد
              بإشعارٍ مكتوب قبل خمسة عشر يوماً، مع تسوية ما استُحقّ حتى تاريخ الإنهاء.
            </p>
          </Clause>

          <Clause n={11} title="إبرام العقد والنظام الحاكم">
            <p>
              يُعدّ إتمام عملية الدفع والموافقة على{" "}
              <a href={modontyUrl("/terms")} target="_blank" rel="noopener noreferrer" className="text-foreground underline underline-offset-2">الشروط والأحكام</a>{" "}
              قبولاً لهذا العقد بكامل بنوده، ويقوم مقام التوقيع. ويخضع ما لم يرد فيه لأنظمة المملكة
              العربية السعودية، وتختصّ الجهات القضائية بالمملكة بالفصل في أي نزاع.
            </p>
          </Clause>

          <div className="border-t border-border/60 py-5">
            <p className="text-[12px] leading-relaxed text-muted-foreground">
              هذه نسخة اطّلاع مولَّدة آلياً من بيانات باقتك — لا تُغني عن الشروط والأحكام المعتمدة، وعند
              أي اختلافٍ في اللفظ يُرجع إليها.
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          <a
            href={`/${slug}/checkout?plan=${plan.slug}&months=${term.paidMonths}`}
            className="inline-flex h-12 items-center justify-center rounded-xl bg-primary px-6 text-[15px] font-bold text-primary-foreground no-underline transition-colors hover:bg-primary/90"
          >
            اشترك في {plan.name}
          </a>
          <a
            href={`/${slug}?${TERM_PARAM}=${term.paidMonths}`}
            className="inline-flex h-12 items-center justify-center rounded-xl border-2 border-foreground/25 bg-secondary px-6 text-[15px] font-bold text-secondary-foreground no-underline transition-colors hover:bg-secondary/80"
          >
            رجوع للباقات
          </a>
        </div>
      </main>
      <PayFooter />
    </>
  );
}
