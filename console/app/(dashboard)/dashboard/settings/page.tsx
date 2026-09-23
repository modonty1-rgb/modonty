import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { isCollectedOrder } from "@modonty/shared/lib/payments/collected";
import { ar } from "@/lib/ar";
import { Info } from "lucide-react";
import { SettingsForm } from "./components/settings-form";
import { ChangePasswordForm } from "./components/change-password-form";
import { SubscriptionCard } from "./components/subscription-card";
import { PullAddressPanel } from "./components/pull-address-panel";
import { SiteSeoCheck } from "./components/site-seo-check";
import { TelegramCard } from "./components/telegram-card";
import type { SubscriptionData } from "@/lib/subscription";
import { formatOrderMoney } from "@/lib/subscription/active-order";
import { getClientSubscription } from "@/lib/subscription/get-client-subscription";
import { getOutstandingInvoices, resolveClientPayment } from "@/lib/payments";
import type { NotificationPreferences } from "./actions/settings-actions";
import type { TelegramEventPreferences } from "@/lib/telegram/events";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const session = await auth();
  const clientId = (session as { clientId?: string })?.clientId;
  if (!clientId) redirect("/");

  const [client, sub, outstanding] = await Promise.all([
    db.client.findUnique({
      where: { id: clientId },
      select: {
        notificationPreferences: true,
        telegramChatId: true,
        telegramConnectedAt: true,
        telegramEventPreferences: true,
        // The pull addresses live here now: a developer sets them up once, which is a
        // settings job, not something the articles list should carry every day.
        canPublishToOwnSite: true,
        articlesBaseUrl: true,
        apiKeySuspended: true,
        apiKeyLastUsedAt: true,
      },
    }),
    // الاشتراكُ كلُّه من الطلب الساري — الباقةُ والسعرُ والبدايةُ والنهايةُ والحالة (قاعدة المصدر الواحد).
    getClientSubscription(clientId),
    getOutstandingInvoices(clientId),
  ]);
  if (!client) redirect("/");

  const s = ar.settings;
  const prefs =
    (client.notificationPreferences as NotificationPreferences | null) ?? null;

  const order = sub.order;
  const subscription: SubscriptionData = {
    tierName: order?.planName ?? "—",
    status: sub.status,
    /**
     * شارةُ الدفع من الطلب الساري والمستحقّات معاً (٢٣ سبتمبر ٢٠٢٦ · خالد: مصدرٌ واحد).
     * كانت من الفواتير وحدها، فرأى «مدفوع» عميلٌ بلا طلب، وعميلٌ طلبُه مستردّ والكرتُ نفسُه
     * يُخفي مبلغه. والقاعدةُ نفسُها في الشريط الجانبيّ (`layout.tsx`).
     */
    paymentStatus: resolveClientPayment(order, outstanding.count),
    startDate: sub.startedAt,
    endDate: sub.endsAt,
    paidTotal: order && isCollectedOrder(order) ? formatOrderMoney(order.totalMinor, order.currency) : null,
    paidMonths: order?.paidMonths ?? null,
    bonusServiceMonths: order?.bonusServiceMonths ?? null,
  };

  const tgPrefs =
    (client.telegramEventPreferences as TelegramEventPreferences | null) ?? null;
  const botUsername = process.env.TELEGRAM_BOT_USERNAME ?? null;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold leading-tight text-foreground">
          {s.pageTitle}
        </h1>
        <div className="mt-3 flex items-start gap-2 rounded-lg border border-primary/20 bg-primary/5 p-3">
          <Info className="h-4 w-4 shrink-0 text-primary mt-0.5" />
          <p className="text-xs leading-relaxed text-foreground">{s.pageHint}</p>
        </div>
      </header>

      <SubscriptionCard data={subscription} />
      {client.canPublishToOwnSite && (
        <>
          <PullAddressPanel
            clientId={clientId}
            articlesBaseUrl={client.articlesBaseUrl}
            suspended={client.apiKeySuspended}
            lastFetchedAt={
              client.apiKeyLastUsedAt
                ? new Intl.DateTimeFormat("ar-SA", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  }).format(client.apiKeyLastUsedAt)
                : null
            }
          />
          {client.articlesBaseUrl && <SiteSeoCheck articlesBaseUrl={client.articlesBaseUrl} />}
        </>
      )}
      <SettingsForm initial={prefs} />
      <TelegramCard
        isConnected={!!client.telegramChatId}
        connectedAt={client.telegramConnectedAt ?? null}
        initialPrefs={tgPrefs}
        botUsername={botUsername}
      />
      <ChangePasswordForm />
    </div>
  );
}
