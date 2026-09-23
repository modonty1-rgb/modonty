import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { db } from "@/lib/db";
import { checkSalesDesk } from "@/lib/require-sales-desk";
import { getSalesReps } from "@/app/(dashboard)/users/actions/users-actions";
import { OrderEditForm, type OrderForEdit } from "./components/order-edit-form";

export const dynamic = "force-dynamic";

/** حقلُ `date` في المتصفّح يقرأ `YYYY-MM-DD` وحدها. */
const day = (d: Date | null) => (d ? d.toISOString().slice(0, 10) : null);

export default async function EditOrderPage({ params }: { params: Promise<{ id: string }> }) {
  // الأدمن والمبيعات (خالد ٢٠ سبتمبر ٢٠٢٦) — والزرُّ في صفحة الطلب يحرس نفسَ البوّابة.
  const gate = await checkSalesDesk();
  if (gate.status === "unauthenticated") redirect("/login");
  if (gate.status === "forbidden") redirect("/orders");

  const { id } = await params;
  const order = await db.checkoutOrder.findUnique({
    where: { id },
    select: {
      id: true, number: true, buyerName: true, clientId: true,
      planName: true, articlesPerMonth: true, salesRepId: true,
      market: true, totalMinor: true, paidMonths: true,
      bonusServiceMonths: true,
      serviceStartedAt: true, activatedAt: true, paidAt: true, notes: true,
    },
  });
  if (!order) notFound();

  /**
   * أوّلُ مقالٍ سُلِّم لصاحب هذا الطلب — يُقرأ ولا يُخزَّن.
   *
   * `clientId` على الطلب معرّفٌ مجرّد بلا `@relation` (حذفُ العميل يجب ألّا يجرّ
   * طلباته)، فالجلبُ باستعلامٍ مستقلّ لا بـ`include`.
   */
  const [firstArticle, salesReps, assignedRep] = await Promise.all([
    order.clientId
      ? db.article.aggregate({
          where: { clientId: order.clientId, NOT: [{ firstDeliveredAt: null }] },
          _min: { firstDeliveredAt: true },
        })
      : Promise.resolve(null),
    getSalesReps(),
    order.salesRepId
      ? db.staff.findUnique({
          where: { id: order.salesRepId },
          select: { id: true, name: true, email: true },
        })
      : Promise.resolve(null),
  ]);

  // المندوب السابق قد يكون أُوقف لاحقاً؛ نبقيه ظاهراً كي لا يلغيه حفظ تعديلٍ آخر بالخطأ.
  const selectableSalesReps = assignedRep && !salesReps.some((rep) => rep.id === assignedRep.id)
    ? [...salesReps, { id: assignedRep.id, name: assignedRep.name || assignedRep.email || "مندوب سابق" }]
    : salesReps;

  const forEdit: OrderForEdit = {
    ...order,
    serviceStartedAt: day(order.serviceStartedAt),
    activatedAt: day(order.activatedAt),
    paidAt: day(order.paidAt),
  };

  return (
    <main dir="rtl" className="mx-auto flex max-w-4xl flex-col gap-4 pb-10">
      <header className="flex flex-wrap items-center justify-between gap-2 border-b pb-3">
        <div>
          <h1 className="text-xl font-bold">تعديل الطلب {order.number}</h1>
          <p className="text-sm text-muted-foreground">
            {order.buyerName} · تظهر فقط البيانات التي تحتاج إلى تعديل.
          </p>
        </div>
        <Link
          href={`/orders/${order.id}`}
          className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm text-muted-foreground hover:bg-muted"
        >
          <ArrowRight className="h-4 w-4" />
          رجوع للطلب
        </Link>
      </header>

      <OrderEditForm order={forEdit} firstArticleAt={day(firstArticle?._min.firstDeliveredAt ?? null)} salesReps={selectableSalesReps} />
    </main>
  );
}
