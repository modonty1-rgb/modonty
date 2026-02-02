import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getSubscribers, getSubscriberStats } from "./helpers/subscriber-queries";
import { SubscribersTable } from "./components/subscribers-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserCheck, UserX, Shield, TrendingUp } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function SubscribersPage() {
  const session = await auth();
  const clientId = (session as { clientId?: string })?.clientId;

  if (!clientId) {
    redirect("/");
  }

  const [subscribers, stats] = await Promise.all([
    getSubscribers(clientId),
    getSubscriberStats(clientId),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold leading-tight text-foreground">
          Subscriber Management
        </h1>
        <p className="text-muted-foreground mt-1">
          Manage your newsletter subscribers and GDPR compliance
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <UserCheck className="h-4 w-4 text-primary" />
              <CardTitle className="text-base font-medium">Active</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-foreground">
              {stats.active}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Subscribed users
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <UserX className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-base font-medium">
                Unsubscribed
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-foreground">
              {stats.unsubscribed}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Left the list</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-green-600" />
              <CardTitle className="text-base font-medium">
                GDPR Consent
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-foreground">
              {stats.withConsent}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              With consent
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              <CardTitle className="text-base font-medium">This Month</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-foreground">
              {stats.thisMonth}
            </p>
            <p className="text-xs text-muted-foreground mt-1">New subscribers</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              <CardTitle className="text-base font-medium">Total</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-foreground">
              {stats.total}
            </p>
            <p className="text-xs text-muted-foreground mt-1">All subscribers</p>
          </CardContent>
        </Card>
      </div>

      <SubscribersTable subscribers={subscribers} clientId={clientId} />
    </div>
  );
}
