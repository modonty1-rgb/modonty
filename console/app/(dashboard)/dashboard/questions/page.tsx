import { auth } from "@/lib/auth";
import { ar } from "@/lib/ar";
import { redirect } from "next/navigation";
import {
  getClientVisitorQuestions,
  getVisitorQuestionStats,
  formatQuestionDate,
} from "./helpers/question-queries";
import { QuestionsTable } from "./components/questions-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, CheckCircle, MessageSquare } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function QuestionsPage() {
  const session = await auth();
  const clientId = (session as { clientId?: string })?.clientId;

  if (!clientId) {
    redirect("/");
  }

  const [questionsRaw, stats] = await Promise.all([
    getClientVisitorQuestions(clientId),
    getVisitorQuestionStats(clientId),
  ]);
  const questions = questionsRaw.map((q) => ({
    ...q,
    createdAtFormatted: formatQuestionDate(q.createdAt),
  }));
  const q = ar.questions;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold leading-tight text-foreground">
          {q.title}
        </h1>
        <p className="text-muted-foreground mt-1">{q.description}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              <CardTitle className="text-base font-medium">{q.pending}</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-foreground">
              {stats.pending}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {q.awaitingReply}
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-primary" />
              <CardTitle className="text-base font-medium">{q.answered}</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-foreground">
              {stats.answered}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {q.publishedReplies}
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-primary" />
              <CardTitle className="text-base font-medium">{q.total}</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-foreground">
              {stats.total}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {q.allQuestions}
            </p>
          </CardContent>
        </Card>
      </div>

      <QuestionsTable questions={questions} clientId={clientId} />
    </div>
  );
}
