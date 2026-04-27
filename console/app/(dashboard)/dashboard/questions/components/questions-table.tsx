"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ar } from "@/lib/ar";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Clock, CheckCircle } from "lucide-react";
import { VisitorQuestionWithDetails } from "../helpers/question-queries";
import { replyToQuestion } from "../actions/question-actions";

interface QuestionsTableProps {
  questions: VisitorQuestionWithDetails[];
  clientId: string;
}

function statusLabel(status: string): string {
  const q = ar.questions;
  if (status === "PENDING") return q.pending;
  if (status === "PUBLISHED") return q.answered;
  return status;
}

export function QuestionsTable({ questions, clientId }: QuestionsTableProps) {
  const q = ar.questions;
  const router = useRouter();
  const [filter, setFilter] = useState<string>("all");
  const [replyText, setReplyText] = useState<Record<string, string>>({});
  const [updating, setUpdating] = useState<string | null>(null);

  const filtered =
    filter === "all"
      ? questions
      : filter === "pending"
        ? questions.filter((x) => !x.answer?.trim())
        : questions.filter((x) => Boolean(x.answer?.trim()));

  const handleReply = async (faqId: string) => {
    const text = replyText[faqId]?.trim();
    if (!text) return;
    setUpdating(faqId);
    const result = await replyToQuestion(faqId, clientId, text);
    if (result.success) {
      setReplyText((prev) => {
        const next = { ...prev };
        delete next[faqId];
        return next;
      });
      router.refresh();
    } else {
      alert(result.error || q.replyFailed);
    }
    setUpdating(null);
  };

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <CardTitle className="text-lg">{q.title}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {filtered.length} {q.questionsCount}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={filter === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("all")}
            >
              {q.all}
            </Button>
            <Button
              variant={filter === "pending" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("pending")}
            >
              {q.pending}
            </Button>
            <Button
              variant={filter === "published" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("published")}
            >
              {q.answered}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {filtered.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground py-8">
            {q.noQuestions}
          </p>
        ) : (
          <div className="space-y-4">
            {filtered.map((item) => (
              <div
                key={item.id}
                className={cn(
                  "p-4 rounded-lg border",
                  !item.answer?.trim()
                    ? "border-destructive"
                    : "border-border"
                )}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">
                      {item.submittedByName || q.anonymous}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {item.submittedByEmail || q.noEmail}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {q.fromArticle}: {item.article.title}
                    </p>
                    <p className="text-sm text-foreground mt-2">
                      {item.question}
                    </p>
                    {item.answer && (
                      <div className="mt-2 ps-3 border-s-2 border-muted">
                        <p className="text-xs text-muted-foreground">
                          {q.yourReply}
                        </p>
                        <p className="text-sm text-foreground">{item.answer}</p>
                      </div>
                    )}
                    <div className="flex items-center gap-4 mt-2">
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          !item.answer?.trim()
                            ? "bg-muted text-muted-foreground"
                            : "bg-primary/10 text-primary"
                        }`}
                      >
                        {item.answer?.trim()
                          ? q.answered
                          : statusLabel(item.status)}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {item.createdAtFormatted ??
                          new Date(item.createdAt).toISOString()}
                      </span>
                    </div>
                  </div>
                  {!item.answer?.trim() && (
                    <div className="flex flex-col gap-2 w-full max-w-sm shrink-0">
                      <Textarea
                        placeholder={q.replyPlaceholder}
                        value={replyText[item.id] ?? ""}
                        onChange={(e) =>
                          setReplyText((prev) => ({
                            ...prev,
                            [item.id]: e.target.value,
                          }))
                        }
                        rows={3}
                        className="text-sm"
                      />
                      <Button
                        size="sm"
                        onClick={() => handleReply(item.id)}
                        disabled={
                          updating === item.id ||
                          !(replyText[item.id]?.trim())
                        }
                      >
                        <Send className="h-3 w-3 me-2" />
                        {q.reply}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
