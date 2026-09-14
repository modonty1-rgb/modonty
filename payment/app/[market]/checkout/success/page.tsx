import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { CheckCircle2, MailOpen, MessageCircle } from "lucide-react";

import { db } from "@/lib/db";
import { formatCatalogMoneyMinor } from "@modonty/shared/lib/commercial/format-money";
import { formatMonths } from "@modonty/shared/lib/commercial/arabic-months";
import { getCachedPaySectionContent } from "../../../data/get-cached-catalog";
import { CheckoutHeader } from "../components/checkout-header/CheckoutHeader";
import { modontyUrl } from "@/lib/modonty-url";

/**
 * صفحة النجاح (PAY-D5) — منقولة من جبر سيو `checkout/success/page.tsx`.
 *
 * كل ما فيها يُقرأ من **صفّ الطلب** لا من الكتالوج: الطلب يحمل لقطة سعره واسم باقته
 * وضريبته ساعةَ الشراء. لو قُرئ من الكتالوج لتغيّرت فاتورة مشترٍ قديمٍ كلّما عُدّل سعر.
 *
 * والحالة تحكم العرض: طلبٌ لم يُدفع لا يرى هذه الصفحة مهما كُتب في العنوان.
 */

export const metadata: Metadata = {
  title: { absolute: "تم الدفع — مدونتي" },
  robots: { index: false, follow: false },
};

export const instant = false;

const MARKETS = { sa: "SA" } as const;

