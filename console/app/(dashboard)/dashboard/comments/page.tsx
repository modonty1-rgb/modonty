import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getClientComments, getCommentStats } from "./helpers/comment-queries";
import { CommentsTable } from "./components/comments-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, Clock, CheckCircle, XCircle } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function CommentsPage() {
  const session = await auth();
  const clientId = (session as { clientId?: string })?.clientId;

  if (!clientId) {
    redirect("/");
  }

  const [comments, stats] = await Promise.all([
    getClientComments(clientId),
    getCommentStats(clientId),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold leading-tight text-foreground">
          Comment Moderation
        </h1>
        <p className="text-muted-foreground mt-1">
          Review and moderate article comments
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              <CardTitle className="text-base font-medium">Pending</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-foreground">
              {stats.pending}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Awaiting review
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <CardTitle className="text-base font-medium">Approved</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-foreground">
              {stats.approved}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Published comments
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <XCircle className="h-4 w-4 text-red-600" />
              <CardTitle className="text-base font-medium">Rejected</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-foreground">
              {stats.rejected}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Rejected comments
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-primary" />
              <CardTitle className="text-base font-medium">Total</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-foreground">
              {stats.total}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              All comments
            </p>
          </CardContent>
        </Card>
      </div>

      <CommentsTable comments={comments} clientId={clientId} />
    </div>
  );
}
