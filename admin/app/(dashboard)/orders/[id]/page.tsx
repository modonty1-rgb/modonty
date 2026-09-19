import { AlertTriangle, ArrowRight, FilePlus2, Pencil, ReceiptText, RefreshCw } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { db } from "@/lib/db";
import { checkFinanceAdmin } from "@/lib/require-finance-admin";
import { confirmOrderPaymentAction } from "../actions";
import { ConfirmTransferButton } from "../components/confirm-transfer-button";
import { SendInvoiceButton } from "../components/send-invoice-button";
import { RefundOrderButton } from "../components/refund-order-button";
import { CancelOrderButton } from "../components/cancel-order-button";
import { WhatsappInvoiceButton } from "../components/whatsapp-invoice-button";
import { OrderStatusBadge } from "../components/order-status-badge";
import { formatOrderDate } from "../helpers/format-order-date";
import { formatOrderDateTime } from "../helpers/format-order-date-time";
import { formatMonths } from "../helpers/format-months";
import { formatOrderMoney } from "@/lib/orders/format-order-money";
import { humanFailureReason } from "../helpers/human-failure-reason";
import { orderMarketLabel } from "../helpers/order-market-label";
import { orderProviderLabel } from "@/lib/orders/order-provider-label";
import { buildInvoiceWhatsappLink } from "../helpers/build-invoice-whatsapp-link";
import { getOrderStatement } from "./helpers/get-order-statement";
import { getSubscriptionStanding } from "../helpers/get-subscription-standing";

