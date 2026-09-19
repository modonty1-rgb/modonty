import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowRight } from "lucide-react";

import { db } from "@/lib/db";
import { slugify } from "@/lib/utils";
import { checkAdmin } from "@/lib/admin-guard";
import { loadSiteUrl } from "@/lib/seo/site-url";
import { formatOrderMoney } from "@/lib/orders/format-order-money";
import { orderProviderLabel } from "@/lib/orders/order-provider-label";
import { ActivateButton } from "./components/activate-button";

/**
 * **صفحةُ عرضٍ وزرّ — لا فورم.**
 *
 * خالد (١٩ سبتمبر ٢٠٢٦): «الصفحة تبعت التفعيل نخلّيها صفحة عرض بس، وإذا في أيّ تعديل
 * يتمّ في صفحة التعديل — حتى السلَج».
 *
 * -- لماذا لا يُسأل الموظّفُ عن شيء --
 * موظّفُ التفعيل لا يعرف العميل: لم يكلّمه ولم يبعه. فكلُّ حقلٍ يُسأل عنه تخمينٌ يُكتب
 * في القاعدة ويُقرأ بعدها حقيقةً. والطلبُ يحمل ما يكفي لفتح الحساب — اسمٌ وبريدٌ وجوالٌ
 * ودولةٌ وحصّة — وما لا يحمله (الصناعة · الشكل القانونيّ · YMYL · السلَج النهائيّ)
 * يُكمَّل من صفحة العميل حيث تُقرأ بياناتُه كاملة.
 *
 * -- والصفحةُ نفسُها هي التأكيد --
 * لا نافذةَ تسأل «هل أنت متأكّد؟»: الصفقةُ وبياناتُ المشتري معروضةٌ كاملة، والزرُّ في
 * آخرها بعد أن تُقرأ. ونافذةٌ فوق صفحةٍ تحمل المعلومةَ نفسَها تُغلَق بلا قراءة.
 *
 * -- وطلبٌ خرج من الطابور لا يُفتح --
 * المفعَّلُ أو غيرُ المدفوع يُعاد إلى الطابور: مَن سبقنا إليه فعّله، ورابطٌ قديمٌ يجب
 * ألّا يفتح باب حسابٍ ثانٍ للعميل نفسه.
 */
export const dynamic = "force-dynamic";

