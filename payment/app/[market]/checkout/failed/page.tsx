import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { XCircle, RotateCcw, MessageCircle } from "lucide-react";

import { db } from "@/lib/db";
import { resolveCheckoutReason } from "@/lib/checkout/resolve-checkout-reason";
import { CheckoutHeader } from "../components/checkout-header/CheckoutHeader";

/**
 * صفحة «الدفع لم يكتمل» (PAY-D5) — منقولة من جبر سيو `checkout/failed/page.tsx`.
 *
 * أوّل سطرٍ يقرؤه من فشلت بطاقته هو **«لم يُخصم أي مبلغ»** — لأنه أوّل سؤالٍ في ذهنه، وتركُه
 * بلا جواب يجعله يتّصل بالبنك قبل أن يتّصل بنا.
 *
 * وضعان: طلبٌ موجود (تفاصيله من القاعدة)، أو تصعيدٌ من صفحة الدفع بعد محاولاتٍ متكرّرة بلا
 * طلبٍ أصلاً (السبب وحده). وفي الحالتين مخرجان: إعادة المحاولة بنفس الباقة، وواتساب.
 */

export const metadata: Metadata = {
  title: { absolute: "الدفع لم يكتمل — مدونتي" },
  robots: { index: false, follow: false },
};

export const instant = false;

const MARKETS = { sa: "SA" } as const;

export default async function CheckoutFailedPage({
  params,
  searchParams,
}: {
  params: Promise<{ market: string }>;
  searchParams: Promise<{ order?: string; reason?: string; plan?: string; months?: string }>;
}) {
  const { market: slug } = await params;
  if (!(slug in MARKETS)) notFound();

  const { order, reason, plan: planParam, months: monthsParam } = await searchParams;

  let row: { id: string; number: string; status: string; failedReason: string | null; planSlug: string; paidMonths: number } | null = null;
  if (order?.trim()) {
    row = await db.checkoutOrder.findUnique({
      where: { id: order.trim() },
      select: { id: true, number: true, status: true, failedReason: true, planSlug: true, paidMonths: true },
    }).catch(() => null);

    // حالةٌ متناقضة: طلبٌ مدفوع يُفتح على صفحة فشل — الحقيقة في القاعدة لا في العنوان.
    if (row?.status === "PAID") redirect(`/${slug}/checkout/success?order=${row.id}`);
  }

  // أسبقيّة السبب: العنوان ← القاعدة ← الافتراضي.
  const resolved = resolveCheckoutReason(reason || row?.failedReason);

  const retryPlan = row?.planSlug || planParam;
  const retryMonths = row?.paidMonths ? String(row.paidMonths) : monthsParam;
  const retryQuery = new URLSearchParams();
  if (retryPlan) retryQuery.set("plan", retryPlan);
  if (retryMonths) retryQuery.set("months", retryMonths);
  const canRetry = retryQuery.toString().length > 0;
  const retryHref = canRetry ? `/${slug}/checkout?${retryQuery.toString()}` : `/${slug}`;

  const waNumber = process.env.NEXT_PUBLIC_SALES_WHATSAPP?.replace(/\D/g, "") ?? "";
  const waText = row ? `مرحباً، عندي مشكلة في دفع الطلب ${row.number}` : "مرحباً، عندي مشكلة في إتمام الدفع";
  const waHref = waNumber ? `https://wa.me/${waNumber}?text=${encodeURIComponent(waText)}` : null;

  return (
    <>
      <CheckoutHeader backHref={`/${slug}`} />
      <main className="mx-auto max-w-xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8" dir="rtl">
        <div className="mb-8 text-center">
          <div className="inline-flex h-20 w-20 items-center justify-center rounded-full border-2 border-destructive/40 bg-destructive/10 shadow-lg shadow-destructive/20">
            <XCircle className="h-11 w-11 text-destructive" strokeWidth={2.5} />
          </div>
          <h1 className="mt-6 text-2xl font-black text-foreground sm:text-3xl">الدفع لم يكتمل</h1>
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
            <strong className="text-foreground">لم يُخصم أي مبلغ من بطاقتك.</strong>{" "}
            {canRetry ? "يمكنك المحاولة مرة أخرى أو التواصل معنا للمساعدة." : "تواصل معنا على واتساب وسنساعدك فوراً."}
          </p>
        </div>

        <div className="mb-6 rounded-2xl border border-destructive/25 bg-destructive/5 p-5 sm:p-6">
          <p className="mb-3 text-xs font-semibold text-destructive/80">سبب الفشل</p>
          <p className="mb-2 text-[15px] font-semibold text-destructive">{resolved.title}</p>
          <p className="text-[13px] leading-relaxed text-muted-foreground">{resolved.hint}</p>
          {row && (
            <div className="mt-4 flex items-baseline justify-between gap-3 border-t border-destructive/20 pt-3 text-xs">
              <span className="text-muted-foreground">رقم الطلب</span>
              <span className="text-muted-foreground" dir="ltr">{row.number}</span>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3">
          {canRetry && (
            <a
              href={retryHref}
              className="flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-foreground text-[15px] font-black text-background no-underline shadow-[0_14px_30px_-14px_color-mix(in_oklch,var(--foreground)_45%,transparent)] transition-colors hover:bg-foreground/90"
            >
              <RotateCcw className="h-4 w-4" strokeWidth={2.5} />
              <span>أعد المحاولة</span>
            </a>
          )}

          {/* واتساب يظهر دائماً، ويصير الفعل الأول حين لا تكون هناك إعادة محاولة ممكنة.
              بلا رقمٍ مضبوط في البيئة لا يُرسم زرٌّ يفتح رابطاً مكسوراً. */}
          {waHref && (
            <a
              href={waHref}
              target="_blank"
              rel="noopener noreferrer"
              className={
                canRetry
                  ? "flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-border bg-card text-sm font-semibold text-foreground no-underline transition-colors hover:bg-muted"
                  : "flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-success text-[15px] font-black text-success-foreground no-underline shadow-lg shadow-success/25 transition-colors hover:bg-success/90"
              }
            >
              <MessageCircle className={canRetry ? "h-4 w-4 text-success" : "h-5 w-5"} strokeWidth={2.25} />
              <span>تواصل معنا على واتساب</span>
            </a>
          )}
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          {canRetry
            ? "الضغط على «أعد المحاولة» يرجعك لنفس الباقة ونفس المدّة — لا تحتاج تختار من جديد."
            : "فريقنا يراجع المشكلة معك ويكمل الدفع يدوياً إذا لزم الأمر."}
        </p>
      </main>
    </>
  );
}