export const dynamic = "force-dynamic";

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await db.checkoutOrder.findUnique({ where: { id } });
  if (!order) notFound();

  const [transactions, webhookEvents, attempts, financeGate, invoice, salesRep] = await Promise.all([
    db.paymentTransaction.findMany({ where: { orderId: id }, orderBy: { createdAt: "desc" }, take: 20 }),
    db.paymentWebhookEvent.findMany({ where: { orderId: id }, orderBy: { receivedAt: "desc" }, take: 20 }),
    db.paymentAttempt.findMany({ where: { orderId: id }, orderBy: { createdAt: "desc" }, take: 20 }),
    checkFinanceAdmin(),
    order.invoiceId ? db.invoice.findUnique({ where: { id: order.invoiceId }, select: { number: true, emailSentAt: true, client: { select: { name: true } } } }) : Promise.resolve(null),
    // المندوبُ من الطلب نفسه: هو صاحبُ هذه الصفقة، لا مَن يتابع العميلَ اليوم.
    order.salesRepId ? db.staff.findUnique({ where: { id: order.salesRepId }, select: { name: true } }) : Promise.resolve(null),
  ]);
  const isFinanceAdmin = financeGate.status === "ok";
  const needsReview = order.notes?.startsWith("⚠") ?? false;
  // بلا عميلٍ لا دفترَ أصلاً — فيُقال ذلك صراحةً بدل أصفارٍ تُقرأ حقيقةً.
  const statement = order.clientId ? await getOrderStatement(order.clientId, order) : null;
  // حالُ الاشتراك — يقرّر ظهورَ زرّ التجديد، وهو نفسُ الحاسب الذي يلوّن صفوف الجدول.
  const standing = order.clientId ? getSubscriptionStanding(order) : null;
  const failure = humanFailureReason(order.failedReason);
  // PAY-E6: رسالةُ واتساب تُبنى هنا (الخادم) — والزرُّ يفتحها ويسجّل الضغطة فقط.
  const whatsapp = invoice
    ? buildInvoiceWhatsappLink({ phone: order.buyerPhone, clientName: invoice.client.name, invoiceNumber: invoice.number, totalLabel: formatOrderMoney(order.totalMinor, order.currency), consoleUrl: process.env.CONSOLE_BASE_URL ?? null })
    : null;

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
              aria-label="العودة إلى الاشتراكات"
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
        * شريطُ الحالة — يقول ما اكتمل وما نقص، لا ما يمكن فعلُه فقط (خالد ١٨ سبتمبر ٢٠٢٦:
        * «الخطوات التالية محتاجة تحسين… تكون إنفورميشن: إيش النواقص وإيش الموجود»).
        *
        * كان صفّاً من شاراتٍ رماديّة متساوية الوزن: «العميل: مرتبط» و«الفاتورة: لم تصدر»
        * تُقرآن بنفس النبرة، فلا تُعرف حالةٌ من نقص. الآن لكلّ حقيقةٍ **علامةٌ ولون**:
        * أخضرُ موجود · كهرمانيٌّ ناقص — فتُمسح العينُ الصفَّ وتقف عند الكهرمانيّ وحده.
        *
        * والمندوبُ من أهمّها (كان غائباً تماماً): بلا مندوبٍ لا تُنسب الصفقةُ لأحد،
        * ولا يقفل تقريرُ العمولات.
        */}
      <section className="flex flex-col gap-2.5 rounded-lg border bg-card px-4 py-3">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <Fact
            ok={!!order.clientId}
            label="العميل"
            value={order.clientId ? (invoice?.client.name ?? "مرتبط بحساب") : "لم يُنشأ بعد"}
            href={order.clientId ? `/clients/${order.clientId}` : undefined}
          />
          <Fact ok={!!salesRep} label="المندوب" value={salesRep?.name ?? "غير محدَّد"} />
          <Fact
            ok={!!invoice}
            label="الفاتورة"
            value={invoice ? invoice.number : "لم تصدر"}
            href={order.clientId ? `/orders/${order.id}/invoice` : undefined}
          />
          <Fact
            ok={!!invoice?.emailSentAt}
            label="التسليم"
            value={invoice?.emailSentAt ? `أُرسلت ${formatOrderDate(invoice.emailSentAt)}` : invoice ? "لم تُرسل بعد" : "—"}
            muted={!invoice}
          />
          {order.status === "AWAITING_TRANSFER" || order.confirmedAt ? (
            <Fact
              ok={!!order.confirmedAt}
              label="التحويل"
              value={order.confirmedAt ? `أُكّد ${formatOrderDate(order.confirmedAt)}${order.transferReference ? ` — ${order.transferReference}` : ""}` : "بانتظار التأكيد"}
            />
          ) : null}
          {/* كشفُ الحساب رابطٌ في السطر لا زرّاً في آخر الشريط: قراءةٌ لا فعل، فلا يزاحم
              ما يُفعَل الآن (خالد ١٨ سبتمبر: «شيل البوتوم تبع كشف الحساب»). */}
          {order.clientId ? (
            <Link
              href={`/clients/${order.clientId}/account`}
              className="ms-auto inline-flex items-center gap-1.5 text-[12px] text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
            >
              <ReceiptText className="size-3.5" aria-hidden />
              كشف الحساب
            </Link>
          ) : null}
        </div>

        {/* ما يُفعَل الآن — يُفصَل عن الحقائق بخطّ، فلا يختلط ما يُقرأ بما يُضغط. */}
        <div className="flex flex-wrap items-center gap-2 border-t pt-2.5">
          {order.status === "AWAITING_TRANSFER" && isFinanceAdmin ? (
            <ConfirmTransferButton
              action={confirmOrderPaymentAction.bind(null, order.id)}
              buyerName={order.buyerName}
              amountLabel={formatOrderMoney(order.totalMinor, order.currency)}
            />
          ) : null}
          {/**
            * **لا تفعيلَ من هنا** (خالد ١٩ سبتمبر ٢٠٢٦: «شيل التفعيل من الصفحة تبعت
            * الـorder»).
            *
            * كان هنا زرّان: «فعّل» ينشئ حساباً، و«ربط بالعميل القائم» يربط تجديداً.
            * وكلاهما انتقل إلى بابِ موظّف التفعيل (`/clients/activate`) بعد أن فُصل
            * الدوران: مَن يقرأ المال غيرُ مَن يفتح الحسابات. وهذه الصفحة تبقى للمال —
            * تأكيدُ حوالة · إصدارُ فاتورة · تسليمُها · استرداد.
            *
            * والطلبُ المدفوعُ بلا حساب لا يضيع: يظهر في الطابور، وفي توجل «ينتظر
            * التفعيل» هنا، وكلاهما يقرأ `AWAITING_ACTIVATION` نفسَها.
            */}
          {/* الإصدارُ صفحةٌ تُقرأ فيها الرسالةُ قبل حجز الرقم — ويختفي زرُّه متى صدرت،
              فتحلّ محلَّه قنواتُ التسليم. */}
          {order.status === "PAID" && order.clientId && !order.invoiceId && isFinanceAdmin ? (
            <Button asChild size="sm" className="h-8 gap-1.5 px-2.5 text-[12px]">
              <Link href={`/orders/${order.id}/invoice`}>
                <FilePlus2 className="size-4" aria-hidden />
                إصدار الفاتورة
              </Link>
            </Button>
          ) : null}
          {invoice && isFinanceAdmin ? <SendInvoiceButton orderId={order.id} resend={!!invoice.emailSentAt} /> : null}
          {invoice && whatsapp ? ("href" in whatsapp ? <WhatsappInvoiceButton href={whatsapp.href} orderId={order.id} /> : <Badge variant="destructive" className="text-[11px]">{whatsapp.error}</Badge>) : null}

          {/* التجديد: طلبٌ جديد بهويّة هذا الطلب وباقته — يظهر متى انقضت المدّة أو قاربت.
              كان يعني كتابةَ كلّ شيءٍ من جديد ثمّ الربطَ يدويّاً، فيبقى المنتهي منتهياً. */}
          {order.status === "PAID" && order.clientId && standing && (standing.state === "expired" || standing.state === "expiring") && isFinanceAdmin ? (
            <Button asChild size="sm" variant={standing.state === "expired" ? "default" : "outline"} className="h-8 gap-1.5 px-2.5 text-[12px]">
              <Link href={`/orders/new?renewFrom=${order.id}`}>
                <RefreshCw className="size-4" aria-hidden />
                {standing.state === "expired" ? "تجديد — انتهى" : `تجديد — يبقى ${Math.abs(standing.daysLeft ?? 0)} يوم`}
              </Link>
            </Button>
          ) : null}

          {/**
            * الإلغاء: لما لم يصل فيه مال. يظهر للحالتين وحدهما، ويختفي متى صدرت فاتورة
            * — فالرقمُ محجوزٌ والورقةُ عند المشتري، وبابُ ذاك الاستردادُ لا الإلغاء.
            */}
          {(order.status === "AWAITING_PAYMENT" || order.status === "AWAITING_TRANSFER") && !order.invoiceId && isFinanceAdmin ? (
            <CancelOrderButton orderId={order.id} orderNumber={order.number} buyerName={order.buyerName} />
          ) : null}

          {/* الاسترداد: تسجيلُ ما حصل في البنك — يُخرج الطلب من الإيراد ولا يفكّ التفعيل. */}
          {order.status === "PAID" && isFinanceAdmin ? (
            <RefundOrderButton orderId={order.id} amountLabel={formatOrderMoney(order.totalMinor, order.currency)} buyerName={order.buyerName} />
          ) : null}

          {/* التعديلُ بابٌ دائم لا خطوةٌ تمضي، فيتنحّى لآخر الصفّ. ولمدير النظام وحده:
              الترحيل بنى الطلباتِ من بياناتٍ متناقضة فوُسمت، وتُصحَّح بيدٍ تعرف الحقيقة. */}
          {isFinanceAdmin ? (
            <Button asChild size="sm" variant={needsReview ? "default" : "outline"} className="ms-auto h-8 gap-1.5 px-2.5 text-[12px]">
              <Link href={`/orders/${order.id}/edit`} title={needsReview ? "الطلب مُرحَّل ويحتاج مراجعة" : undefined}>
                <Pencil className="size-4" aria-hidden />
                {needsReview ? "مراجعة وتعديل ⚠" : "تعديل الطلب"}
              </Link>
            </Button>
          ) : null}
        </div>
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
        * كشفُ الحساب مختصراً — تحت الطلب (خالد ١٨ سبتمبر ٢٠٢٦): «إذا في كشف حساب
        * اعرضها، وإذا ما في قُل لا يوجد. فيه الأمور الماليّة وعدد الأرتكل المتّفق عليها
        * والمتبقّي منها».
        *
        * ثلاثةُ أسئلةٍ كانت في ثلاث شاشات: كم دُفع وكم بقي · كم مقالاً اتُّفق عليه وكم
        * سُلّم · وأين نحن من المدّة. والفراغُ يُقال صراحةً: «لا كشف حساب بعد» ومعه سببُه،
        * لأنّ بطاقةً فارغةً تُقرأ عطلاً لا حقيقة.
        */}
      <section className="rounded-lg border bg-card">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b px-4 py-2">
          <h2 className="text-[11px] font-semibold text-muted-foreground">كشف الحساب</h2>
          {order.clientId ? (
            <Link href={`/clients/${order.clientId}/account`} className="text-[11px] text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">
              الكشف الكامل ←
            </Link>
          ) : null}
        </div>

        {!statement ? (
          <p className="px-4 py-6 text-center text-[13px] text-muted-foreground">
            لا كشف حساب بعد — {order.status === "PAID" ? "الطلب لم يُفعَّل، فلا دفترَ للعميل." : "الطلب لم يُدفع بعد."}
          </p>
        ) : (
          <div className="grid gap-px bg-border sm:grid-cols-3">
            <StatCell
              label="المسدَّد"
              value={formatOrderMoney(statement.paidMinor, statement.currency)}
              note={`${statement.invoiceCount} ${statement.invoiceCount === 1 ? "فاتورة" : "فواتير"}`}
              tone={statement.paidMinor > 0 ? "good" : "muted"}
            />
            <StatCell
              label="المستحقّ"
              value={formatOrderMoney(statement.dueMinor, statement.currency)}
              note={statement.dueMinor > 0 ? "فاتورةٌ صدرت ولم تُسدَّد" : "لا مستحقّات"}
              tone={statement.dueMinor > 0 ? "bad" : "good"}
            />
            <StatCell
              label="المقالات"
              value={
                statement.articlesAgreed == null
                  ? `${statement.articlesDelivered} منشوراً`
                  : `${statement.articlesDelivered} من ${statement.articlesAgreed}`
              }
              note={
                statement.articlesAgreed == null
                  ? "بلا حصّةٍ على الطلب"
                  : `${statement.articlesPerMonth}/شهر × ${statement.serviceMonths} — يتبقّى ${Math.max(0, statement.articlesAgreed - statement.articlesDelivered)}`
              }
              tone={
                statement.articlesAgreed == null
                  ? "muted"
                  : statement.articlesDelivered >= statement.articlesAgreed
                    ? "good"
                    : "warn"
              }
            />
          </div>
        )}
      </section>

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
/**
 * حقيقةٌ واحدة في شريط الحالة: علامةٌ · تسميةٌ · قيمة.
 *
 * العلامةُ واللونُ يقولان «مكتمل» أو «ناقص» قبل أن تُقرأ الكلمات، فتقف العينُ على
 * الكهرمانيّ وحده. واللونُ لا يحمل المعلومة منفرداً: «✓» و«!» محرفان يُقرآن لمن لا
 * يميّز الألوان، والقيمةُ مكتوبةٌ صراحةً («غير محدَّد» لا خانةٌ فارغة).
 *
 * و`muted` لما لا يُسأل عنه بعد — «التسليم» قبل أن تصدر فاتورةٌ أصلاً: ليس نقصاً
 * يُلام عليه أحد، فلا يُصبغ كهرمانيّاً.
 */
