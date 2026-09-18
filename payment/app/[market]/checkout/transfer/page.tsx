import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { Building2, MessageCircle, Smartphone } from "lucide-react";

import { formatCatalogMoneyMinor } from "@modonty/shared/lib/commercial/format-money";

import { db } from "@/lib/db";
import { egTransferChannels } from "@/lib/eg-transfer";
import { salesWhatsapp } from "@/lib/sales-whatsapp";
import { getAccountManager, whatsappLink } from "@/app/data/get-account-manager";
import { CheckoutHeader } from "../components/checkout-header/CheckoutHeader";
import { CopyField } from "./components/CopyField";

/**
 * تعليمات التحويل المصريّ — تُعرض **بعد** تسجيل الطلب لا قبله.
 *
 * ── ليش تحتاج `?order=` ولا تُفتح بلا طلب ──
 * الصفحة بلا طلبٍ تعرض حساباً بنكيّاً لمجهول: من يحوّل إليه تصل حوالته بلا اسمٍ
 * يُطابَق به، ومن لا يحوّل يمضي ولا يبقى منه رقم. ورقم الطلب هو الرابط الوحيد بين
 * الحوالة وصاحبها، فبغيره تصير الصفحة مولّدَ إيداعاتٍ يتيمة.
 *
 * ── وتُقرأ من القاعدة لا من العنوان ──
 * المبلغ واسم الباقة يُقرآن بمعرّف الطلب، فلا يستطيع أحدٌ تغيير ما سيُحوَّل بتعديل
 * شريط العنوان. وهي نفس قاعدة `create-payment`: السعر من القاعدة لا من الطلب.
 */

/**
 * الصفحة تقرأ صفّ الطلب لكل طلب — فلا تُبنى مسبقاً.
 *
 * و`cacheComponents` يحجب المسار بلا هذا التصريح («encountered uncached data during
 * prerendering»). ولا `'use cache'` هنا: المعروض حالةُ طلبٍ بعينه ومبلغٌ سيُحوَّل،
 * وتخزينه يعني عرض طلب مشترٍ على آخر. الأخوات السبع في هذا المسار كلّهنّ تصرّحن به.
 */
export const instant = false;

export const metadata: Metadata = {
  title: { absolute: "أكمل التحويل — مدونتي" },
  robots: { index: false, follow: false },
  other: { google: "notranslate" },
};

const MARKETS = { eg: "EG" } as const;

