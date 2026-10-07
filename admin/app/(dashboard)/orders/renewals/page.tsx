import Link from "next/link";
import { redirect } from "next/navigation";
import { RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { db } from "@/lib/db";
import { cn } from "@/lib/utils";
import { auth } from "@/lib/auth";
import { checkFinanceAdmin } from "@/lib/require-finance-admin";
import { checkSalesDesk } from "@/lib/require-sales-desk";
import { getClientSubscriptionsShared } from "@/lib/subscription/get-client-subscriptions";
import { RENEWAL_SOON_DAYS } from "@/lib/orders/renewal-window";
import { NOT_INTERNAL } from "@/lib/clients/segments";

export const dynamic = "force-dynamic";

const NO_REP = "none";
const day = (d: Date) => d.toISOString().slice(0, 10);
const n = (v: number) => v.toLocaleString("ar-EG");

/**
 * **تجديد اشتراك — باب التجديد في القائمة** (خالد ١ أكتوبر ٢٠٢٦: «نفصل مشترك جديد وتجديد
 * الاشتراك في المنيو»). كان التجديد زرّاً داخل صفحة الطلب الساري وحدها، فالمندوبُ يبحث عن طلب
 * العميل أولاً ليجده. هنا كلُّ عميلٍ له اشتراك، وزرُّ «جدّد» بجانبه يفتح نفس فورم التجديد
 * (`/orders/new?renewFrom=`) ببياناته مقفولة.
 *
 * الحالة من `getClientSubscriptions` — نفسُ ما يلوّن الجدول ويعدّ «منتهٍ» — فلا رقمٌ ثانٍ.
 * والترتيب بالأولويّة: المنتهي (الأقدمُ أوّلاً)، ثمّ الأقربُ انتهاءً، ثمّ مَن لم تبدأ خدمتُه
 * (لا نهايةَ يُبنى عليها التجديد حتى يصله أوّلُ مقال).
 */
export default async function RenewalsPage({ searchParams }: { searchParams: Promise<{ rep?: string }> }) {
  const desk = await checkSalesDesk();
  if (desk.status === "unauthenticated") redirect("/login");
  if (desk.status !== "ok") {
    return <p dir="rtl" className="px-5 py-10 text-sm text-muted-foreground">هذه الصفحة للمبيعات والأدمن.</p>;
  }
  const isAdmin = (await checkFinanceAdmin()).status === "ok";
  const viewerId = ((await auth())?.user as { id?: string } | undefined)?.id;
  const { rep: repParam } = await searchParams;

  const [subs, allClients] = await Promise.all([
    getClientSubscriptionsShared(NOT_INTERNAL),
    db.client.findMany({
      where: { AND: [NOT_INTERNAL, { activeOrderId: { not: null } }] },
      select: { id: true, name: true, activeOrderId: true, salesRepId: true },
      take: 5000,
    }),
  ]);
  const repIds = [...new Set(allClients.flatMap((c) => (c.salesRepId ? [c.salesRepId] : [])))];
  const reps = repIds.length ? await db.staff.findMany({ where: { id: { in: repIds } }, select: { id: true, name: true } }) : [];
  const repName = new Map(reps.map((r) => [r.id, r.name ?? "—"]));

  /**
   * **المندوبُ يرى عملاءه وحدهم، والأدمنُ يرى الكلّ ويفلتر** (خالد ١ أكتوبر ٢٠٢٦). والمقياسُ مندوبُ
   * العميل (`Client.salesRepId`) — صاحبُ المتابعة. و«بلا مندوب» للأدمن: عملاءُ لا يتابع تجديدَهم أحد
   * (مقيسٌ على dev: ٢١ من ٤٥) — الفلترُ يُظهرهم ليُوزَّعوا.
   */
  const counts = new Map<string, number>();
  for (const c of allClients) counts.set(c.salesRepId ?? NO_REP, (counts.get(c.salesRepId ?? NO_REP) ?? 0) + 1);
  const activeRep = isAdmin ? (repParam === NO_REP || repName.has(repParam ?? "") ? repParam : undefined) : viewerId;
  const clients = activeRep ? allClients.filter((c) => (c.salesRepId ?? NO_REP) === activeRep) : allClients;
  const repPills = isAdmin
    ? [
        { id: undefined, name: "الكل", count: allClients.length },
        ...[...repName].map(([id, name]) => ({ id, name, count: counts.get(id) ?? 0 })).sort((a, b) => b.count - a.count),
        ...(counts.has(NO_REP) ? [{ id: NO_REP, name: "بلا مندوب", count: counts.get(NO_REP)! }] : []),
      ]
    : [];

  const rows = clients
    .flatMap((c) => {
      const s = subs.get(c.id);
      if (!s?.hasOrder || !c.activeOrderId) return [];
      return [{ id: c.id, name: c.name, orderId: c.activeOrderId, plan: s.planName, endsAt: s.endsAt, daysLeft: s.daysLeft, rep: c.salesRepId ? repName.get(c.salesRepId) ?? null : null }];
    })
    // Expired first (oldest end first), then the nearest end, then not started.
    .sort((a, b) => (a.daysLeft ?? Infinity) - (b.daysLeft ?? Infinity));

  const expired = rows.filter((r) => r.daysLeft !== null && r.daysLeft < 0).length;
  const soon = rows.filter((r) => r.daysLeft !== null && r.daysLeft >= 0 && r.daysLeft <= RENEWAL_SOON_DAYS).length;

  return (
    <main dir="rtl" className="mx-auto flex max-w-6xl flex-col gap-5 pb-8">
      <header>
        <h1 className="text-xl font-semibold">تجديد اشتراك</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          اختر العميل واضغط «جدّد» — بياناته تنملي لحالها، والتجديد يبدأ من نهاية اشتراكه الحالي.
        </p>
        <p className="mt-2 flex flex-wrap gap-4 text-sm">
          <span>
            انتهى: <b className="tabular-nums text-rose-700 dark:text-rose-400">{n(expired)}</b>
          </span>
          <span>
            ينتهي خلال {n(RENEWAL_SOON_DAYS)} يوم: <b className="tabular-nums text-amber-700 dark:text-amber-400">{n(soon)}</b>
          </span>
          <span className="text-muted-foreground">{isAdmin ? "المشتركين" : "عملاءك"}: {n(rows.length)}</span>
        </p>
      </header>

      {repPills.length > 0 && (
        <nav className="flex flex-wrap gap-1.5" aria-label="المندوب">
          {repPills.map((p) => {
            const isActive = p.id === activeRep;
            return (
              <Link
                key={p.id ?? "all"}
                href={p.id ? `/orders/renewals?rep=${p.id}` : "/orders/renewals"}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "inline-flex h-7 items-center gap-1.5 rounded-full border px-2.5 text-xs",
                  isActive ? "border-primary bg-primary text-primary-foreground" : "bg-card hover:bg-muted",
                  !isActive && p.id === NO_REP && "border-amber-300 text-amber-800 dark:text-amber-300",
                )}
              >
                {p.name}
                <span className="tabular-nums opacity-80">{n(p.count)}</span>
              </Link>
            );
          })}
        </nav>
      )}

      <section className="overflow-x-auto rounded-xl border bg-card shadow-sm" aria-label="المشتركون">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="border-b bg-muted/40 text-xs text-muted-foreground">
            <tr>
              <th className="px-3 py-2 text-start font-semibold">العميل</th>
              <th className="px-3 py-2 text-start font-semibold">الباقة</th>
              <th className="px-3 py-2 text-start font-semibold">المندوب</th>
              <th className="px-3 py-2 text-start font-semibold">ينتهي</th>
              <th className="px-3 py-2 text-start font-semibold">الحالة</th>
              <th className="px-3 py-2" />
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-3 py-8 text-center text-muted-foreground">
                  {isAdmin ? "ما فيه مشتركين هنا." : "ما فيه عملاء مسجّلين باسمك بعد."}
                </td>
              </tr>
            ) : (
              rows.map((r) => {
                const isExpired = r.daysLeft !== null && r.daysLeft < 0;
                const isSoon = r.daysLeft !== null && r.daysLeft >= 0 && r.daysLeft <= RENEWAL_SOON_DAYS;
                return (
                  <tr key={r.id} className={cn("border-b last:border-0", isExpired && "bg-rose-50/60 dark:bg-rose-950/20")}>
                    <td className="px-3 py-2.5">
                      <Link href={`/orders/${r.orderId}`} className="font-medium hover:underline">
                        {r.name}
                      </Link>
                    </td>
                    <td className="px-3 py-2.5 text-muted-foreground">{r.plan ?? "—"}</td>
                    <td className="px-3 py-2.5 text-muted-foreground">{r.rep ?? "—"}</td>
                    <td className="px-3 py-2.5 tabular-nums text-muted-foreground" dir="ltr">
                      {r.endsAt ? day(r.endsAt) : "—"}
                    </td>
                    <td className="px-3 py-2.5">
                      {r.daysLeft === null ? (
                        <span className="text-xs text-muted-foreground">لسه ما بدأ — ينتظر أوّل مقال</span>
                      ) : isExpired ? (
                        <span className="text-xs font-semibold text-rose-700 dark:text-rose-400">انتهى من {n(-r.daysLeft)} يوم</span>
                      ) : (
                        <span className={cn("text-xs", isSoon ? "font-semibold text-amber-700 dark:text-amber-400" : "text-muted-foreground")}>
                          باقي {n(r.daysLeft)} يوم
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-2.5 text-end">
                      {r.endsAt ? (
                        <Button asChild size="sm" variant={isExpired || isSoon ? "default" : "outline"} className="h-8 gap-1.5 px-3 text-xs">
                          <Link href={`/orders/new?renewFrom=${r.orderId}`}>
                            <RefreshCw className="size-3.5" aria-hidden />
                            جدّد
                          </Link>
                        </Button>
                      ) : (
                        <span className="text-xs text-muted-foreground">بعد أوّل مقال</span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </section>
    </main>
  );
}
