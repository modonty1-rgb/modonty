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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  CheckCircle,
  XCircle,
  Edit2,
  Search as SearchIcon,
  MessageSquare,
  ExternalLink,
  Mail,
  RotateCcw,
  Save,
  X as XIcon,
  AlertTriangle,
  HelpCircle,
} from "lucide-react";
import type { ClientFAQWithArticle } from "../helpers/faq-queries";
import {
  approveFaq,
  rejectFaq,
  restoreFaqToPendingAction,
  editPublishedFaqAction,
  bulkPublishFaqsAction,
  bulkRejectFaqsAction,
} from "../actions/faq-actions";

interface Props {
  faqs: ClientFAQWithArticle[];
}

type FilterKey = "all" | "PENDING" | "PUBLISHED" | "REJECTED";

function formatDate(d: Date | string | null | undefined): string {
  if (!d) return "—";
  return new Intl.DateTimeFormat("en-GB", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(d));
}

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

function statusMeta(status: string) {
  if (status === "PENDING") {
    return {
      label: ar.faqs.pending,
      classes: "bg-amber-50 text-amber-700 ring-amber-200",
    };
  }
  if (status === "PUBLISHED") {
    return {
      label: ar.faqs.published,
      classes: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    };
  }
  return {
    label: ar.faqs.rejected,
    classes: "bg-slate-100 text-slate-600 ring-slate-200",
  };
}

function sourceMeta(source: string | null) {
  const f = ar.faqs;
  if (source === "chatbot") return { label: f.sourceChatbot, isReader: true };
  if (source === "user") return { label: f.sourceUser, isReader: true };
  if (source === "manual" || source == null)
    return { label: f.sourceManual, isReader: false };
  return { label: f.sourceUnknown, isReader: false };
}

