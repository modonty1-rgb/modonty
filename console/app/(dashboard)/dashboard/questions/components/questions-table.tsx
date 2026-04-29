"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { ar } from "@/lib/ar";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Send,
  XCircle,
  RotateCcw,
  Search as SearchIcon,
  MessageSquare,
  Mail,
  ExternalLink,
  HelpCircle,
  UserCircle2,
  Bot,
} from "lucide-react";
import { ArticleFAQStatus } from "@prisma/client";
import type { VisitorQuestionWithDetails } from "../helpers/question-queries";
import {
  replyToQuestion,
  rejectQuestion,
  restoreQuestion,
} from "../actions/question-actions";

interface Props {
  questions: VisitorQuestionWithDetails[];
}

type FilterKey = "all" | ArticleFAQStatus;

function formatDateTime(d: Date | string | null | undefined): string {
  if (!d) return "—";
  return new Intl.DateTimeFormat("en-GB", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(d));
}

function statusMeta(status: ArticleFAQStatus) {
  const q = ar.questions;
  if (status === "PENDING") {
    return {
      label: q.pending,
      classes: "bg-amber-50 text-amber-700 ring-amber-200",
    };
  }
  if (status === "PUBLISHED") {
    return {
      label: q.answered,
      classes: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    };
  }
  return {
    label: q.rejected,
    classes: "bg-red-50 text-red-700 ring-red-200",
  };
}

function sourceLabel(source: string | null): string {
  const q = ar.questions;
  if (source === "chatbot") return q.sourceChatbot;
  if (source === "user") return q.sourceUser;
  return q.fromReader;
}

