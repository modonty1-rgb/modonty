import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { db } from "@/lib/db";
import { requireFinanceAdmin } from "@/lib/require-finance-admin";

import { ManualOrderForm } from "./components/manual-order-form";
import { loadOrderFormData } from "./helpers/load-order-form-data";

export const dynamic = "force-dynamic";

/**
 * «طلب اشتراك جديد» — المنفذ الثاني بجانب صفحة الدفع.
 *
 * صفحةٌ لا حوار (قرار خالد ١٥ سبتمبر ٢٠٢٦): الغرض ليس الإدخال السريع وحده، بل
 * إعادة إدخال **العملاء القائمين** بتواريخهم ومبالغهم القديمة حتى يصير للجميع
 * سجلٌّ واحد. وذلك عملٌ يُراجَع قبل الحفظ، والحوار يضيق به ويُقفل بالخطأ.
 */
export default async function NewOrderPage({ searchParams }: { searchParams: Promise<{ leadId?: string }> }) {
  await requireFinanceAdmin();
  const { leadId } = await searchParams;
  const [data, lead] = await Promise.all([
    loadOrderFormData(),
    // تعبئةُ الهويّة من العميل المحتمَل — لا المال. المبلغ يكتبه الموظّف بما اتُّفق عليه
    // فعلاً، و`expectedMonthly` على المحتمَل تقديرُ خطٍّ لا مبلغٌ مقبوض.
    leadId
      ? db.salesLead.findUnique({
          where: { id: leadId },
          select: { id: true, name: true, company: true, email: true, phone: true, countryCode: true, ownerId: true, createdById: true, convertedClientId: true },
        })
      : Promise.resolve(null),
  ]);

  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-4 pb-10" dir="rtl">
      <header>
        <Link
          href="/orders"
          className="mb-2 inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
        >
          <ArrowRight className="size-3.5" />
          كل الطلبات
        </Link>
        <h1 className="text-xl font-semibold">
          {lead ? `طلب اشتراك — ${lead.company || lead.name}` : "طلب اشتراك جديد"}
        </h1>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {lead
            ? "من عميلٍ محتمَل. الهويّة معبّأة منه — والمبلغ تكتبه بما اتُّفق عليه فعلاً."
            : "نفس الطلب الذي تكتبه صفحة الدفع — بيدك."}
        </p>
      </header>

      {data.plans.length === 0 ? (
        <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
          لا باقة منشورة في الكتالوج — انشر باقةً من «الباقات والأسعار» أولاً.
        </div>
      ) : data.terms.length === 0 ? (
        <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
          لا مدّة مفعّلة في سياسة المدد — أضف مدّةً من «الباقات والأسعار» أولاً.
        </div>
      ) : (
        <ManualOrderForm
          data={data}
          leadId={lead && !lead.convertedClientId ? lead.id : undefined}
          prefill={
            lead && !lead.convertedClientId
              ? {
                  buyerName: lead.name,
                  businessName: lead.company ?? "",
                  buyerEmail: lead.email ?? "",
                  buyerPhone: lead.phone ?? "",
                  market: /eg|مصر/i.test(lead.countryCode ?? "") ? "EG" : "SA",
                  salesRepId: lead.ownerId ?? lead.createdById ?? "",
                }
              : undefined
          }
        />
      )}
    </main>
  );
}
