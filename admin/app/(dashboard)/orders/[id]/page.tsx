import { AlertTriangle, ArrowRight } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { db } from "@/lib/db";
import { linkOrderToClient } from "@/lib/orders/link-order-to-client";
import { checkFinanceAdmin } from "@/lib/require-finance-admin";
import { confirmOrderPaymentAction, createInvoiceFromOrderAction, getExistingClientForOrderEmail, sendOrderInvoiceEmailAction } from "../actions";
import { ConfirmTransferButton } from "../components/confirm-transfer-button";
import { WhatsappInvoiceButton } from "../components/whatsapp-invoice-button";
import { buildInvoiceWhatsappLink } from "../helpers/build-invoice-whatsapp-link";
import { OrderStatusBadge } from "../components/order-status-badge";
import { formatOrderDate } from "../helpers/format-order-date";
import { formatOrderDateTime } from "../helpers/format-order-date-time";
import { formatMonths } from "../helpers/format-months";
import { formatOrderMoney } from "../helpers/format-order-money";
import { humanFailureReason } from "../helpers/human-failure-reason";
import { orderMarketLabel } from "../helpers/order-market-label";
import { orderProviderLabel } from "../helpers/order-provider-label";

export const dynamic = "force-dynamic";

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await db.checkoutOrder.findUnique({ where: { id } });
  if (!order) notFound();

  const [transactions, webhookEvents, attempts, financeGate, existingClient, invoice] = await Promise.all([
    db.paymentTransaction.findMany({ where: { orderId: id }, orderBy: { createdAt: "desc" }, take: 20 }),
    db.paymentWebhookEvent.findMany({ where: { orderId: id }, orderBy: { receivedAt: "desc" }, take: 20 }),
    db.paymentAttempt.findMany({ where: { orderId: id }, orderBy: { createdAt: "desc" }, take: 20 }),
    checkFinanceAdmin(),
    order.status === "PAID" && !order.clientId ? getExistingClientForOrderEmail(id) : Promise.resolve(null),
    order.invoiceId ? db.invoice.findUnique({ where: { id: order.invoiceId }, select: { number: true, emailSentAt: true, client: { select: { name: true } } } }) : Promise.resolve(null),
  ]);
  const isFinanceAdmin = financeGate.status === "ok";
  const failure = humanFailureReason(order.failedReason);
  // PAY-E6: the WhatsApp message is built here (server) — the button only opens it and logs the click.
  const whatsapp = invoice ? buildInvoiceWhatsappLink({ phone: order.buyerPhone, clientName: invoice.client.name, invoiceNumber: invoice.number, totalLabel: formatOrderMoney(order.totalMinor, order.currency), consoleUrl: process.env.CONSOLE_BASE_URL ?? null }) : null;

  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-3 pb-10" dir="rtl">
      {/**
        * شريطٌ واحد بدل ترويسةٍ من ثلاثة أسطر (خالد ١٦ سبتمبر ٢٠٢٦: «مساحات كبيرة
        * بزيادة ما لها داعي»). وكان رقم الطلب يُكتب مرّتين — في مسار التنقّل وفي
        * العنوان — والإجمالي، وهو الرقم الذي تُفتح الصفحة لأجله، مدفونٌ في الصفّ
        * الأخير من شبكةٍ وسط الصفحة. فصار هو البؤرة: أكبر خطٍّ في الشريط.
        */}
      <header
        className={cn(
          "flex flex-wrap items-center justify-between gap-x-6 gap-y-2 rounded-lg border px-4 py-3",
          /**
           * الطلب السعوديّ بخلفيةٍ خضراء (خالد ١٦ سبتمبر ٢٠٢٦): السوق يغيّر كلّ
           * ما تحته — العملة والضريبة (١٥٪ في السعودية وصفر في مصر) وبوابة الدفع — وقراءته
           * من كلمةٍ صغيرة في آخر السطر تُخطئ. واللون لا يحمل المعلومة وحده: اسم السوق
           * مكتوبٌ في السطر نفسه لمن لا يميّز الألوان.
           */
          order.market === "SA" ? "border-emerald-500/60 bg-emerald-500/20" : "bg-card",
        )}
      >
        <div className="flex flex-col gap-1">
          <div className="flex flex-wrap items-center gap-2">
            {/**
              * «رقم الطلب» تسميةٌ لما بعده (خالد ١٦ سبتمبر ٢٠٢٦) — وكان مكانها رابطاً
              * اسمه «طلبات الاشتراك» يقول من أين جئت لا ما تقرأ. والعودة بقيت في السهم
              * إلى يمينها — وفي مسار التنقّل فوق الصفحة أصلاً.
              */}
            <Link
              href="/orders"
              aria-label="العودة إلى طلبات الاشتراك"
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowRight className="size-4" aria-hidden />
            </Link>
            <span className="text-xs text-muted-foreground">رقم الطلب</span>
            <h1 className="text-lg font-semibold leading-none tabular-nums">{order.number}</h1>
            <OrderStatusBadge status={order.status} />
          </div>
          <p className="text-xs text-muted-foreground">{formatOrderDateTime(order.createdAt)}</p>
        </div>

        <div className="flex flex-col items-end gap-1">
          <strong className="text-2xl font-bold leading-none tabular-nums">{formatOrderMoney(order.totalMinor, order.currency)}</strong>
          <p className="text-xs text-muted-foreground">
            {order.planName} · {formatMonths(order.paidMonths)}
            {order.bonusServiceMonths > 0 ? ` + ${order.bonusServiceMonths === 1 ? "شهر" : formatMonths(order.bonusServiceMonths)} هدية` : ""} · {orderMarketLabel(order.market)}
          </p>
        </div>
      </header>

      {/**
        * سبب الفشل تنبيهٌ كامل تحت الترويسة مباشرةً (خالد ١٦ سبتمبر ٢٠٢٦: «مكانه غلط
        * — يا تجيبه كامل يا تعطيني سبباً منطقياً أنا كإنسان أعرف أقرأه»).
        *
        * وكان شارةً مقصوصة في شريط الإجراءات: تقول نصف جملةٍ إنجليزية من JSON المزوّد
        * فلا تُفهم، وتزاحم الأزرار وهي أهمّ منها — الطلب فشل، وهذا أوّل ما يُقرأ.
        * فصار سطرين: جملةٌ بالعربية تقول ما جرى وما العمل، وتحتها النصّ الخام **كاملاً**
        * غير مقصوص لمن يريد التشخيص.
        */}
      {failure ? (
        <section
          role="alert"
          className={cn(
            "flex flex-col gap-1 rounded-lg border px-4 py-3",
            failure.ours ? "border-amber-500/40 bg-amber-500/10" : "border-destructive/40 bg-destructive/10",
          )}
        >
          <div className="flex flex-wrap items-center gap-2">
            <AlertTriangle className={cn("size-4 shrink-0", failure.ours ? "text-amber-500" : "text-destructive")} aria-hidden />
            <strong className={cn("text-sm font-bold", failure.ours ? "text-amber-500" : "text-destructive")}>{failure.title}</strong>
            {failure.ours ? <span className="rounded bg-amber-500/20 px-1.5 py-0.5 text-[10px] font-bold text-amber-500">عطلٌ عندنا</span> : null}
          </div>
          <p className="text-xs text-foreground/80">{failure.detail}</p>
          <p dir="ltr" className="mt-1 break-all font-mono text-[10px] leading-relaxed text-muted-foreground">{order.failedReason}</p>
        </section>
      ) : null}

      {/**
        * الخطوات التالية شريطٌ تحت الترويسة لا بطاقةً في وسط الصفحة: هي سبب فتح
        * الشاشة — تأكيد تحويل، أو فتح حساب، أو إصدار فاتورة — فتُقرأ قبل التفاصيل.
        */}
      <section className="flex flex-wrap items-center gap-2 rounded-lg border bg-card px-4 py-2.5">
        <span className="text-[11px] font-semibold text-muted-foreground">الخطوات التالية</span>
        <span className="h-4 w-px bg-border" aria-hidden />
        <Badge variant="outline" className="text-[11px] font-medium">العميل: {order.clientId ? "مرتبط بحساب" : "لم يُنشأ بعد"}</Badge>
        <Badge variant="outline" className="text-[11px] font-medium">الفاتورة: {invoice ? `${invoice.number}${invoice.emailSentAt ? ` — أُرسلت ${formatOrderDate(invoice.emailSentAt)}` : " — لم تُرسل بعد"}` : "لم تصدر بعد"}</Badge>
        {order.confirmedAt ? <Badge variant="outline" className="text-[11px] font-medium">أكّد التحويل: {formatOrderDate(order.confirmedAt)}{order.transferReference ? ` — مرجع ${order.transferReference}` : ""}</Badge> : null}
        {order.status === "AWAITING_TRANSFER" && isFinanceAdmin ? (
          <ConfirmTransferButton
            action={confirmOrderPaymentAction.bind(null, order.id)}
            buyerName={order.buyerName}
            amountLabel={formatOrderMoney(order.totalMinor, order.currency)}
          />
        ) : null}
        {order.status === "PAID" && !order.clientId ? (
          existingClient ? (
            <form action={linkOrderToClient.bind(null, order.id, existingClient.id)}>
              <Button type="submit" size="sm">ربط بالعميل القائم — {existingClient.name}</Button>
            </form>
          ) : (
            <Link href={`/clients/new?orderId=${order.id}`} className={buttonVariants({ variant: "default", size: "sm" })}>إنشاء حساب العميل</Link>
          )
        ) : null}
        {order.status === "PAID" && order.clientId && !order.invoiceId && isFinanceAdmin ? (
          <form action={createInvoiceFromOrderAction.bind(null, order.id)}>
            <Button type="submit" size="sm">إصدار الفاتورة</Button>
          </form>
        ) : null}
        {invoice && isFinanceAdmin ? (
          <form action={sendOrderInvoiceEmailAction.bind(null, order.id)}>
            <Button type="submit" size="sm" variant={invoice.emailSentAt ? "outline" : "default"}>{invoice.emailSentAt ? "إعادة إرسال الفاتورة" : "إرسال الفاتورة بالإيميل"}</Button>
          </form>
        ) : null}
        {invoice && whatsapp ? ("href" in whatsapp ? <WhatsappInvoiceButton href={whatsapp.href} orderId={order.id} /> : <Badge variant="destructive" className="text-[11px]">{whatsapp.error}</Badge>) : null}
      </section>

      {/**
        * عمودان بصفوف «تسمية ← قيمة» بدل شبكةٍ ثلاثية على عرض الصفحة: الشبكة كانت
        * تعطي كل قيمةٍ خانةً بعرض ٣٣٠px لنصٍّ طوله ٦٠px، فتتباعد العين بين القيمة
        * وتسميتها. والصفّ يضع الاثنين على سطرٍ واحد، والأرقام تنتظم على حافّةٍ واحدة.
        */}
      <div className="grid gap-3 md:grid-cols-2">
        {/**
          * «تفاصيل الاشتراك» لا «لقطة الطلب» (خالد ١٦ سبتمبر ٢٠٢٦: «المصطلحات غير
          * منطقية»). و«اللقطة» ترجمةُ `snapshot` من لغة الكود، تصف كيف خزّنّا الحقول
          * لا ما يراه القارئ — وما يراه هو تفاصيل اشتراكٍ اشتراه عميل.
          */}
        <Panel title="تفاصيل الاشتراك" hint="الأسعار محفوظة كما كانت يوم الشراء">
          <Row label="الباقة" value={order.planName} />
          <Row label="سعر الشهر" value={formatOrderMoney(order.monthlyBaseMinor, order.currency)} />
          <Row label="المدّة المدفوعة" value={formatMonths(order.paidMonths)} />
          <Row label="أشهر مجّانية" value={formatMonths(order.bonusServiceMonths)} />
          <Row label="المبلغ قبل الضريبة" value={formatOrderMoney(order.subtotalMinor, order.currency)} />
          <Row label={`الضريبة (${order.vatRateBp / 100}٪)`} value={formatOrderMoney(order.vatMinor, order.currency)} />
          <Row label="الإجمالي المدفوع" value={formatOrderMoney(order.totalMinor, order.currency)} strong />
        </Panel>

        <Panel title="بيانات العميل">
          <Row label="الاسم" value={order.buyerName} />
          <Row label="الإيميل" value={<span dir="ltr">{order.buyerEmail}</span>} />
          <Row label="الجوال" value={<span dir="ltr">{order.buyerPhone}</span>} />
          <Row label="اسم المنشأة" value={order.businessName || "—"} />
          {/**
            * الدولة بالعربية لا بالرمز `EG` — الشاشة عربية فلا تُظهر رموز القاعدة.
            *
            * وهي فارغة في ٣٤ من ٤٢ طلباً، وحين تُملأ تساوي السوق دائماً (قياس ١٦
            * سبتمبر ٢٠٢٦). فالصفّ يكاد يكون تكراراً لما في الترويسة — يُترك الآن
            * لأنّه بيانٌ مخزَّن، ويُحذف إن قرّر خالد أنّه لا يضيف شيئاً.
            */}
          <Row label="الدولة" value={order.country ? orderMarketLabel(order.country) : "—"} />
        </Panel>
      </div>

      {/**
        * السجلّات الثلاثة في بطاقةٍ واحدة: كانت ثلاث بطاقات كاملة الحواشي، وهي في
        * الطلب العاديّ فارغةٌ كلّها — ٣٦٠px من الشاشة تقول «لا شيء» ثلاث مرّات.
        * وصارت الفارغة سطراً واحداً، والعدّاد يقول ما فيها قبل فتح العين عليها.
        */}
      <section className="rounded-lg border bg-card">
        <h2 className="border-b px-4 py-2 text-[11px] font-semibold text-muted-foreground">سجلّ ما جرى مع البوابة</h2>
        <div className="divide-y">
          <LogBlock title="عمليات الدفع" count={transactions.length} empty="لم تُسجّل أي عملية دفع على هذا الطلب.">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead className="h-8 text-right text-[11px]">البوابة</TableHead>
                  <TableHead className="h-8 text-right text-[11px]">الحالة</TableHead>
                  <TableHead className="h-8 text-right text-[11px]">المبلغ</TableHead>
                  <TableHead className="h-8 text-right text-[11px]">رقم العملية لدى البوابة</TableHead>
                  <TableHead className="h-8 text-right text-[11px]">التاريخ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell className="py-1.5 text-xs">{orderProviderLabel(transaction.provider)}</TableCell>
                    <TableCell className="py-1.5 text-xs">{transaction.status}</TableCell>
                    <TableCell className="py-1.5 text-xs tabular-nums">{formatOrderMoney(transaction.amountMinor, transaction.currency)}</TableCell>
                    <TableCell className="py-1.5 text-xs text-muted-foreground">{transaction.providerReference || transaction.providerOrderRef || "—"}</TableCell>
                    <TableCell className="py-1.5 text-xs text-muted-foreground">{formatOrderDateTime(transaction.createdAt)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </LogBlock>

          <LogBlock title="إشعارات البوابة" count={webhookEvents.length} empty="لم تُرسل البوابة أي إشعارٍ عن هذا الطلب.">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead className="h-8 text-right text-[11px]">البوابة</TableHead>
                  <TableHead className="h-8 text-right text-[11px]">نوع الإشعار</TableHead>
                  <TableHead className="h-8 text-right text-[11px]">وصل</TableHead>
                  <TableHead className="h-8 text-right text-[11px]">عُولج</TableHead>
                  <TableHead className="h-8 text-right text-[11px]">الخطأ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {webhookEvents.map((event) => (
                  <TableRow key={event.id}>
                    <TableCell className="py-1.5 text-xs">{orderProviderLabel(event.provider)}</TableCell>
                    <TableCell className="py-1.5 text-xs text-muted-foreground">{event.eventType || "—"}</TableCell>
                    <TableCell className="py-1.5 text-xs text-muted-foreground">{formatOrderDateTime(event.receivedAt)}</TableCell>
                    <TableCell className="py-1.5 text-xs text-muted-foreground">{event.processedAt ? formatOrderDateTime(event.processedAt) : "—"}</TableCell>
                    <TableCell className="py-1.5 text-xs text-destructive">{event.error || "—"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </LogBlock>

          <LogBlock title="محاولات لم تنجح" count={attempts.length} empty="لا محاولة فاشلة على هذا الطلب.">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead className="h-8 text-right text-[11px]">البوابة</TableHead>
                  <TableHead className="h-8 text-right text-[11px]">الرمز</TableHead>
                  <TableHead className="h-8 text-right text-[11px]">نصّ البوابة</TableHead>
                  <TableHead className="h-8 text-right text-[11px]">التاريخ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {attempts.map((attempt) => (
                  <TableRow key={attempt.id}>
                    <TableCell className="py-1.5 text-xs">{orderProviderLabel(attempt.provider)}</TableCell>
                    <TableCell className="py-1.5 text-xs text-muted-foreground">{attempt.reasonCode || "—"}</TableCell>
                    <TableCell className="py-1.5 text-xs text-destructive">{attempt.message || "—"}</TableCell>
                    <TableCell className="py-1.5 text-xs text-muted-foreground">{formatOrderDateTime(attempt.createdAt)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </LogBlock>
        </div>
      </section>
    </main>
  );
}

/** لوحٌ بترويسةٍ نحيفة — العنوان تسميةٌ لا عنوانٌ رئيسيّ، فلا يأخذ حجم `text-2xl`. */
function Panel({ title, hint, children }: { title: string; hint?: string; children: ReactNode }) {
  return (
    <section className="rounded-lg border bg-card">
      <div className="flex flex-wrap items-baseline gap-x-2 border-b px-4 py-2">
        <h2 className="text-[11px] font-semibold text-muted-foreground">{title}</h2>
        {hint ? <span className="text-[10px] text-muted-foreground/70">{hint}</span> : null}
      </div>
      <dl className="px-4">{children}</dl>
    </section>
  );
}

/** صفٌّ واحد: التسمية عند حافّة القراءة، والقيمة عند الحافّة المقابلة فتنتظم الأرقام. */
function Row({ label, value, strong }: { label: string; value: ReactNode; strong?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b py-1.5 last:border-0">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className={cn("text-[13px] tabular-nums", strong ? "font-bold" : "font-medium")}>{value}</dd>
    </div>
  );
}

/** سجلٌّ فرعيّ: عدّادٌ يقول ما فيه، وجدولٌ لا يُرسم إلا إن كان فيه صفوف. */
function LogBlock({ title, count, empty, children }: { title: string; count: number; empty: string; children: ReactNode }) {
  return (
    <div className="px-4 py-2.5">
      <div className="flex items-center gap-2">
        <h3 className="text-xs font-semibold">{title}</h3>
        <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-bold tabular-nums text-muted-foreground">{count}</span>
        {count === 0 ? <span className="text-[11px] text-muted-foreground">{empty}</span> : null}
      </div>
      {count === 0 ? null : <div className="mt-2 overflow-x-auto rounded-md border">{children}</div>}
    </div>
  );
}
