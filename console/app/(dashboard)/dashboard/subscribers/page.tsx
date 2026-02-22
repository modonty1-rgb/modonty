import { auth } from "@/lib/auth";
import { ar } from "@/lib/ar";
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

  const s = ar.subscribers;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold leading-tight text-foreground">
          {s.title}
        </h1>
        <p className="text-muted-foreground mt-1">
          {s.manageNewsletter}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <UserCheck className="h-4 w-4 text-primary" />
              <CardTitle className="text-base font-medium">{s.active}</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-foreground">
              {stats.active}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {s.subscribedUsers}
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <UserX className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-base font-medium">
                {s.unsubscribed}
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-foreground">
              {stats.unsubscribed}
            </p>
            <p className="text-xs text-muted-foreground mt-1">{s.leftTheList}</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" />
              <CardTitle className="text-base font-medium">
                {s.gdprConsent}
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-foreground">
              {stats.withConsent}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {s.withConsent}
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              <CardTitle className="text-base font-medium">{s.thisMonth}</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-foreground">
              {stats.thisMonth}
            </p>
            <p className="text-xs text-muted-foreground mt-1">{s.newSubscribers}</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              <CardTitle className="text-base font-medium">{s.total}</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-foreground">
              {stats.total}
            </p>
            <p className="text-xs text-muted-foreground mt-1">{s.allSubscribers}</p>
          </CardContent>
        </Card>
      </div>

      <SubscribersTable subscribers={subscribers} clientId={clientId} />
    </div>
  );
}
