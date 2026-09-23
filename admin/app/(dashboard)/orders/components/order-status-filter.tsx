import type { CheckoutOrderStatus, PaymentProvider } from "@prisma/client";
import Link from "next/link";

import { cn } from "@/lib/utils";
import { orderStatusCopy } from "@/lib/orders/order-status-copy";
import { orderProviderLabel } from "@/lib/orders/order-provider-label";
import { OrderFilterMenu } from "./order-filter-menu";

const STATUSES: CheckoutOrderStatus[] = ["AWAITING_PAYMENT", "AWAITING_TRANSFER", "PAID", "FAILED", "CANCELLED", "REFUNDED"];
const PROVIDERS: PaymentProvider[] = ["NGENIUS", "TAMARA", "BANK_TRANSFER", "INSTAPAY", "MIGRATED"];

/**
 * Status is state in the URL (`?status=` · `?view=` · `?provider=`), not client state — a
 * filtered view can be bookmarked or sent to a teammate. Same two-part pill shape as
 * daily-tasks/PersonFilter: label | count, active one inverted, links so no client JS.
 *
 * أربع مجموعات (خالد ١٨ سبتمبر ٢٠٢٦: «كلّ توغل حطّه كأنّه جروب»): ما يخصّ الاشتراك
 * نفسه (الكلّ · ينتظر التفعيل · منتهٍ) · حالاتُ الدفع · **السوق** · البوّابات. فلترٌ واحد
 * نشطٌ في كلّ مرّة — الرابط يحمل مفتاحاً واحداً.
 *
 * والسوقُ يُقرأ من حقل `market` على الطلب لا من العملة: العملةُ قد تتغيّر (سعرٌ بالدولار
 * لعميلٍ مصريّ) ويبقى السوقُ هو الذي يقرّر الضريبةَ ونوعَ المستند — فاشتقاقُه من العملة
 * يجعل الفلترَ يكذب يومَ يختلفان.
 */
