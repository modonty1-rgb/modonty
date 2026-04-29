import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { ar } from "@/lib/ar";
import { Info } from "lucide-react";
import { SettingsForm } from "./components/settings-form";
import { ChangePasswordForm } from "./components/change-password-form";
import {
  SubscriptionCard,
  type SubscriptionData,
} from "./components/subscription-card";
import { TelegramCard } from "./components/telegram-card";
import type { NotificationPreferences } from "./actions/settings-actions";
import type { TelegramEventPreferences } from "@/lib/telegram/events";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const session = await auth();
  const clientId = (session as { clientId?: string })?.clientId;
  if (!clientId) redirect("/");

  const client = await db.client.findUnique({
    where: { id: clientId },
    select: {
      notificationPreferences: true,
      subscriptionTier: true,
      subscriptionStatus: true,
      paymentStatus: true,
      subscriptionStartDate: true,
      subscriptionEndDate: true,
      subscriptionTierConfig: { select: { name: true, price: true } },
      telegramChatId: true,
      telegramConnectedAt: true,
      telegramEventPreferences: true,
    },
  });
  if (!client) redirect("/");

  const s = ar.settings;
  const prefs =
    (client.notificationPreferences as NotificationPreferences | null) ?? null;

  const tier = client.subscriptionTierConfig;
  const subscription: SubscriptionData = {
    tierName: tier?.name ?? client.subscriptionTier ?? "—",
    status: client.subscriptionStatus ?? null,
    paymentStatus: client.paymentStatus ?? null,
    startDate: client.subscriptionStartDate ?? null,
    endDate: client.subscriptionEndDate ?? null,
    priceSar: tier?.price ?? null,
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