export default async function ActivateOrderPage({ params }: { params: Promise<{ orderId: string }> }) {
  const gate = await checkAdmin();
  if (gate.status === "unauthenticated") redirect("/login");
  if (gate.status === "forbidden") redirect("/");

  const { orderId } = await params;
  const order = await db.checkoutOrder.findUnique({
    where: { id: orderId },
    select: {
      id: true, number: true, status: true, clientId: true,
      buyerName: true, businessName: true, buyerEmail: true, buyerPhone: true, country: true,
      market: true, planName: true, articlesPerMonth: true,
      paidMonths: true, bonusServiceMonths: true, monthlyBaseMinor: true,
      subtotalMinor: true, vatRateBp: true, vatMinor: true, totalMinor: true, currency: true,
      paidAt: true, serviceStartedAt: true, createdAt: true,
      notes: true, salesRepId: true, isInternal: true,
      transactions: { select: { provider: true, providerReference: true }, orderBy: { createdAt: "desc" }, take: 1 },
    },
  });
  if (!order) notFound();
  if (order.status !== "PAID" || order.clientId) redirect("/clients/activate");

  const rep = order.salesRepId
    ? await db.staff.findUnique({ where: { id: order.salesRepId }, select: { name: true } })
    : null;

  const paidAt = order.paidAt ?? order.createdAt;
  const serviceMonths = order.paidMonths + order.bonusServiceMonths;
  const money = (minor: number) => formatOrderMoney(minor, order.currency);
  const date = (d: Date | null) =>
    d ? d.toLocaleDateString("ar-EG", { day: "numeric", month: "long", year: "numeric" }) : null;
  // الاسمُ كما سيُكتب — نفسُ ترتيب `activateFromOrder`، فلا يفاجئ الموظّفَ ما حُفظ.
  const clientName = order.businessName?.trim() || order.buyerName;
  /**
   * السلَجُ كما سيُكتب — مشتقٌّ من اسم العميل، ومعروضٌ كاملاً قبل الضغط (خالد ١٩ سبتمبر
   * ٢٠٢٦: «اعرضه كامل زيّ ما هو، اللي جاي باسم العميل»).
   *
   * ويُقفل بعد الحفظ، ويُصحَّح من صفحة العميل برمز تحقّق (`SlugChangeOtp`) — فعرضُه
   * هنا ليس زينة: هو آخرُ موضعٍ يُرى فيه قبل أن يصير رابطاً عامّاً.
   */
  const slug = slugify(clientName);
  /**
   * الرابطُ كاملاً كما يفتحه الزائر (خالد ١٩ سبتمبر ٢٠٢٦: «عرض الـURL كامل») — لا
   * الجزءُ الأخير منه وحده. السلَجُ مقطعٌ لا يُقرأ رابطاً، والموظّفُ يؤكّد ما سيُنشر.
   */
  const publicUrl = `${(await loadSiteUrl()) ?? "https://www.modonty.com"}/clients/${slug}`.replace(/\/{3,}/g, "//");

  return (
    <main dir="rtl" className="mx-auto flex max-w-3xl flex-col gap-4 pb-10">
      <header className="flex items-center gap-2">
        <Link
          href="/clients/activate"
          aria-label="رجوع للطابور"
          className="inline-flex size-8 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-accent"
        >
          <ArrowRight className="size-4" aria-hidden />
        </Link>
        <div className="min-w-0">
          <h1 className="truncate text-xl font-semibold">تفعيل — {clientName}</h1>
          <p className="mt-0.5 text-[12px] text-muted-foreground">
            راجع البيانات ثمّ فعّل. لا شيء يُكتب بيدك — كلُّه من الطلب{" "}
            <span className="font-medium tabular-nums">{order.number}</span>.
          </p>
        </div>
      </header>

      {order.isInternal ? (
        <p className="rounded-md border border-dashed px-3 py-2 text-[12px] text-muted-foreground">
          <b className="text-foreground">حسابٌ لنا</b> — موسومٌ على الطلب، ويخرج من تقارير الإيراد.
        </p>
      ) : null}

      {order.notes?.startsWith("⚠") ? (
        <p className="rounded-md border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-[12px] text-amber-700 dark:text-amber-400">
          {order.notes}
        </p>
      ) : null}

      <section className="rounded-lg border bg-card">
        {/**
          * الرابطُ في ترويسة البطاقة لا صفّاً فيها (خالد ١٩ سبتمبر ٢٠٢٦، بالصورة).
          *
          * الصفوفُ أزواجُ «حقل ↔ قيمة» تُقرأ بالعين نزولاً، والرابطُ طويلٌ لاتينيٌّ
          * يكسر الصفَّ ويُقصّ. وفي الترويسة يأخذ عرضَ البطاقة كاملاً — وهو عنوانُ ما
          * يُكتب لا واحدٌ من تفاصيله.
          */}
        <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 border-b px-4 py-2.5">
          <h2 className="text-sm font-semibold">ما سيُكتب على الحساب</h2>
          <a
            href={publicUrl}
            target="_blank"
            rel="noreferrer"
            dir="ltr"
            title="الرابط العامّ — يُقفل بعد التفعيل، ويُصحَّح من صفحة العميل برمز تحقّق"
            className="min-w-0 truncate font-mono text-[11.5px] text-muted-foreground hover:text-primary hover:underline"
          >
            {publicUrl}
          </a>
        </div>
        <dl className="grid grid-cols-1 gap-x-6 px-4 py-1 sm:grid-cols-2">
          <Row label="اسم العميل" value={clientName} />
          <Row label="البريد — اسم الدخول" value={order.buyerEmail} ltr />
          <Row label="الجوال" value={order.buyerPhone} ltr />
          <Row
            label="الدولة"
            value={order.country || (order.market === "EG" ? "EG" : order.market === "AE" ? "AE" : "SA")}
          />
          <Row label="حصّة المقالات" value={order.articlesPerMonth ? `${order.articlesPerMonth} مقال/شهر` : null} />
          <Row label="بدء الخدمة" value={date(order.serviceStartedAt)} />
        </dl>
      </section>

      <section className="rounded-lg border bg-card">
        <h2 className="border-b px-4 py-2.5 text-sm font-semibold">ما اشتراه</h2>
        <dl className="grid grid-cols-1 gap-x-6 px-4 py-1 sm:grid-cols-2">
          <Row label="الباقة" value={order.planName} />
          <Row
            label="المدّة"
            value={
              order.bonusServiceMonths
                ? `${order.paidMonths} مدفوعة + ${order.bonusServiceMonths} هديّة = ${serviceMonths} شهر`
                : `${order.paidMonths} شهر`
            }
          />
          <Row label="سعر الشهر" value={money(order.monthlyBaseMinor)} />
          <Row label="قبل الضريبة" value={money(order.subtotalMinor)} />
          <Row label={`الضريبة (${order.vatRateBp / 100}٪)`} value={money(order.vatMinor)} />
          <Row label="الإجمالي المدفوع" value={money(order.totalMinor)} strong />
          <Row label="البوابة" value={order.transactions[0] ? orderProviderLabel(order.transactions[0].provider) : null} />
          <Row label="مرجع العمليّة" value={order.transactions[0]?.providerReference ?? null} ltr />
          <Row label="المندوب" value={rep?.name ?? null} />
          <Row label="تاريخ الدفع" value={date(paidAt)} />
        </dl>
      </section>

      <ActivateButton orderId={order.id} />
    </main>
  );
}

/** الفارغُ «—» بلون باهت: غيابُ القيمة معلومةٌ للموظّف، وإخفاءُ السطر يخفيها. */
function Row({ label, value, ltr, strong, hint }: { label: string; value: string | null; ltr?: boolean; strong?: boolean; hint?: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b py-2 last:border-0 sm:[&:nth-last-child(-n+2)]:border-0">
      <dt className="shrink-0 text-[12px] text-muted-foreground" title={hint}>
        {label}
      </dt>
      <dd
        dir={ltr ? "ltr" : undefined}
        className={`min-w-0 truncate text-[13px] ${ltr ? "text-start" : "text-end"} ${
          value ? (strong ? "font-bold" : "font-medium") : "text-muted-foreground/50"
        }`}
      >
        {value?.trim() || "—"}
      </dd>
    </div>
  );
}
