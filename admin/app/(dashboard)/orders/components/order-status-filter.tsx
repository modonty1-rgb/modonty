import type { CheckoutOrderStatus, PaymentProvider } from "@prisma/client";
import Link from "next/link";

import { cn } from "@/lib/utils";
import { orderStatusCopy } from "../helpers/order-status-copy";
import { orderProviderLabel } from "../helpers/order-provider-label";

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
  /** اشتراكٌ انقضت شهورُه — يُحسب من التفعيل + المدّة، ليس حالةً في القاعدة. */
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
    <div className="flex items-end gap-x-2 overflow-x-auto pb-0.5 [scrollbar-width:thin]" role="tablist" aria-label="فلاتر الاشتراكات">
      <Group label="الاشتراك">
        <Pill href="/orders" label="الكل" count={total} isActive={nothingActive} />
        {/* الوحيد الذي يعني عملاً على الفريق الآن — مالٌ وصل وخدمةٌ لم تبدأ. */}
        <Pill href="/orders?view=awaiting-activation" label="ينتظر التفعيل" count={awaitingActivation} isActive={isAwaitingView} tone={awaitingActivation > 0 ? "alert" : undefined} />
        {/* منتهٍ = تجديدٌ مستحقّ. أحمرُ كصفوفه في الجدول. */}
        <Pill href="/orders?view=expired" label="منتهٍ" count={expired} isActive={isExpiredView} tone={expired > 0 ? "danger" : undefined} />
      </Group>
      <Group label="الحالة">
        {STATUSES.map((status) => (
          <Pill key={status} href={`/orders?status=${status}`} label={orderStatusCopy(status).label} title={orderStatusCopy(status).hint} count={counts[status] ?? 0} isActive={active === status} />
        ))}
      </Group>
      <Group label="السوق">
        {Object.keys(marketLabels).map((code) => (
          <Pill key={code} href={`/orders?market=${code}`} label={marketLabels[code]} count={marketCounts[code] ?? 0} isActive={activeMarket === code} />
        ))}
      </Group>
      <Group label="البوابة">
        {PROVIDERS.map((provider) => (
          <Pill key={provider} href={`/orders?provider=${provider}`} label={orderProviderLabel(provider)} count={providerCounts[provider] ?? 0} isActive={activeProvider === provider} />
        ))}
      </Group>
    </div>
  );
}

/** اسمُ المجموعة فوقها لا بجانبها (خالد ١٨ سبتمبر) — يوفّر عرضاً فتتّسع الثلاث في سطرٍ واحد. */
function Group({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex shrink-0 flex-col gap-0.5">
      <span className="ps-1 text-[9.5px] font-medium leading-none text-muted-foreground">{label}</span>
      <div className="flex items-center gap-0.5 rounded-md border border-border/70 bg-muted/30 p-0.5">{children}</div>
    </div>
  );
}

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
        // أصغر (خالد ١٨ سبتمبر): 10px وحشوٌ أضيق — أربع عشرة حبّة في صفّ العنوان.
        // بلا بولد (خالد ١٨ سبتمبر): الوزنُ الثقيل على أربع عشرة حبّةٍ يجعل الصفَّ كلَّه
        // يصرخ، فلا يبرز النشطُ منها. اللونُ وحده يميّز.
        "inline-flex items-center overflow-hidden rounded-full border bg-card text-[10px] font-normal leading-none transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        isActive
          ? "border-primary"
          : alert
            ? "border-amber-500/50 hover:bg-amber-500/10"
            : danger
              ? "border-red-500/50 hover:bg-red-500/10"
              : "border-border hover:bg-accent",
      )}
    >
      <span
        className={cn(
          "px-1.5 py-1",
          isActive ? "bg-primary text-primary-foreground" : alert ? "text-amber-700 dark:text-amber-500" : danger ? "text-red-700 dark:text-red-400" : "text-foreground",
        )}
      >
        {label}
      </span>
      <span
        className={cn(
          "border-s px-1 py-1 tabular-nums",
          isActive
            ? "border-primary-foreground/30 bg-primary-foreground text-primary"
            : alert
              ? "border-amber-500/40 bg-amber-500/15 text-amber-700 dark:text-amber-500"
              : danger
                ? "border-red-500/40 bg-red-500/15 text-red-700 dark:text-red-400"
                : "border-border bg-muted text-muted-foreground",
        )}
      >
        {count}
      </span>
    </Link>
  );
}
