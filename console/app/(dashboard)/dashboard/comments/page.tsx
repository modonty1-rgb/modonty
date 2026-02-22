import { auth } from "@/lib/auth";
import { ar } from "@/lib/ar";
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

  const c = ar.comments;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold leading-tight text-foreground">
          {c.title}
        </h1>
        <p className="text-muted-foreground mt-1">
          {c.reviewModerate}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              <CardTitle className="text-base font-medium">{c.pending}</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-foreground">
              {stats.pending}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {c.awaitingReview}
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-primary" />
              <CardTitle className="text-base font-medium">{c.approved}</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-foreground">
              {stats.approved}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {c.publishedComments}
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <XCircle className="h-4 w-4 text-destructive" />
              <CardTitle className="text-base font-medium">{c.rejected}</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-foreground">
              {stats.rejected}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {c.rejectedComments}
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-primary" />
              <CardTitle className="text-base font-medium">{c.total}</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-foreground">
              {stats.total}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {c.allComments}
            </p>
          </CardContent>
        </Card>
      </div>

      <CommentsTable comments={comments} clientId={clientId} />
    </div>
  );
}
