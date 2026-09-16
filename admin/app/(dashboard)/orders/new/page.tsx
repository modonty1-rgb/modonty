import Link from "next/link";
import { ArrowRight } from "lucide-react";

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
export default async function NewOrderPage() {
  await requireFinanceAdmin();
  const data = await loadOrderFormData();

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
        <h1 className="text-xl font-semibold">طلب اشتراك جديد</h1>
        <p className="mt-0.5 text-xs text-muted-foreground">
          نفس الطلب الذي تكتبه صفحة الدفع — بيدك.
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
        <ManualOrderForm data={data} />
      )}
    </main>
  );
}