export function FaqsTable({ faqs }: Props) {
  const f = ar.faqs;
  const [filter, setFilter] = useState<FilterKey>("all");
  const [query, setQuery] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editAnswer, setEditAnswer] = useState("");
  const [actionId, setActionId] = useState<string | null>(null);
  const [openFaq, setOpenFaq] = useState<ClientFAQWithArticle | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [isPending, startTransition] = useTransition();

  const filtered = useMemo(() => {
    let result = faqs;
    if (filter !== "all") result = result.filter((x) => x.status === filter);
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      result = result.filter(
        (x) =>
          x.question.toLowerCase().includes(q) ||
          (x.answer ?? "").toLowerCase().includes(q) ||
          x.article.title.toLowerCase().includes(q)
      );
    }
    return result;
  }, [faqs, filter, query]);

  const counts = useMemo(
    () => ({
      all: faqs.length,
      PENDING: faqs.filter((x) => x.status === "PENDING").length,
      PUBLISHED: faqs.filter((x) => x.status === "PUBLISHED").length,
      REJECTED: faqs.filter((x) => x.status === "REJECTED").length,
    }),
    [faqs]
  );

  const allFilteredSelected =
    filtered.length > 0 && filtered.every((x) => selected.has(x.id));
  const someSelected = filtered.some((x) => selected.has(x.id));
  const indeterminate = someSelected && !allFilteredSelected;

  function toggleAllFiltered(checked: boolean) {
    setSelected((prev) => {
      const next = new Set(prev);
      filtered.forEach((x) => (checked ? next.add(x.id) : next.delete(x.id)));
      return next;
    });
  }

  function toggleOne(id: string, checked: boolean) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  function startEdit(faq: ClientFAQWithArticle) {
    setEditingId(faq.id);
    setEditAnswer(faq.answer ?? "");
  }

  function cancelEdit() {
    setEditingId(null);
    setEditAnswer("");
  }

  function confirmThen(message: string, onConfirm: () => void) {
    toast(message, {
      duration: 8000,
      action: { label: f.confirmYes, onClick: onConfirm },
      cancel: { label: f.cancel, onClick: () => {} },
    });
  }

  function handleApprove(faqId: string) {
    const target = faqs.find((x) => x.id === faqId);
    if (!target) return;
    const answer = editingId === faqId ? editAnswer : target.answer ?? "";
    if (!answer.trim()) {
      toast.warning(f.answerRequired);
      startEdit(target);
      return;
    }
    setActionId(faqId);
    startTransition(async () => {
      const res = await approveFaq(faqId, answer);
      if (res.success) {
        toast.success(f.approved_toast);
        setEditingId(null);
        setSelected((prev) => {
          const next = new Set(prev);
          next.delete(faqId);
          return next;
        });
      } else {
        toast.error(res.error || f.approveFailed);
      }
      setActionId(null);
    });
  }

  function handleReject(faqId: string) {
    setActionId(faqId);
    startTransition(async () => {
      const res = await rejectFaq(faqId);
      if (res.success) {
        toast.success(f.rejected_toast);
        setSelected((prev) => {
          const next = new Set(prev);
          next.delete(faqId);
          return next;
        });
      } else {
        toast.error(res.error || f.rejectFailed);
      }
      setActionId(null);
    });
  }

  function handleRestore(faqId: string) {
    setActionId(faqId);
    startTransition(async () => {
      const res = await restoreFaqToPendingAction(faqId);
      if (res.success) toast.success(f.restored_toast);
      else toast.error(res.error || f.saveFailed);
      setActionId(null);
    });
  }

  function handleSavePublishedEdit(faqId: string) {
    if (!editAnswer.trim()) {
      toast.warning(f.answerRequired);
      return;
    }
    setActionId(faqId);
    startTransition(async () => {
      const res = await editPublishedFaqAction(faqId, editAnswer);
      if (res.success) {
        toast.success(f.saved_toast);
        setEditingId(null);
      } else {
        toast.error(res.error || f.saveFailed);
      }
      setActionId(null);
    });
  }

  function handleBulkPublish() {
    const ids = Array.from(selected);
    confirmThen(
      f.confirmBulkPublish.replace("{n}", String(ids.length)),
      () => {
        startTransition(async () => {
          const res = await bulkPublishFaqsAction(ids);
          if (res.success) {
            toast.success(f.bulkPublished_toast.replace("{n}", String(res.count)));
            setSelected(new Set());
          } else toast.error(res.error || f.bulkFailed);
        });
      }
    );
  }

  function handleBulkReject() {
    const ids = Array.from(selected);
    confirmThen(f.confirmBulkReject.replace("{n}", String(ids.length)), () => {
      startTransition(async () => {
        const res = await bulkRejectFaqsAction(ids);
        if (res.success) {
          toast.success(f.bulkRejected_toast.replace("{n}", String(res.count)));
          setSelected(new Set());
        } else toast.error(res.error || f.bulkFailed);
      });
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
                placeholder={f.searchPlaceholder}
                className="ps-9"
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <FilterPill
                active={filter === "all"}
                onClick={() => setFilter("all")}
                label={f.all}
                count={counts.all}
              />
              <FilterPill
                active={filter === "PENDING"}
                onClick={() => setFilter("PENDING")}
                label={f.pending}
                count={counts.PENDING}
                tone="amber"
              />
              <FilterPill
                active={filter === "PUBLISHED"}
                onClick={() => setFilter("PUBLISHED")}
                label={f.published}
                count={counts.PUBLISHED}
                tone="emerald"
              />
              <FilterPill
                active={filter === "REJECTED"}
                onClick={() => setFilter("REJECTED")}
                label={f.rejected}
                count={counts.REJECTED}
                tone="slate"
              />
            </div>
          </div>

          {/* Bulk bar */}
          {selected.size > 0 && (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-primary/30 bg-primary/5 px-4 py-2.5">
              <p className="text-sm font-medium text-foreground">
                {selected.size} {f.selected}
              </p>
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleBulkPublish}
                  disabled={isPending}
                  className="gap-1.5"
                >
                  <CheckCircle className="h-3.5 w-3.5" />
                  {f.bulkPublish}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleBulkReject}
                  disabled={isPending}
                  className="gap-1.5 text-destructive hover:text-destructive"
                >
                  <XCircle className="h-3.5 w-3.5" />
                  {f.bulkReject}
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setSelected(new Set())}>
                  {f.clearSelection}
                </Button>
              </div>
            </div>
          )}

          {/* Select-all header (only when filtered list is non-empty) */}
          {filtered.length > 0 && (
            <div className="flex items-center justify-between border-b pb-2">
              <label className="flex items-center gap-2 text-xs text-muted-foreground">
                <Checkbox
                  checked={
                    allFilteredSelected
                      ? true
                      : indeterminate
                        ? "indeterminate"
                        : false
                  }
                  onCheckedChange={(c) => toggleAllFiltered(c === true)}
                  aria-label="Select all"
                />
                {filtered.length} {f.faqsCount}
              </label>
            </div>
          )}

          {/* Body */}
          {filtered.length === 0 ? (
            <EmptyState
              hasFaqs={faqs.length > 0}
              hasQuery={!!query.trim()}
              hasFilter={filter !== "all"}
            />
          ) : (
            <div className="space-y-3">
              {filtered.map((item) => (
                <FaqRow
                  key={item.id}
                  item={item}
                  selected={selected.has(item.id)}
                  toggleSelect={(c) => toggleOne(item.id, c)}
                  editingId={editingId}
                  editAnswer={editAnswer}
                  setEditAnswer={setEditAnswer}
                  startEdit={() => startEdit(item)}
                  cancelEdit={cancelEdit}
                  isWorking={isPending && actionId === item.id}
                  onOpenDetails={() => setOpenFaq(item)}
                  onApprove={() => handleApprove(item.id)}
                  onReject={() => handleReject(item.id)}
                  onRestore={() => handleRestore(item.id)}
                  onSaveEdit={() =>
                    item.status === "PUBLISHED"
                      ? handleSavePublishedEdit(item.id)
                      : handleApprove(item.id)
                  }
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <FaqDetailSheet
        item={openFaq}
        onClose={() => setOpenFaq(null)}
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
  tone?: "amber" | "emerald" | "slate";
}) {
  const toneAccent =
    !active && tone
      ? {
          amber: "border-amber-200 text-amber-700",
          emerald: "border-emerald-200 text-emerald-700",
          slate: "border-slate-200 text-slate-600",
        }[tone]
      : "";
  return (
    <Button
      variant={active ? "default" : "outline"}
      size="sm"
      onClick={onClick}
      className={`gap-2 whitespace-nowrap ${toneAccent}`}
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

function FaqRow({
  item,
  selected,
  toggleSelect,
  editingId,
  editAnswer,
  setEditAnswer,
  startEdit,
  cancelEdit,
  isWorking,
  onOpenDetails,
  onApprove,
  onReject,
  onRestore,
  onSaveEdit,
}: {
  item: ClientFAQWithArticle;
  selected: boolean;
  toggleSelect: (c: boolean) => void;
  editingId: string | null;
  editAnswer: string;
  setEditAnswer: (v: string) => void;
  startEdit: () => void;
  cancelEdit: () => void;
  isWorking: boolean;
  onOpenDetails: () => void;
  onApprove: () => void;
  onReject: () => void;
  onRestore: () => void;
  onSaveEdit: () => void;
}) {
  const f = ar.faqs;
  const status = statusMeta(item.status);
  const src = sourceMeta(item.source);
  const isReaderSubmission = src.isReader;
  const needsAnswer = !item.answer || item.answer.trim().length === 0;
  const isEditing = editingId === item.id;

  const borderClass =
    item.status === "PENDING"
      ? "border-amber-200"
      : item.status === "PUBLISHED"
        ? "border-emerald-200"
        : "border-slate-200";

  return (
    <div
      className={cn(
        "rounded-lg border bg-card p-4 transition-colors",
        selected ? "ring-2 ring-primary/40 bg-primary/5" : borderClass
      )}
    >
      <div className="flex items-start gap-3">
        <Checkbox
          checked={selected}
          onCheckedChange={(c) => toggleSelect(c === true)}
          aria-label={item.question}
          className="mt-1"
        />
        <div className="min-w-0 flex-1 space-y-2">
          {/* Top metadata strip */}
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ${status.classes}`}
            >
              {status.label}
            </span>
            {isReaderSubmission && (
              <span className="inline-flex items-center gap-1 rounded-full bg-violet-50 px-2 py-0.5 text-[11px] font-semibold text-violet-700 ring-1 ring-violet-200">
                <MessageSquare className="h-3 w-3" />
                {src.label}
              </span>
            )}
            {!isReaderSubmission && (
              <span className="text-[11px] text-muted-foreground">
                {src.label}
              </span>
            )}
            <Link
              href={`/dashboard/articles/${item.article.id}`}
              className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline"
            >
              {f.fromArticle}: {item.article.title}
              <ExternalLink className="h-3 w-3" />
            </Link>
          </div>

          {/* Question + open details */}
          <button
            type="button"
            onClick={onOpenDetails}
            className="block text-start text-sm font-semibold text-foreground hover:text-primary hover:underline"
          >
            {item.question}
          </button>

          {/* Submitted by — only for reader submissions */}
          {isReaderSubmission && (item.submittedByName || item.submittedByEmail) && (
            <div className="flex flex-wrap items-center gap-2 rounded-md border border-violet-200 bg-violet-50/50 px-2.5 py-1.5 text-[11px]">
              <span className="text-violet-900 font-medium">{f.submittedBy}:</span>
              {item.submittedByName && (
                <span className="text-violet-900">{item.submittedByName}</span>
              )}
              {item.submittedByEmail && (
                <a
                  href={`mailto:${item.submittedByEmail}`}
                  className="inline-flex items-center gap-1 text-violet-700 hover:underline"
                >
                  <Mail className="h-3 w-3" />
                  {item.submittedByEmail}
                </a>
              )}
            </div>
          )}

          {/* Needs-answer banner for reader submissions without answer */}
          {needsAnswer && isReaderSubmission && !isEditing && (
            <div className="flex items-start gap-2 rounded-md border border-amber-300 bg-amber-50 px-2.5 py-1.5 text-xs text-amber-900">
              <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
              <span>{f.needsAnswerHint}</span>
            </div>
          )}

          {/* Answer / editor */}
          {isEditing ? (
            <div className="space-y-2">
              <Textarea
                value={editAnswer}
                onChange={(e) => setEditAnswer(e.target.value)}
                rows={4}
                placeholder={f.answerPlaceholder}
                className="text-sm"
                dir="auto"
              />
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  onClick={onSaveEdit}
                  disabled={isWorking || !editAnswer.trim()}
                  className="gap-1.5"
                >
                  <Save className="h-3.5 w-3.5" />
                  {item.status === "PUBLISHED" ? f.save : f.approve}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={cancelEdit}
                  disabled={isWorking}
                  className="gap-1.5"
                >
                  <XIcon className="h-3.5 w-3.5" />
                  {f.cancel}
                </Button>
              </div>
            </div>
          ) : item.answer ? (
            <div className="ps-3 border-s-2 border-muted">
              <p className="text-[11px] text-muted-foreground mb-1">{f.answerLabel}:</p>
              <p className="text-sm text-foreground leading-relaxed">{item.answer}</p>
            </div>
          ) : null}

          {/* Footer + actions */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            <p className="text-[11px] text-muted-foreground tabular-nums">
              {formatDate(item.createdAt)}
            </p>
            {!isEditing && <RowActions
              status={item.status}
              isWorking={isWorking}
              onEdit={startEdit}
              onApprove={onApprove}
              onReject={onReject}
              onRestore={onRestore}
            />}
          </div>
        </div>
      </div>
    </div>
  );
}

function RowActions({
  status,
  isWorking,
  onEdit,
  onApprove,
  onReject,
  onRestore,
}: {
  status: string;
  isWorking: boolean;
  onEdit: () => void;
  onApprove: () => void;
  onReject: () => void;
  onRestore: () => void;
}) {
  const f = ar.faqs;
  if (status === "PENDING") {
    return (
      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant="outline" onClick={onEdit} disabled={isWorking} className="gap-1.5">
          <Edit2 className="h-3.5 w-3.5" />
          {f.editAnswer}
        </Button>
        <Button
          size="sm"
          onClick={onApprove}
          disabled={isWorking}
          className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
        >
          <CheckCircle className="h-3.5 w-3.5" />
          {isWorking ? f.approving : f.approve}
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={onReject}
          disabled={isWorking}
          className="gap-1.5 border-destructive text-destructive hover:bg-destructive/10"
        >
          <XCircle className="h-3.5 w-3.5" />
          {isWorking ? f.rejecting : f.reject}
        </Button>
      </div>
    );
  }
  if (status === "PUBLISHED") {
    return (
      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant="outline" onClick={onEdit} disabled={isWorking} className="gap-1.5">
          <Edit2 className="h-3.5 w-3.5" />
          {f.editPublished}
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={onRestore}
          disabled={isWorking}
          className="gap-1.5"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          {f.restore}
        </Button>
      </div>
    );
  }
  // REJECTED
  return (
    <div className="flex flex-wrap gap-2">
      <Button
        size="sm"
        variant="outline"
        onClick={onRestore}
        disabled={isWorking}
        className="gap-1.5"
      >
        <RotateCcw className="h-3.5 w-3.5" />
        {f.restore}
      </Button>
    </div>
  );
}

function EmptyState({
  hasFaqs,
  hasQuery,
  hasFilter,
}: {
  hasFaqs: boolean;
  hasQuery: boolean;
  hasFilter: boolean;
}) {
  const f = ar.faqs;
  if (!hasFaqs) {
    return (
      <div className="py-16 text-center">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-primary/10">
          <HelpCircle className="h-8 w-8 text-primary" />
        </div>
        <h3 className="mt-4 text-base font-semibold text-foreground">{f.noFaqs}</h3>
        <p className="mt-1 max-w-sm mx-auto text-sm text-muted-foreground">
          {f.noFaqsHint}
        </p>
      </div>
    );
  }
  if (hasQuery) {
    return (
      <div className="py-12 text-center">
        <SearchIcon className="mx-auto h-10 w-10 text-muted-foreground" />
        <p className="mt-3 text-sm font-medium">{f.noSearchResults}</p>
      </div>
    );
  }
  if (hasFilter) {
    return (
      <div className="py-12 text-center">
        <HelpCircle className="mx-auto h-10 w-10 text-muted-foreground" />
        <p className="mt-3 text-sm font-medium">{f.noFilterResults}</p>
      </div>
    );
  }
  return null;
}

// ─── Detail Sheet ────────────────────────────────────────────────────

function FaqDetailSheet({
  item,
  onClose,
}: {
  item: ClientFAQWithArticle | null;
  onClose: () => void;
}) {
  const f = ar.faqs;
  if (!item) return null;
  const src = sourceMeta(item.source);

  return (
    <Sheet open={!!item} onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="left" className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{f.detailsTitle}</SheetTitle>
          <SheetDescription className="text-foreground/90">
            {item.question}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-5">
          {/* Source + status */}
          <Section title={f.source}>
            <p className="text-sm text-foreground">{src.label}</p>
          </Section>

          {/* Submitter info — only when present */}
          {(item.submittedByName || item.submittedByEmail) && (
            <Section title={f.submitterLabel}>
              {item.submittedByName && (
                <Field label={f.submitterName} value={item.submittedByName} />
              )}
              {item.submittedByEmail && (
                <>
                  <Field label={f.submitterEmail} value={item.submittedByEmail} mono />
                  <Button asChild size="sm" variant="outline" className="gap-2">
                    <a href={`mailto:${item.submittedByEmail}`}>
                      <Mail className="h-3.5 w-3.5" />
                      {f.contactReaderViaEmail}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </Button>
                </>
              )}
            </Section>
          )}

          {/* Article link */}
          <Section title={f.fromArticle}>
            <Button asChild size="sm" variant="outline" className="gap-2">
              <Link href={`/dashboard/articles/${item.article.id}`}>
                {item.article.title}
                <ExternalLink className="h-3 w-3" />
              </Link>
            </Button>
          </Section>

          {/* Timeline */}
          <Section title={f.lastUpdated}>
            <Field label={f.submittedAt} value={formatDateTime(item.createdAt)} mono />
            <Field label={f.lastUpdated} value={formatDateTime(item.updatedAt)} mono />
          </Section>

          {/* Answer */}
          {item.answer && (
            <Section title={f.answerLabel}>
              <p className="rounded-md border bg-muted/30 p-3 text-sm leading-relaxed text-foreground">
                {item.answer}
              </p>
            </Section>
          )}
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
      <p className={`break-all text-sm text-foreground ${mono ? "tabular-nums" : ""}`}>
        {value}
      </p>
    </div>
  );
}