export default async function TransferPage({
  params,
  searchParams,
}: {
  params: Promise<{ market: string }>;
  searchParams: Promise<{ order?: string }>;
}) {
  const { market: slug } = await params;
  // التحويل البنكي مسار مصر وحدها: السعودية لها بوّابة، وصفحةٌ كهذه فيها تربك لا تفيد.
  if (!(slug in MARKETS)) notFound();

  const { order } = await searchParams;
  if (!order?.trim()) redirect(`/${slug}/plans`);

  const row = await db.checkoutOrder
    .findUnique({
      where: { id: order.trim() },
      select: {
        id: true,
        number: true,
        status: true,
        market: true,
        planName: true,
        paidMonths: true,
        bonusServiceMonths: true,
        totalMinor: true,
        currency: true,
        buyerName: true,
      },
    })
    .catch(() => null);

  if (!row) redirect(`/${slug}/plans`);
  // طلبٌ من سوقٍ آخر لا يُعرض هنا: معرّفٌ صحيح لا يعني أنه طلب هذه الصفحة.
  if (row.market !== "EG") redirect(`/${slug}/plans`);
  /**
   * وصل المال فعلاً: لا تُعرض عليه تعليمات تحويلٍ مرّةً أخرى — هذا أسرع طريق
   * لتحويلٍ مكرّر لا نملك ردّه بضغطة.
   */
  if (row.status === "PAID") redirect(`/${slug}/checkout/success?order=${row.id}`);

  const totalDisplay = formatCatalogMoneyMinor(row.totalMinor, row.currency);
  const serviceMonths = row.paidMonths + row.bonusServiceMonths;
  const ar = new Intl.NumberFormat("ar-EG");
  const monthsLabel = `${ar.format(serviceMonths)} ${serviceMonths >= 3 && serviceMonths <= 10 ? "شهور" : "شهر"}`;

  const channels = egTransferChannels();
  /**
   * رقمُ الاستقبال واحدٌ لكلّ المنصّة: `Settings.salesPhone` (خالد ١٨ سبتمبر ٢٠٢٦:
   * «كله يشتغل على نفس الرقم اللي حطّيناه في السيتنج… المفروض يُقرأ من مكانٍ واحد»).
   *
   * كان رقمُ مسؤول الحساب يُقدَّم عليه، فيصل إيصالٌ إلى جوّالِ موظّفٍ في إجازة ولا يعرف
   * به أحد؛ والرقمُ يتغيّر بتغيّر الموظّف بلا أن يُعلَن. الآن الخطُّ واحدٌ يعرفه الفريق
   * كلُّه وهو نفسُه المطبوع على الفاتورة، ويُغيَّر من شاشةٍ واحدة بلا نشرة.
   *
   * ومسؤولُ الحساب يبقى **وجهاً واسماً** فوق الزرّ: المشتري يرسل مالاً إلى حسابٍ لا
   * يعرفه، وإنسانٌ بعينه يقصّر تلك المسافة — لكنّه لا يحمل الرقم.
   */
  const manager = await getAccountManager("EG");
  const wa = await salesWhatsapp();
  /**
   * الرسالة معبّأة بالطلب والمبلغ: بغيرها يفتح المشتري محادثةً فارغة فيُسأل «مين
   * حضرتك؟» ويعيد كتابة ما كتبه قبل دقيقة — ونحن نعيد البحث عن طلبه يدوياً.
   */
  const waText = `مرحباً، حوّلت قيمة الطلب ${row.number} — باقة ${row.planName} — ${totalDisplay}. مرفق صورة الإيصال.`;
  const waHref = wa ? `${wa.href}?text=${encodeURIComponent(waText)}` : manager ? whatsappLink(manager.receiptPhone, waText) : null;
  /** الرقمُ المعروض هو الرقمُ المضغوط — لا يُكتب واحدٌ ويُفتح آخر. */
  const receiptPhone = wa?.label ?? manager?.receiptPhone ?? null;

  return (
    <>
      <CheckoutHeader backHref={`/${slug}/plans`} />
      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12" dir="rtl">
        <div className="mb-6 text-center sm:mb-8">
          <div className="mx-auto mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full border-2 border-success/40 bg-success/10">
            <Building2 className="h-8 w-8 text-success-ink" strokeWidth={2.25} />
          </div>
          <h1 className="text-2xl font-black text-foreground sm:text-3xl">سُجّل طلبك — باقي التحويل</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            حوّل المبلغ بأي طريقة بالأسفل، وأرسل صورة الإيصال على واتساب.
          </p>
        </div>

        {/* رقم الطلب أوّلاً وأكبر ما في الصفحة: هو ما يُكتب في خانة البيان، وبه وحده
            تُربط الحوالة بصاحبها. وضعُه تحت بيانات الحساب يجعله يُنسى. */}
        <div className="mb-5 rounded-2xl border-2 border-primary/30 bg-primary/5 p-5 text-center sm:p-6">
          <p className="text-[12px] font-bold text-muted-foreground">رقم طلبك — اكتبه في خانة البيان عند التحويل</p>
          <CopyField value={row.number} big />
          <dl className="mt-4 grid gap-2 border-t border-primary/20 pt-4 text-[13px] sm:grid-cols-3">
            <div>
              <dt className="text-muted-foreground">الباقة</dt>
              <dd className="font-bold text-foreground">{row.planName}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">المدّة</dt>
              <dd className="font-bold text-foreground">{monthsLabel}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">المبلغ المطلوب</dt>
              <dd className="text-[17px] font-black text-success-ink" dir="ltr">
                {totalDisplay}
              </dd>
            </div>
          </dl>
        </div>

        <h2 className="mb-3 text-[15px] font-black text-foreground">اختر طريقة التحويل</h2>

        <div className="space-y-4">
          {channels.map((ch) => (
            <section key={ch.kind} className="rounded-2xl border border-border bg-card p-5">
              <div className="mb-3 flex items-center gap-2.5">
                {ch.kind === "instapay" ? (
                  /* شعار إنستا باي الرسميّ — يُعرَف بصرياً قبل أن يُقرأ اسمه. */
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src="/logos/instapay.png" alt="" aria-hidden className="h-7 w-auto" />
                ) : (
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-muted text-foreground">
                    <Smartphone className="h-4 w-4" strokeWidth={2.25} />
                  </span>
                )}
                <h3 className="text-[14px] font-black text-foreground">{ch.label}</h3>
              </div>

              <dl className="space-y-2.5">
                {ch.fields.map((f) => (
                  <div key={f.label} className="flex flex-wrap items-center justify-between gap-2">
                    <dt className="text-[12.5px] text-muted-foreground">{f.label}</dt>
                    <dd className="min-w-0">
                      {f.copy ? (
                        <CopyField value={f.value} />
                      ) : (
                        <span className="text-[14px] font-bold text-foreground" dir="ltr">
                          {f.value}
                        </span>
                      )}
                    </dd>
                  </div>
                ))}
              </dl>

              {ch.note ? (
                <p className="mt-3 border-t border-border pt-3 text-[12px] leading-relaxed text-muted-foreground">
                  {ch.note}
                </p>
              ) : null}
            </section>
          ))}
        </div>

        {/* الخطوة التالية بعد التحويل — لا تُترك للتخمين. */}
        {waHref ? (
          <div className="mt-6 rounded-2xl border-2 border-success/35 bg-success/5 p-5 sm:p-6">
            <p className="mb-1 text-[14px] font-black text-foreground">بعد التحويل: أرسل صورة الإيصال</p>

            {/* وجهٌ واسمٌ فوق الزرّ: المشتري يرسل مالاً إلى حسابٍ لا يعرفه، وإنسانٌ
                بعينه يقصّر تلك المسافة أكثر من أي سطر طمأنة. */}
            {manager ? (
              <div className="mb-4 mt-3 flex items-center gap-3 rounded-xl border border-border bg-card p-3">
                {manager.image ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={manager.image}
                    alt=""
                    aria-hidden
                    className="size-12 shrink-0 rounded-full object-cover ring-2 ring-success/30"
                  />
                ) : (
                  <span className="grid size-12 shrink-0 place-items-center rounded-full bg-muted text-[15px] font-black text-muted-foreground">
                    {manager.name.trim().charAt(0)}
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-[13.5px] font-black text-foreground">{manager.name}</p>
                  {manager.title ? (
                    <p className="text-[12px] text-muted-foreground">{manager.title}</p>
                  ) : null}
                </div>
              </div>
            ) : null}

            {/*
              الرقمان تحت الاسم في عمود واحد، وكلٌّ بدوره مكتوباً — لا رقمين متجاورين
              يختار بينهما المشتري. والرقم المصريّ يُعلَن هنا **قبل** أن يرنّ: مكالمةٌ
              محلّية مجهولة بعد حوالةٍ بنكية تُقرأ احتيالاً، وكتابتُها تجعلها موعداً.
            */}
            {receiptPhone ? (
              <dl className="mb-4 space-y-2 rounded-xl border border-border bg-card px-3.5 py-3 text-[12.5px]">
                <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
                  <dt className="font-bold text-foreground">ترسل الإيصال على</dt>
                  <dd className="font-bold tabular-nums text-foreground" dir="ltr">{receiptPhone}</dd>
                </div>
                {manager?.followUpPhone ? (
                  <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5 border-t border-border pt-2">
                    <dt className="text-muted-foreground">{manager.followUpNote}</dt>
                    <dd className="font-bold tabular-nums text-foreground" dir="ltr">{manager.followUpPhone}</dd>
                  </div>
                ) : null}
              </dl>
            ) : null}

            <p className="mb-4 text-[12.5px] leading-relaxed text-muted-foreground">
              الرسالة جاهزة برقم طلبك — أرفق الصورة وأرسل. نراجعها ونفعّل اشتراكك خلال ٢٤ ساعة.
            </p>
            <a
              href={waHref}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-success text-[15px] font-black text-success-foreground no-underline shadow-lg shadow-success/25 transition-colors hover:bg-success/90"
            >
              <MessageCircle className="h-5 w-5" strokeWidth={2.25} />
              <span>أرسل الإيصال على واتساب</span>
            </a>
          </div>
        ) : null}

        <p className="mt-6 text-center text-[12px] leading-relaxed text-muted-foreground">
          طلبك محفوظ باسم {row.buyerName} بسعره الحالي. ولن يُفعّل الاشتراك قبل وصول الحوالة
          ومطابقتها برقم الطلب.
        </p>
      </main>
    </>
  );
}
