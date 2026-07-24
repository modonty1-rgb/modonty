import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Receipt, CheckCircle2, Clock } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { getClientInvoices } from "./helpers/invoice-queries";

export const dynamic = "force-dynamic";

function money(amount: number, currency: string | null) {
  return `${new Intl.NumberFormat("en-US").format(amount)} ${currency ?? ""}`.trim();
}

function arDate(d: Date | null) {
  if (!d) return "—";
  return new Intl.DateTimeFormat("ar-EG", { day: "numeric", month: "long", year: "numeric" }).format(d);
}

const PERIOD_LABEL: Record<string, string> = { monthly: "شهري", annual: "سنوي" };

export default async function InvoicesPage() {
  const session = await auth();
  const clientId = (session as { clientId?: string })?.clientId;
  if (!clientId) redirect("/");

  const { invoices, unpaidCount, unpaidAmount, paidAmount, currency } =
    await getClientInvoices(clientId);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold leading-tight text-foreground">الفواتير</h1>
        <p className="mt-1 text-muted-foreground">
          سجل اشتراكك وفواتيره. للاستفسار عن أي فاتورة تواصل معنا وسنوضّحها لك.
        </p>
      </header>

      {invoices.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-3">
          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <span className="flex h-9 w-9 items-center justify-center rounded-md bg-amber-500/15 text-amber-600 dark:text-amber-400">
                <Clock className="h-4 w-4" />
              </span>
              <div>
                <p className="text-lg font-bold tabular-nums leading-none">
                  {money(unpaidAmount, currency)}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {unpaidCount === 0
                    ? "لا توجد مستحقات"
                    : `${unpaidCount} ${unpaidCount === 1 ? "فاتورة" : "فواتير"} بانتظار السداد`}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <span className="flex h-9 w-9 items-center justify-center rounded-md bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-4 w-4" />
              </span>
              <div>
                <p className="text-lg font-bold tabular-nums leading-none">
                  {money(paidAmount, currency)}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">إجمالي المدفوع</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <span className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary">
                <Receipt className="h-4 w-4" />
              </span>
              <div>
                <p className="text-lg font-bold tabular-nums leading-none">{invoices.length}</p>
                <p className="mt-1 text-xs text-muted-foreground">إجمالي الفواتير</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardContent className="p-0">
          {invoices.length === 0 ? (
            <div className="flex flex-col items-center gap-2 px-4 py-14 text-center">
              <Receipt className="h-8 w-8 text-muted-foreground/50" />
              <p className="text-sm font-medium">لا توجد فواتير بعد</p>
              <p className="max-w-sm text-xs text-muted-foreground">
                ستظهر هنا كل فواتير اشتراكك أولاً بأول.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full whitespace-nowrap text-[13px]">
                <thead>
                  <tr className="border-b bg-muted/40 text-[11px] font-semibold text-muted-foreground [&>th]:px-3 [&>th]:py-2.5 [&>th]:text-start">
                    <th>التاريخ</th>
                    <th>رقم الفاتورة</th>
                    <th>الوصف</th>
                    <th>الاشتراك حتى</th>
                    <th className="!text-center">المبلغ</th>
                    <th className="!text-center">الحالة</th>
                  </tr>
                </thead>
                <tbody className="[&>tr]:border-b [&>tr:last-child]:border-0 [&_td]:px-3 [&_td]:py-2.5">
                  {invoices.map((inv) => (
                    <tr
                      key={inv.id}
                      className={inv.isPaid ? undefined : "bg-amber-500/[0.05]"}
                    >
                      <td className="text-muted-foreground tabular-nums">{arDate(inv.issuedAt)}</td>
                      <td className="font-mono text-xs">{inv.number}</td>
                      <td className="text-muted-foreground">
                        {inv.tierName} · {PERIOD_LABEL[inv.period] ?? inv.period}
                      </td>
                      <td className="text-muted-foreground tabular-nums">
                        {arDate(inv.subscriptionEnd)}
                      </td>
                      <td className="text-center font-semibold tabular-nums">
                        {money(inv.amount, inv.currency)}
                      </td>
                      <td className="text-center">
                        {inv.isPaid ? (
                          <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                            مدفوعة
                          </span>
                        ) : (
                          <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-[11px] font-semibold text-amber-600 dark:text-amber-400">
                            بانتظار السداد
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
