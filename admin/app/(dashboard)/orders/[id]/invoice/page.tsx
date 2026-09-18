import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { AlertTriangle, ArrowRight, CheckCircle2, Mail } from "lucide-react";

import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { checkFinanceAdmin } from "@/lib/require-finance-admin";
import { formatOrderDate } from "../../helpers/format-order-date";
import { renderOrderInvoiceEmail } from "./helpers/render-order-invoice-email";
import { EmailPreviewFrame } from "./components/email-preview-frame";
import { IssueInvoiceButton } from "./components/issue-invoice-button";

export const dynamic = "force-dynamic";

/**
 * إصدارُ الفاتورة صفحةٌ لا نافذة (خالد ١٨ سبتمبر ٢٠٢٦: «ما يكون دايلوج، يكون صفحة
 * ديناميك بيج»). النافذةُ تُغلق بضغطةٍ خارجها فيضيع ما قُرئ، وورقةُ المال تُقرأ ثمّ تُوقَّع.
 *
 * والمعروضُ هو **رسالةُ البريد نفسُها** مولَّدةً بدالّة الإرسال — لا جدولٌ يلخّصها
 * (خالد: «عشان السيلز يشوف بالضبط نفس اللي هيترسل للعميل»).
 *
 * **وهذه الصفحةُ تُصدر فقط** (خالد ١٨ سبتمبر ٢٠٢٦): تُقرأ الرسالةُ، ثمّ يُحجز الرقمُ
 * ويُكتب الصفّ. أمّا التسليمُ — بريداً وواتساباً — فمن صفحة الطلب، حيث تجلس قنواتُه كلُّها
 * في صفٍّ واحد يتحكّم منه الموظّف.
 *
 * والحالةُ تُقرأ من القاعدة لا من ذاكرة المتصفّح (`order.invoiceId`)، فإعادةُ التحميل في
 * أيّ لحظة تعرض الصحيحَ ولا تُصدر فاتورةً ثانية.
 */
export default async function OrderInvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const gate = await checkFinanceAdmin();
  if (gate.status === "unauthenticated") redirect("/login");
  if (gate.status === "forbidden") redirect("/orders");

  const { id } = await params;
  const order = await db.checkoutOrder.findUnique({
    where: { id },
    select: { id: true, number: true, buyerName: true, invoiceId: true, clientId: true },
  });
  if (!order) notFound();

  const [mail, invoice] = await Promise.all([
    renderOrderInvoiceEmail(order.id),
    order.invoiceId
      ? db.invoice.findUnique({ where: { id: order.invoiceId }, select: { number: true, emailSentAt: true, client: { select: { name: true } } } })
      : Promise.resolve(null),
  ]);

  return (
    <main dir="rtl" className="mx-auto flex max-w-3xl flex-col gap-4 pb-10">
      <header className="flex flex-wrap items-center gap-2">
        <Link href={`/orders/${order.id}`} aria-label="العودة إلى الطلب" className="text-muted-foreground transition-colors hover:text-foreground">
          <ArrowRight className="size-4" aria-hidden />
        </Link>
        <h1 className="text-lg font-semibold">{invoice ? `الفاتورة ${invoice.number}` : "معاينة الفاتورة"}</h1>
        <span className="text-xs text-muted-foreground">من الطلب {order.number} — {order.buyerName}</span>
      </header>


      {!mail.ok ? (
        <section role="alert" className="flex items-center gap-2 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm">
          <AlertTriangle className="size-4 shrink-0 text-destructive" aria-hidden />
          {mail.error}
        </section>
      ) : (
        <>
          {/* ترويسةُ الرسالة: إلى مَن تذهب وبأيّ عنوان — وهما ما لا يظهر داخل جسمها. */}
          <section className="flex flex-wrap items-center gap-x-4 gap-y-1 rounded-lg border bg-card px-4 py-2.5 text-[12px]">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <Mail className="size-3.5" aria-hidden />
              إلى
            </span>
            <span dir="ltr" className="font-medium">{mail.to}</span>
            <span className="h-3 w-px bg-border" aria-hidden />
            <span className="text-muted-foreground">الموضوع</span>
            <span className="font-medium">{mail.subject}</span>
            {mail.isTax ? (
              <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${mail.hasQr ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400" : "bg-amber-500/15 text-amber-700 dark:text-amber-400"}`}>
                {mail.hasQr ? "فاتورة ضريبيّة · برمز ZATCA" : "فاتورة ضريبيّة · بلا رمز — أكمل بيانات المنشأة"}
              </span>
            ) : (
              <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-bold text-muted-foreground">إيصال — السوق المصريّ بلا ضريبة</span>
            )}
            {!mail.issued ? <span className="rounded bg-amber-500/15 px-1.5 py-0.5 text-[10px] font-bold text-amber-700 dark:text-amber-400">معاينة — لم تُرسَل</span> : null}
          </section>

          <EmailPreviewFrame html={mail.html} title={invoice ? `الفاتورة ${invoice.number}` : "معاينة الفاتورة"} />
        </>
      )}

      <div className="flex flex-wrap items-center justify-end gap-2">
        {!invoice && mail.ok ? <IssueInvoiceButton orderId={order.id} /> : null}
        {invoice ? (
          <>
            <span className="flex items-center gap-1.5 text-[12px] text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="size-4" aria-hidden />
              صدرت برقم {invoice.number}
              {invoice.emailSentAt ? ` · أُرسلت ${formatOrderDate(invoice.emailSentAt)}` : ""}
            </span>
            {/* الإرسالُ من صفحة الطلب لا من هنا (خالد ١٨ سبتمبر ٢٠٢٦): هذه الصفحةُ
                تُصدر، وقنواتُ التسليم كلُّها تجلس في صفٍّ واحد هناك. */}
            <Button asChild size="sm" variant="outline" className="h-8 gap-1.5 px-2.5 text-[12px]">
              <Link href={`/orders/${order.id}`}>
                <Mail className="size-4" aria-hidden />
                إرسالها من صفحة الطلب
              </Link>
            </Button>
          </>
        ) : null}
      </div>

    </main>
  );
}