export function OrderStatusFilter({
  counts,
  total,
  active,
  awaitingActivation,
  isAwaitingView,
  expired,
  isExpiredView,
  providerCounts,
  activeProvider,
  marketCounts,
  marketLabels,
  activeMarket,
}: {
  counts: Partial<Record<CheckoutOrderStatus, number>>;
  total: number;
  active?: CheckoutOrderStatus;
  /** مدفوعٌ بلا حساب عميل — ليست حالةً في القاعدة بل غيابُ `clientId`. */
  awaitingActivation: number;
  isAwaitingView: boolean;
  /**
   * عملاءُ انتهى اشتراكُهم — طلبٌ ساريٌ واحد لكلٍّ منهم، بلا الحسابات الداخليّة. نفسُ عدد
   * `/clients/segment/expired` (٢٣ سبتمبر ٢٠٢٦ — خالد: مصدرٌ واحد)، لا طلباتٌ قديمة لعميلٍ جدّد.
   */
  expired: number;
  isExpiredView: boolean;
  /** طلباتٌ لكلّ بوّابة — من `payment_transactions`؛ المُرحَّل له `MIGRATED`. */
  providerCounts: Partial<Record<PaymentProvider, number>>;
  activeProvider?: PaymentProvider;
  /** طلباتٌ لكلّ سوق — من حقل `market` على الطلب لا من العملة. */
  marketCounts: Partial<Record<string, number>>;
  marketLabels: Record<string, string>;
  activeMarket?: string;
}) {
  const nothingActive = !active && !isAwaitingView && !isExpiredView && !activeProvider && !activeMarket;
  return (
    // صفٌّ واحدٌ يمرّر أفقيّاً عند الضيق ولا يلتفّ (خالد ١٩ سبتمبر ٢٠٢٦: «كلّها تكون في
    // سطرٍ واحد»). الالتفافُ كان يُنزل «البوّابة» تحت «الاشتراك» على الشاشات الضيّقة، فيتغيّر
    // ترتيبُ المجموعات بعرض النافذة — والعينُ تتعلّم الموضعَ قبل أن تقرأ الاسم.
    <div className="flex flex-wrap items-center gap-2" role="tablist" aria-label="فلاتر الاشتراكات">
      {/* الظاهرُ ثلاثةٌ تعني عملاً الآن؛ والباقي في القائمة بجانبها. */}
      <div className="flex items-center gap-1">
        <Pill href="/orders" label="الكل" count={total} isActive={nothingActive} />
        {/* الوحيد الذي يعني عملاً على الفريق الآن — مالٌ وصل وخدمةٌ لم تبدأ. */}
        <Pill href="/orders?view=awaiting-activation" label="ينتظر التفعيل" count={awaitingActivation} isActive={isAwaitingView} tone={awaitingActivation > 0 ? "alert" : undefined} />
        {/* منتهٍ = تجديدٌ مستحقّ. أحمرُ كصفوفه في الجدول. */}
        <Pill href="/orders?view=expired" label="منتهٍ" count={expired} isActive={isExpiredView} tone={expired > 0 ? "danger" : undefined} />
      </div>
      <OrderFilterMenu
        sections={[
          {
            title: "الحالة",
            items: STATUSES.map((status) => ({
              href: `/orders?status=${status}`,
              label: orderStatusCopy(status).label,
              hint: orderStatusCopy(status).hint,
              count: counts[status] ?? 0,
              active: active === status,
            })),
          },
          {
            title: "السوق",
            items: Object.keys(marketLabels).map((code) => ({
              href: `/orders?market=${code}`,
              label: marketLabels[code],
              count: marketCounts[code] ?? 0,
              active: activeMarket === code,
            })),
          },
          {
            title: "البوابة",
            items: PROVIDERS.map((provider) => ({
              href: `/orders?provider=${provider}`,
              label: orderProviderLabel(provider),
              count: providerCounts[provider] ?? 0,
              active: activeProvider === provider,
            })),
          },
        ]}
      />
    </div>
  );
}


/**
 * حبّةٌ واحدة: اسمٌ وعدٌّ في شارةٍ مدوّرة داخلها — بلا خانتين ولا خطٍّ بينهما.
 *
 * كانت خانتين بإطارٍ فاصل، وخانةُ العدد لا تملأ ارتفاعَ الحبّة، فبدت «بوردر جوّه بوردر»
 * (خالد ٢٣ سبتمبر ٢٠٢٦). والشكلُ الآن هو شكلُ زرّ «فلترة» بجانبها — لغةٌ واحدة للصفّ.
 */
function Pill({ href, label, count, isActive, tone, title }: { href: string; label: string; count: number; isActive: boolean; tone?: "alert" | "danger"; title?: string }) {
  const alert = tone === "alert" && !isActive;
  const danger = tone === "danger" && !isActive;
  return (
    <Link
      href={href}
      role="tab"
      aria-selected={isActive}
      title={title}
      className={cn(
        "inline-flex h-7 items-center gap-1.5 rounded-full border px-2.5 text-[12px] leading-none transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        isActive
          ? "border-primary bg-primary text-primary-foreground"
          : alert
            ? "border-amber-500/50 bg-card text-amber-700 hover:bg-amber-500/10 dark:text-amber-400"
            : danger
              ? "border-red-500/50 bg-card text-red-700 hover:bg-red-500/10 dark:text-red-400"
              : "bg-card text-foreground hover:bg-accent",
      )}
    >
      {label}
      <span
        className={cn(
          "rounded-full px-1.5 py-0.5 text-[10px] tabular-nums",
          isActive
            ? "bg-primary-foreground/20"
            : alert
              ? "bg-amber-500/15"
              : danger
                ? "bg-red-500/15"
                : "bg-muted text-muted-foreground",
        )}
      >
        {count}
      </span>
    </Link>
  );
}