export default async function CheckoutSuccessPage({
  params,
  searchParams,
}: {
  params: Promise<{ market: string }>;
  searchParams: Promise<{ order?: string }>;
}) {
  const { market: slug } = await params;
  if (!(slug in MARKETS)) notFound();

  const { order } = await searchParams;
  if (!order?.trim()) redirect(`/${slug}/plans`);

  const row = await db.checkoutOrder.findUnique({
    where: { id: order.trim() },
    select: {
      id: true, number: true, status: true,
      planName: true, paidMonths: true, bonusServiceMonths: true,
      totalMinor: true, currency: true, market: true,
    },
  }).catch(() => null);

  if (!row) redirect(`/${slug}/plans`);
  if (row.status === "AWAITING_PAYMENT") redirect(`/${slug}/checkout/processing?order=${row.id}`);
  // ⚠ لا يُمرَّر `failedReason` في العنوان: هو نصّ المزوّد الخام («NGENIUS_API_KEY is
  // not set»)، وتمريره يكتبه في شريط عنوان المشتري. صفحة الفشل تقرؤه من القاعدة
  // بالمعرّف وتترجمه إلى جملةٍ مفهومة، فالمعرّف وحده يكفي.
  if (row.status === "FAILED" || row.status === "CANCELLED") redirect(`/${slug}/checkout/failed?order=${row.id}`);
  if (row.status !== "PAID") redirect(`/${slug}/plans`);

  const content = await getCachedPaySectionContent(row.market);
  const totalDisplay = formatCatalogMoneyMinor(row.totalMinor, row.currency);
  const serviceMonths = row.paidMonths + row.bonusServiceMonths;

  // نفس مصدر صفحة الفشل: رقمٌ من البيئة لا ثابتٌ مكتوبٌ في الصفحة.
  const waNumber = process.env.NEXT_PUBLIC_SALES_WHATSAPP?.replace(/\D/g, "") ?? "";
  const waHref = waNumber
    ? `https://wa.me/${waNumber}?text=${encodeURIComponent(`مرحباً، طلبي ${row.number}`)}`
    : null;

  return (
    <>
      <CheckoutHeader backHref={`/${slug}/plans`} />
      <main className="mx-auto max-w-xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8" dir="rtl">
        <div className="mb-8 text-center">
          <div className="relative inline-flex items-center justify-center">
            <div className="absolute inset-0 animate-ping rounded-full bg-success/20 motion-reduce:animate-none" />
            <div className="relative flex h-20 w-20 items-center justify-center rounded-full border-2 border-success/40 bg-success/15 shadow-lg shadow-success/20">
              <CheckCircle2 className="h-11 w-11 text-success" strokeWidth={2.5} />
            </div>
          </div>
          <h1 className="mt-6 text-2xl font-black text-foreground sm:text-3xl">تم الدفع بنجاح</h1>
          {/* ما يقوله هذا السطر يجب أن يكون ما يحدث فعلاً (PAY-Q6): الحساب يُنشأ بيدٍ
              بعد تأكيد الاستلام، والفاتورة تُرسَل بضغطة زرّ. فالوعد بإيميلٍ «خلال دقائق»
              فيه بيانات دخولٍ لحسابٍ لم يُنشأ بعد يُنتج شكوى بعد ساعة لا ثقة. */}
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
            استلمنا مبلغك. نجهّز حسابك الآن، وتصلك الفاتورة وبيانات الدخول على بريدك بعد تأكيد
            الاستلام.
          </p>
        </div>

        <div className="mb-6 rounded-2xl border border-border bg-card p-5 sm:p-6">
          <p className="mb-4 text-xs font-semibold text-muted-foreground">تفاصيل الفاتورة</p>
          <dl className="space-y-3">
            <div className="flex items-baseline justify-between gap-3 text-[13px]">
              <dt className="text-muted-foreground">رقم الطلب</dt>
              <dd className="text-foreground" dir="ltr">{row.number}</dd>
            </div>
            <div className="flex items-baseline justify-between gap-3 text-[13px]">
              <dt className="text-muted-foreground">الباقة</dt>
              <dd className="font-semibold text-foreground">{row.planName} · {formatMonths(serviceMonths)}</dd>
            </div>
            <div className="flex items-baseline justify-between gap-3 border-t border-border pt-3 text-[15px]">
              <dt className="font-semibold text-foreground">الإجمالي المدفوع</dt>
              <dd className="text-lg font-black text-success" dir="ltr">{totalDisplay}</dd>
            </div>
            {content.vatNote ? <p className="mt-0.5 text-xs text-muted-foreground/80">{content.vatNote}</p> : null}
          </dl>
        </div>

        {/* الخطوات الثلاث بدل زرٍّ يفتح حساباً لم يُنشأ بعد: المشتري يريد أن يعرف
            «وبعدين؟»، والجواب الصادق أفضل من زرٍّ يقوده إلى شاشة دخولٍ ترفضه. */}
        <ol className="mb-6 space-y-3 rounded-2xl border border-border bg-card p-5 sm:p-6">
          <li className="flex gap-3">
            <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-success/15 text-xs font-black text-success">١</span>
            <p className="text-[13px] leading-relaxed text-foreground">وصلَنا المبلغ — طلبك مسجَّل برقمه أعلاه.</p>
          </li>
          <li className="flex gap-3">
            <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-black text-primary">٢</span>
            <p className="text-[13px] leading-relaxed text-foreground">
              نجهّز حسابك ومدوّنتك — عادةً خلال ٧٢ ساعة، وأقصاها ١٤ يوماً.
            </p>
          </li>
          <li className="flex gap-3">
            <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-black text-muted-foreground">٣</span>
            <p className="text-[13px] leading-relaxed text-foreground">
              تصلك على بريدك <span className="font-semibold">الفاتورة الضريبية</span> وبيانات الدخول.
              إن لم تجدها، افحص مجلّد «الرسائل غير المرغوبة».
            </p>
          </li>
        </ol>

        {waHref ? (
          <a
            href={waHref}
            target="_blank"
            rel="noopener noreferrer"
            className="mb-4 flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-success text-[15px] font-black text-success-foreground shadow-lg shadow-success/25 transition-colors hover:bg-success/90"
          >
            <MessageCircle className="h-4 w-4" strokeWidth={2.5} />
            <span>تواصل معنا على واتساب</span>
          </a>
        ) : null}

        <div className="flex items-start gap-3 rounded-xl border border-primary/25 bg-primary/5 px-4 py-3.5">
          <MailOpen className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <p className="text-xs leading-relaxed text-muted-foreground">
            احتفظ برقم الطلب <span className="font-semibold text-foreground" dir="ltr">{row.number}</span> — به نجد
            طلبك فوراً في أي مراسلة.
          </p>
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          <a href={modontyUrl("/terms")} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-foreground">سياسة الاسترداد والإلغاء</a>{" "}
          فيها تفاصيل المدّة والاسترجاع.
        </p>
      </main>
    </>
  );
}
