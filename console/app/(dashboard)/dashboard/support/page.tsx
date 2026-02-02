import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getContactMessages, getMessageStats } from "./helpers/support-queries-enhanced";
import { MessagesList } from "./components/messages-list";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, MailOpen, CheckCheck, Archive } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function SupportPage() {
  const session = await auth();
  const clientId = (session as { clientId?: string })?.clientId;

  if (!clientId) {
    redirect("/");
  }

  const [messages, stats] = await Promise.all([
    getContactMessages(clientId),
    getMessageStats(clientId),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold leading-tight text-foreground">
          Support Messages
        </h1>
        <p className="text-muted-foreground mt-1">
          Manage and respond to contact form submissions
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-primary" />
              <CardTitle className="text-base font-medium">New</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-foreground">{stats.new}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Unread messages
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <MailOpen className="h-4 w-4 text-primary" />
              <CardTitle className="text-base font-medium">Read</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-foreground">{stats.read}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Messages read
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <CheckCheck className="h-4 w-4 text-primary" />
              <CardTitle className="text-base font-medium">Replied</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-foreground">
              {stats.replied}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Messages replied
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Archive className="h-4 w-4 text-primary" />
              <CardTitle className="text-base font-medium">Total</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-foreground">{stats.total}</p>
            <p className="text-xs text-muted-foreground mt-1">
              All messages
            </p>
          </CardContent>
        </Card>
      </div>

      <MessagesList messages={messages} clientId={clientId} />
    </div>
  );
}
