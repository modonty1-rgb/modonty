import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { db } from "@/lib/db";
import { CheckoutHeader } from "../components/checkout-header/CheckoutHeader";
import { WaitScreen } from "./components/wait-screen/WaitScreen";

/**
 * شاشة الانتظار (PAY-D4) — منقولة من جبر سيو `checkout/processing/page.tsx`.
 *
 * تقطع الطريق على السيرفر قبل رسم أي دوّارة: طلبٌ حُسم أمره يُحوَّل مباشرةً إلى صفحته
 * النهائية. بدون ذلك يرى من عاد بزرّ الرجوع — بعد أن دفع — شاشة «قيد المعالجة» من جديد.
 */

export const metadata: Metadata = {
  title: { absolute: "جارٍ معالجة الدفع — مدونتي" },
  robots: { index: false, follow: false },
};

export const instant = false;

const MARKETS = { sa: "SA" } as const;

export default async function CheckoutProcessingPage({
  params,
  searchParams,
}: {
  params: Promise<{ market: string }>;
  searchParams: Promise<{ order?: string }>;
}) {
  const { market: slug } = await params;
  if (!(slug in MARKETS)) notFound();

  const { order } = await searchParams;
  if (!order?.trim()) redirect(`/${slug}`);

  const row = await db.checkoutOrder.findUnique({
    where: { id: order.trim() },
    select: {
      id: true, number: true, status: true,
      transactions: { orderBy: { createdAt: "desc" }, take: 1, select: { providerOrderRef: true } },
    },
  }).catch(() => null);

  if (!row) redirect(`/${slug}`);

  if (row.status === "PAID") redirect(`/${slug}/checkout/success?order=${row.id}`);
  // ⚠ لا يُمرَّر `failedReason` في العنوان: هو نصّ المزوّد الخام («NGENIUS_API_KEY is
  // not set»)، وتمريره يكتبه في شريط عنوان المشتري. صفحة الفشل تقرؤه من القاعدة
  // بالمعرّف وتترجمه إلى جملةٍ مفهومة، فالمعرّف وحده يكفي.
  if (row.status === "FAILED" || row.status === "CANCELLED") redirect(`/${slug}/checkout/failed?order=${row.id}`);
  // تحويلٌ بنكيّ أو مستردّ ⇒ لا معنى لشاشة انتظار بوّابة.
  if (row.status === "AWAITING_TRANSFER" || row.status === "REFUNDED") redirect(`/${slug}`);

  // رقم الطلب البشريّ هو ما يقرؤه المشتري لو اتّصل — أوضح من مرجع المزوّد.
  const refShort = row.number || row.transactions[0]?.providerOrderRef || row.id.slice(-8).toUpperCase();

  return (
    <>
      <CheckoutHeader backHref={`/${slug}`} />
      <WaitScreen marketSlug={slug} order={row.id} refShort={refShort} />
    </>
  );
}
