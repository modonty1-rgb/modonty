import { PauseCircle, Mail, Phone } from "lucide-react";

import { db } from "@/lib/db";

import { SuspendClientButton } from "../components/suspend-client-button";

export const metadata = {
  title: "Suspend Client - Modonty",
};

/**
 * واسمُ الباقة من **الطلب الساري** (١٩ سبتمبر ٢٠٢٦)، لا من جدول الباقات القديم: ذاك
 * متقاعدٌ لا يُكتب فيه، ويحمله العميلُ مهجوراً على كرته — فكانت الشارةُ قد تقول باقةً
 * باعها أحدٌ قبل سنة لعميلٍ رُقّي بعدها. و`activeOrderId` بلا `@relation` في السكيما
 * (مقصود)، فيُجلب بجلبةٍ واحدةٍ بالمعرّفات.
 */
async function getActiveClients() {
  const clients = await db.client.findMany({
    where: { subscriptionStatus: "ACTIVE" },
    select: { id: true, name: true, email: true, phone: true, activeOrderId: true },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  const orderIds = clients.map((c) => c.activeOrderId).filter((id): id is string => !!id);
  const planName = new Map(
    (
      await db.checkoutOrder.findMany({
        where: { id: { in: orderIds } },
        select: { id: true, planName: true },
      })
    ).map((o) => [o.id, o.planName]),
  );

  return clients.map((c) => ({
    ...c,
    planName: (c.activeOrderId && planName.get(c.activeOrderId)) || null,
  }));
}

export default async function SuspendClientPage() {
  const clients = await getActiveClients();

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold flex items-center gap-2">
          Suspend Client
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-muted-foreground/15 tabular-nums font-bold">
            {clients.length}
          </span>
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          العملاء النشطون (Active) — اضغط Suspend لإيقاف الحساب بعد التأكيد.
        </p>
      </div>

      {clients.length === 0 ? (
        <div className="rounded-md border border-dashed bg-card px-4 py-10 text-center">
          <PauseCircle className="mx-auto h-8 w-8 text-muted-foreground/60" />
          <p className="mt-2 text-sm font-medium">ما فيه عملاء نشطين</p>
        </div>
      ) : (
        <ul className="space-y-2">
          {clients.map((client) => (
            <li
              key={client.id}
              className="rounded-md border bg-card px-4 py-3 flex items-center justify-between gap-3 flex-wrap"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold truncate">{client.name}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted-foreground/15 font-medium shrink-0">
                    {client.planName ?? "—"}
                  </span>
                </div>
                <div className="mt-1 flex items-center gap-x-4 gap-y-1 flex-wrap text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    {client.email}
                  </span>
                  {client.phone && (
                    <span className="inline-flex items-center gap-1" dir="ltr">
                      <Phone className="h-3 w-3" />
                      {client.phone}
                    </span>
                  )}
                </div>
              </div>
              <SuspendClientButton clientId={client.id} clientName={client.name} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
