"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ar } from "@/lib/ar";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, XCircle, Edit2 } from "lucide-react";
import type { ClientFAQWithArticle } from "../helpers/faq-queries";
import { approveFaq, rejectFaq } from "../actions/faq-actions";

interface FaqsTableProps {
  faqs: (ClientFAQWithArticle & { createdAtFormatted: string })[];
}

function statusBadge(status: string) {
  const f = ar.faqs;
  if (status === "PENDING")
    return <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">{f.pending}</span>;
  if (status === "PUBLISHED")
    return <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">{f.published}</span>;
  return <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{f.rejected}</span>;
}

export function FaqsTable({ faqs }: FaqsTableProps) {
  const f = ar.faqs;
  const router = useRouter();
  const [filter, setFilter] = useState<"all" | "PENDING" | "PUBLISHED" | "REJECTED">("all");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editAnswer, setEditAnswer] = useState("");
  const [isPending, startTransition] = useTransition();
  const [actionId, setActionId] = useState<string | null>(null);

  const filtered = filter === "all" ? faqs : faqs.filter((x) => x.status === filter);

  function startEdit(faq: ClientFAQWithArticle) {
    setEditingId(faq.id);
    setEditAnswer(faq.answer ?? "");
  }

  function handleApprove(faqId: string) {
    const answer = editingId === faqId ? editAnswer : faqs.find((f) => f.id === faqId)?.answer ?? "";
    if (!answer.trim()) {
      startEdit(faqs.find((f) => f.id === faqId)!);
      return;
    }
    setActionId(faqId);
    startTransition(async () => {
      const result = await approveFaq(faqId, answer);
      if (result.success) {
        setEditingId(null);
        router.refresh();
      } else {
        alert(result.error || f.approveFailed);
      }
      setActionId(null);
    });
  }

  function handleReject(faqId: string) {
    setActionId(faqId);
    startTransition(async () => {
      const result = await rejectFaq(faqId);
      if (result.success) {
        router.refresh();
      } else {
        alert(result.error || f.rejectFailed);
      }
      setActionId(null);
    });
  }

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <CardTitle className="text-lg">{f.title}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {filtered.length} {f.faqsCount}
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            {(["all", "PENDING", "PUBLISHED", "REJECTED"] as const).map((v) => (
              <Button
                key={v}
                variant={filter === v ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter(v)}
              >
                {v === "all" ? f.all : v === "PENDING" ? f.pending : v === "PUBLISHED" ? f.published : f.rejected}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {filtered.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground py-8">{f.noFaqs}</p>
        ) : (
          <div className="space-y-4">
            {filtered.map((item) => (
              <div
                key={item.id}
                className={cn(
                  "p-4 rounded-lg border",
                  item.status === "PENDING" ? "border-amber-300 dark:border-amber-700" : "border-border"
                )}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      {statusBadge(item.status)}
                      <span className="text-xs text-muted-foreground">
                        {f.fromArticle}: {item.article.title}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-foreground">{item.question}</p>

                    {editingId === item.id ? (
                      <div className="space-y-2">
                        <Textarea
                          value={editAnswer}
                          onChange={(e) => setEditAnswer(e.target.value)}
                          rows={4}
                          placeholder={f.answerPlaceholder}
                          className="text-sm"
                        />
                      </div>
                    ) : item.answer ? (
                      <div className="ps-3 border-s-2 border-muted">
                        <p className="text-xs text-muted-foreground mb-1">{f.answerLabel}:</p>
                        <p className="text-sm text-foreground">{item.answer}</p>
                      </div>
                    ) : null}

                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{item.createdAtFormatted}</span>
                      {item.source && (
                        <span>· {item.source === "chatbot" ? f.sourceChatbot : f.sourceManual}</span>
                      )}
                    </div>
                  </div>

                  {item.status === "PENDING" && (
                    <div className="flex flex-col gap-2 shrink-0">
                      {editingId !== item.id && (
                        <Button size="sm" variant="outline" onClick={() => startEdit(item)} disabled={isPending}>
                          <Edit2 className="h-3.5 w-3.5 me-1.5" />
                          {f.editAnswer}
                        </Button>
                      )}
                      <Button
                        size="sm"
                        onClick={() => handleApprove(item.id)}
                        disabled={isPending && actionId === item.id}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white"
                      >
                        <CheckCircle className="h-3.5 w-3.5 me-1.5" />
                        {actionId === item.id ? f.approving : f.approve}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleReject(item.id)}
                        disabled={isPending && actionId === item.id}
                        className="border-destructive text-destructive hover:bg-destructive/10"
                      >
                        <XCircle className="h-3.5 w-3.5 me-1.5" />
                        {actionId === item.id ? f.rejecting : f.reject}
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