export function QuestionsTable({ questions }: Props) {
  const q = ar.questions;
  const [filter, setFilter] = useState<FilterKey>("all");
  const [query, setQuery] = useState("");
  const [openItem, setOpenItem] = useState<VisitorQuestionWithDetails | null>(
    null
  );
  const [replyDraft, setReplyDraft] = useState<Record<string, string>>({});
  const [actionId, setActionId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const filtered = useMemo(() => {
    let result = questions;
    if (filter !== "all") result = result.filter((x) => x.status === filter);
    if (query.trim()) {
      const ql = query.trim().toLowerCase();
      result = result.filter(
        (x) =>
          x.question.toLowerCase().includes(ql) ||
          (x.answer ?? "").toLowerCase().includes(ql) ||
          (x.submittedByName ?? "").toLowerCase().includes(ql) ||
          (x.submittedByEmail ?? "").toLowerCase().includes(ql) ||
          x.article.title.toLowerCase().includes(ql)
      );
    }
    return result;
  }, [questions, filter, query]);

  const counts = useMemo(
    () => ({
      all: questions.length,
      PENDING: questions.filter((x) => x.status === "PENDING").length,
      PUBLISHED: questions.filter((x) => x.status === "PUBLISHED").length,
      REJECTED: questions.filter((x) => x.status === "REJECTED").length,
    }),
    [questions]
  );

  function confirmThen(message: string, onConfirm: () => void) {
    toast(message, {
      duration: 8000,
      action: { label: q.confirmYes, onClick: onConfirm },
      cancel: { label: q.cancel, onClick: () => {} },
    });
  }

  function handleReply(faqId: string) {
    const text = replyDraft[faqId]?.trim();
    if (!text) {
      toast.warning(q.answerRequired);
      return;
    }
    setActionId(faqId);
    startTransition(async () => {
      const res = await replyToQuestion(faqId, text);
      if (res.success) {
        toast.success(q.replySuccess);
        setReplyDraft((prev) => {
          const next = { ...prev };
          delete next[faqId];
          return next;
        });
      } else {
        toast.error(res.error || q.replyFailed);
      }
      setActionId(null);
    });
  }

  function handleReject(faqId: string) {
    confirmThen(q.confirmReject, () => {
      setActionId(faqId);
      startTransition(async () => {
        const res = await rejectQuestion(faqId);
        if (res.success) toast.success(q.rejected_toast);
        else toast.error(res.error || q.rejectFailed);
        setActionId(null);
      });
    });
  }

  function handleRestore(faqId: string) {
    setActionId(faqId);
    startTransition(async () => {
      const res = await restoreQuestion(faqId);
      if (res.success) toast.success(q.restored_toast);
      else toast.error(res.error || q.rejectFailed);
      setActionId(null);
    });
  }

  return (
    <>
      <Card className="shadow-sm">
        <CardContent className="space-y-4 p-6">
          {/* Toolbar */}
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full max-w-sm">
              <SearchIcon className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={q.searchPlaceholder}
                className="ps-9"
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <FilterPill
                active={filter === "all"}
                onClick={() => setFilter("all")}
                label={q.title}
                count={counts.all}
              />
              <FilterPill
                active={filter === "PENDING"}
                onClick={() => setFilter("PENDING")}
                label={q.pending}
                count={counts.PENDING}
                tone="amber"
              />
              <FilterPill
                active={filter === "PUBLISHED"}
                onClick={() => setFilter("PUBLISHED")}
                label={q.answered}
                count={counts.PUBLISHED}
                tone="emerald"
              />
              <FilterPill
                active={filter === "REJECTED"}
                onClick={() => setFilter("REJECTED")}
                label={q.rejected}
                count={counts.REJECTED}
                tone="red"
              />
            </div>
          </div>

          {/* Body */}
          {filtered.length === 0 ? (
            <EmptyState
              hasItems={questions.length > 0}
              hasQuery={!!query.trim()}
              hasFilter={filter !== "all"}
            />
          ) : (
            <div className="space-y-3">
              {filtered.map((item) => (
                <QuestionRow
                  key={item.id}
                  item={item}
                  draft={replyDraft[item.id] ?? ""}
                  setDraft={(v) =>
                    setReplyDraft((prev) => ({ ...prev, [item.id]: v }))
                  }
                  isWorking={isPending && actionId === item.id}
                  onOpenDetails={() => setOpenItem(item)}
                  onReply={() => handleReply(item.id)}
                  onReject={() => handleReject(item.id)}
                  onRestore={() => handleRestore(item.id)}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <QuestionDetailSheet
        item={openItem}
        onClose={() => setOpenItem(null)}
      />
    </>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────

function FilterPill({
  active,
  onClick,
  label,
  count,
  tone,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  count: number;
  tone?: "amber" | "emerald" | "red";
}) {
  const accent =
    !active && tone
      ? {
          amber: "border-amber-200 text-amber-700",
          emerald: "border-emerald-200 text-emerald-700",
          red: "border-red-200 text-red-700",
        }[tone]
      : "";
  return (
    <Button
      variant={active ? "default" : "outline"}
      size="sm"
      onClick={onClick}
      className={`gap-2 whitespace-nowrap ${accent}`}
    >
      {label}
      <span
        className={`inline-flex h-5 min-w-[1.25rem] shrink-0 items-center justify-center rounded-full px-1.5 text-[11px] font-bold tabular-nums ${
          active
            ? "bg-background/20 text-primary-foreground"
            : "bg-muted text-muted-foreground"
        }`}
      >
        {count}
      </span>
    </Button>
  );
}

function QuestionRow({
  item,
  draft,
  setDraft,
  isWorking,
  onOpenDetails,
  onReply,
  onReject,
  onRestore,
}: {
  item: VisitorQuestionWithDetails;
  draft: string;
  setDraft: (v: string) => void;
  isWorking: boolean;
  onOpenDetails: () => void;
  onReply: () => void;
  onReject: () => void;
  onRestore: () => void;
}) {
  const q = ar.questions;
  const status = statusMeta(item.status);
  const isPending = item.status === "PENDING";
  const isPublished = item.status === "PUBLISHED";
  const isRejected = item.status === "REJECTED";
  const SourceIcon = item.source === "chatbot" ? Bot : UserCircle2;

  const borderClass = isPending
    ? "border-amber-200"
    : isPublished
      ? "border-emerald-200"
      : "border-red-200";

  return (
    <div className={cn("rounded-lg border bg-card p-4", borderClass)}>
      <div className="flex items-start gap-3">
        <SourceIcon className="h-9 w-9 shrink-0 text-muted-foreground" />
        <div className="min-w-0 flex-1 space-y-2">
          {/* Top metadata */}
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ${status.classes}`}
            >
              {status.label}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-violet-50 px-2 py-0.5 text-[11px] font-semibold text-violet-700 ring-1 ring-violet-200">
              <MessageSquare className="h-3 w-3" />
              {sourceLabel(item.source)}
            </span>
            <Link
              href={`/dashboard/articles/${item.article.id}`}
              className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline"
            >
              {q.fromArticle}: {item.article.title}
              <ExternalLink className="h-3 w-3" />
            </Link>
          </div>

          {/* Submitter */}
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="font-medium text-foreground">
              {item.submittedByName || q.anonymous}
            </span>
            {item.submittedByEmail && (
              <a
                href={`mailto:${item.submittedByEmail}`}
                className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-primary hover:underline"
              >
                <Mail className="h-3 w-3" />
                {item.submittedByEmail}
              </a>
            )}
          </div>

          {/* Question text (clickable) */}
          <button
            type="button"
            onClick={onOpenDetails}
            className="block text-start text-sm font-semibold text-foreground hover:text-primary hover:underline"
          >
            {item.question}
          </button>

          {/* Answer (when published) */}
          {item.answer && (
            <div className="border-s-2 border-emerald-300 bg-emerald-50/30 rounded-e-md py-2 ps-3">
              <p className="text-[11px] font-semibold uppercase text-emerald-800">
                {q.yourReply}
              </p>
              <p className="mt-0.5 text-sm leading-relaxed text-foreground">
                {item.answer}
              </p>
            </div>
          )}

          {/* Reply textarea (only when PENDING) */}
          {isPending && (
            <div className="space-y-2">
              <Textarea
                placeholder={q.replyPlaceholder}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                rows={3}
                className="text-sm"
                dir="auto"
              />
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  onClick={onReply}
                  disabled={isWorking || !draft.trim()}
                  className="gap-1.5"
                >
                  <Send className="h-3.5 w-3.5" />
                  {isWorking ? q.replying : q.reply}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onReject}
                  disabled={isWorking}
                  className="gap-1.5 border-destructive text-destructive hover:bg-destructive/10"
                >
                  <XCircle className="h-3.5 w-3.5" />
                  {isWorking ? q.rejectingQuestion : q.rejectQuestion}
                </Button>
              </div>
            </div>
          )}

          {/* Restore button for PUBLISHED/REJECTED */}
          {!isPending && (
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={onRestore}
                disabled={isWorking}
                className="gap-1.5"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                {q.restoreQuestion}
              </Button>
              {isRejected && item.submittedByEmail && (
                <Button asChild size="sm" variant="ghost" className="gap-1.5">
                  <a href={`mailto:${item.submittedByEmail}`}>
                    <Mail className="h-3.5 w-3.5" />
                    {q.contactCta}
                  </a>
                </Button>
              )}
            </div>
          )}

          {/* Footer */}
          <p className="text-[11px] text-muted-foreground tabular-nums">
            {formatDateTime(item.createdAt)}
          </p>
        </div>
      </div>
    </div>
  );
}

function EmptyState({
  hasItems,
  hasQuery,
  hasFilter,
}: {
  hasItems: boolean;
  hasQuery: boolean;
  hasFilter: boolean;
}) {
  const q = ar.questions;
  if (!hasItems) {
    return (
      <div className="py-16 text-center">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-primary/10">
          <HelpCircle className="h-8 w-8 text-primary" />
        </div>
        <h3 className="mt-4 text-base font-semibold text-foreground">
          {q.noQuestions}
        </h3>
        <p className="mt-1 max-w-md mx-auto text-sm text-muted-foreground">
          {q.noQuestionsHint}
        </p>
      </div>
    );
  }
  if (hasQuery) {
    return (
      <div className="py-12 text-center">
        <SearchIcon className="mx-auto h-10 w-10 text-muted-foreground" />
        <p className="mt-3 text-sm font-medium">{q.noSearchResults}</p>
      </div>
    );
  }
  if (hasFilter) {
    return (
      <div className="py-12 text-center">
        <HelpCircle className="mx-auto h-10 w-10 text-muted-foreground" />
        <p className="mt-3 text-sm font-medium">{q.noFilterResults}</p>
      </div>
    );
  }
  return null;
}

// ─── Detail Sheet ────────────────────────────────────────────────────

function QuestionDetailSheet({
  item,
  onClose,
}: {
  item: VisitorQuestionWithDetails | null;
  onClose: () => void;
}) {
  const q = ar.questions;
  if (!item) return null;
  const email = item.submittedByEmail;

  return (
    <Sheet open={!!item} onOpenChange={(o) => !o && onClose()}>
      <SheetContent
        side="left"
        className="w-full sm:max-w-md overflow-y-auto"
      >
        <SheetHeader>
          <SheetTitle>{q.detailsTitle}</SheetTitle>
          <SheetDescription className="text-foreground/90">
            {item.question}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-5">
          {(item.submittedByName || email) && (
            <Section title={q.submitterSection}>
              {item.submittedByName && (
                <Field label={q.submitterName} value={item.submittedByName} />
              )}
              {email && (
                <>
                  <Field label={q.submitterEmail} value={email} mono />
                  <Button asChild size="sm" variant="outline" className="gap-2">
                    <a href={`mailto:${email}`}>
                      <Mail className="h-3.5 w-3.5" />
                      {q.contactCta}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </Button>
                </>
              )}
            </Section>
          )}

          <Section title={q.questionSection}>
            <div className="rounded-md border bg-muted/30 p-3">
              <p className="text-sm leading-relaxed text-foreground">
                {item.question}
              </p>
            </div>
          </Section>

          {item.answer && (
            <Section title={q.answerSection}>
              <div className="rounded-md border border-emerald-200 bg-emerald-50/40 p-3">
                <p className="text-sm leading-relaxed text-foreground">
                  {item.answer}
                </p>
              </div>
            </Section>
          )}

          <Section title={q.articleSection}>
            <Button asChild size="sm" variant="outline" className="gap-2">
              <Link href={`/dashboard/articles/${item.article.id}`}>
                {item.article.title}
                <ExternalLink className="h-3 w-3" />
              </Link>
            </Button>
          </Section>

          <Section title={q.timelineSection}>
            <Field
              label={q.submittedAt}
              value={formatDateTime(item.createdAt)}
              mono
            />
            {item.status === "PUBLISHED" && (
              <Field
                label={q.repliedAt}
                value={formatDateTime(item.updatedAt)}
                mono
              />
            )}
          </Section>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-2">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {title}
      </h3>
      <div className="space-y-2">{children}</div>
    </section>
  );
}

function Field({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="space-y-0.5">
      <p className="text-[11px] text-muted-foreground">{label}</p>
      <p
        className={`break-all text-sm text-foreground ${mono ? "tabular-nums" : ""}`}
      >
        {value}
      </p>
    </div>
  );
}