function Fact({ ok, label, value, href, muted }: { ok: boolean; label: string; value: string; href?: string; muted?: boolean }) {
  const tone = muted ? "text-muted-foreground" : ok ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400";
  const body = (
    <>
      <span className={cn("text-[11px] font-bold leading-none", tone)} aria-hidden>
        {muted ? "–" : ok ? "✓" : "!"}
      </span>
      <span className="text-[11px] text-muted-foreground">{label}</span>
      <span className={cn("text-[12px] font-medium", muted && "text-muted-foreground")}>{value}</span>
    </>
  );
  return href ? (
    <Link href={href} className="flex items-center gap-1.5 underline-offset-4 transition-opacity hover:underline hover:opacity-80">
      {body}
    </Link>
  ) : (
    <span className="flex items-center gap-1.5">{body}</span>
  );
}

/** خانةُ رقمٍ في كشف الحساب: تسميةٌ صغيرة · الرقم كبيراً · سطرٌ يفسّره. */
function StatCell({ label, value, note, tone }: { label: string; value: string; note: string; tone: "good" | "bad" | "warn" | "muted" }) {
  const color =
    tone === "good" ? "text-emerald-600 dark:text-emerald-400"
    : tone === "bad" ? "text-red-600 dark:text-red-400"
    : tone === "warn" ? "text-amber-600 dark:text-amber-400"
    : "text-foreground";
  return (
    <div className="bg-card px-4 py-3">
      <p className="text-[11px] text-muted-foreground">{label}</p>
      <p className={cn("mt-1 text-lg font-bold tabular-nums leading-none", color)}>{value}</p>
      <p className="mt-1.5 text-[11px] text-muted-foreground">{note}</p>
    </div>
  );
}

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
