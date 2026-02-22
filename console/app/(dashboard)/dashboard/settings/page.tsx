import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { ar } from "@/lib/ar";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { SettingsForm } from "./components/settings-form";
import { ChangePasswordForm } from "./components/change-password-form";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const session = await auth();
  const clientId = (session as { clientId?: string })?.clientId;
  if (!clientId) return null;

  const [client, clientSubscription] = await Promise.all([
    db.client.findUnique({
      where: { id: clientId },
      select: { notificationPreferences: true },
    }),
    db.client.findUnique({
      where: { id: clientId },
      select: {
        subscriptionTier: true,
        subscriptionStatus: true,
        paymentStatus: true,
        subscriptionStartDate: true,
        subscriptionEndDate: true,
        subscriptionTierConfig: { select: { name: true, price: true } },
      },
    }),
  ]);
  if (!client) return null;

  const prefs = client.notificationPreferences as Record<string, unknown> | null;
  const tier = clientSubscription?.subscriptionTierConfig;
  const tierName = tier?.name ?? clientSubscription?.subscriptionTier ?? "—";
  const price = tier?.price ?? null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold leading-tight text-foreground">
          {ar.nav.settings}
        </h1>
        <p className="text-muted-foreground mt-1">
          {ar.settings.notificationsDesc}
        </p>
      </div>

      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium">{ar.dashboard.subscription}</CardTitle>
          <CardDescription className="text-xs">{ar.dashboard.currentPlan}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-lg font-semibold text-foreground">{tierName}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {clientSubscription?.subscriptionStatus} · {clientSubscription?.paymentStatus}
          </p>
          {price != null && (
            <p className="text-xs text-muted-foreground mt-1">
              {Number(price).toLocaleString()} SAR/year
            </p>
          )}
          {(clientSubscription?.subscriptionStartDate ?? clientSubscription?.subscriptionEndDate) && (
            <p className="text-xs text-muted-foreground mt-1">
              {clientSubscription?.subscriptionStartDate && clientSubscription?.subscriptionEndDate
                ? `${new Date(clientSubscription.subscriptionStartDate).toLocaleDateString()} – ${new Date(clientSubscription.subscriptionEndDate).toLocaleDateString()}`
                : clientSubscription?.subscriptionStartDate
                  ? `من ${new Date(clientSubscription.subscriptionStartDate).toLocaleDateString()}`
                  : clientSubscription?.subscriptionEndDate
                    ? `حتى ${new Date(clientSubscription.subscriptionEndDate).toLocaleDateString()}`
                    : null}
            </p>
          )}
        </CardContent>
      </Card>

      <SettingsForm
        clientId={clientId}
        initial={{ notificationPreferences: prefs ?? undefined }}
      />
      <ChangePasswordForm clientId={clientId} />
    </div>
  );
}
