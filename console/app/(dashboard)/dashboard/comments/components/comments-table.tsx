"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { ar } from "@/lib/ar";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Check,
  X,
  Trash2,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  Search as SearchIcon,
  Mail,
  ExternalLink,
  RotateCcw,
  UserCircle2,
  CornerDownLeft,
} from "lucide-react";
import type { CommentWithDetails } from "../helpers/comment-queries";
import { CommentStatus } from "@prisma/client";
import {
  approveComment,
  rejectComment,
  deleteComment,
  restoreCommentAction,
  bulkApproveComments,
  bulkRejectComments,
} from "../actions/comment-actions";

interface Props {
  comments: CommentWithDetails[];
}

type FilterKey = "all" | CommentStatus;

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

function statusMeta(status: CommentStatus) {
  const c = ar.comments;
  if (status === "PENDING") {
    return {
      label: c.pending,
      classes: "bg-amber-50 text-amber-700 ring-amber-200",
    };
  }
  if (status === "APPROVED") {
    return {
      label: c.approved,
      classes: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    };
  }
  if (status === "REJECTED") {
    return {
      label: c.rejected,
      classes: "bg-red-50 text-red-700 ring-red-200",
    };
  }
  return {
    label: c.deletedKpi,
    classes: "bg-slate-100 text-slate-600 ring-slate-200",
  };
}

export function CommentsTable({ comments }: Props) {
  const c = ar.comments;
  const [filter, setFilter] = useState<FilterKey>("all");
  const [query, setQuery] = useState("");
  const [openComment, setOpenComment] = useState<CommentWithDetails | null>(
    null
  );
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [actionId, setActionId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const filtered = useMemo(() => {
    let result = comments;
    if (filter !== "all") result = result.filter((co) => co.status === filter);
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      result = result.filter(
        (co) =>
          co.content.toLowerCase().includes(q) ||
          (co.author?.name ?? "").toLowerCase().includes(q) ||
          (co.author?.email ?? "").toLowerCase().includes(q) ||
          co.article.title.toLowerCase().includes(q)
      );
    }
    return result;
  }, [comments, filter, query]);

  const counts = useMemo(
    () => ({
      all: comments.length,
      PENDING: comments.filter((x) => x.status === "PENDING").length,
      APPROVED: comments.filter((x) => x.status === "APPROVED").length,
      REJECTED: comments.filter((x) => x.status === "REJECTED").length,
    }),
    [comments]
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

  function confirmThen(message: string, onConfirm: () => void) {
    toast(message, {
      duration: 8000,
      action: { label: c.confirmYes, onClick: onConfirm },
      cancel: { label: c.cancel, onClick: () => {} },
    });
  }

  function handleApprove(id: string) {
    setActionId(id);
    startTransition(async () => {
      const res = await approveComment(id);
      if (res.success) toast.success(c.approved_toast);
      else toast.error(res.error || c.approveFailed);
      setActionId(null);
    });
  }

  function handleReject(id: string) {
    setActionId(id);
    startTransition(async () => {
      const res = await rejectComment(id);
      if (res.success) toast.success(c.rejected_toast);
      else toast.error(res.error || c.rejectFailed);
      setActionId(null);
    });
  }

  function handleDelete(id: string) {
    confirmThen(c.confirmDeleteOne, () => {
      setActionId(id);
      startTransition(async () => {
        const res = await deleteComment(id);
        if (res.success) {
          toast.success(c.deleted_toast);
          setSelected((prev) => {
            const next = new Set(prev);
            next.delete(id);
            return next;
          });
        } else toast.error(res.error || c.deleteFailed);
        setActionId(null);
      });
    });
  }

  function handleRestore(id: string) {
    setActionId(id);
    startTransition(async () => {
      const res = await restoreCommentAction(id);
      if (res.success) toast.success(c.restored_toast);
      else toast.error(res.error || c.deleteFailed);
      setActionId(null);
    });
  }

  function handleBulkApprove() {
    const ids = Array.from(selected);
    startTransition(async () => {
      const res = await bulkApproveComments(ids);
      if (res.success) {
        toast.success(c.bulkApproved_toast.replace("{n}", String(res.count)));
        setSelected(new Set());
      } else toast.error(res.error || c.bulkApproveFailed);
    });
  }

  function handleBulkReject() {
    const ids = Array.from(selected);
    startTransition(async () => {
      const res = await bulkRejectComments(ids);
      if (res.success) {
        toast.success(c.bulkRejected_toast.replace("{n}", String(res.count)));
        setSelected(new Set());
      } else toast.error(res.error || c.bulkRejectFailed);
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
                placeholder={c.searchPlaceholder}
                className="ps-9"
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <FilterPill
                active={filter === "all"}
                onClick={() => setFilter("all")}
                label={c.all}
                count={counts.all}
              />
              <FilterPill
                active={filter === "PENDING"}
                onClick={() => setFilter("PENDING")}
                label={c.pending}
                count={counts.PENDING}
                tone="amber"
              />
              <FilterPill
                active={filter === "APPROVED"}
                onClick={() => setFilter("APPROVED")}
                label={c.approved}
                count={counts.APPROVED}
                tone="emerald"
              />
              <FilterPill
                active={filter === "REJECTED"}
                onClick={() => setFilter("REJECTED")}
                label={c.rejected}
                count={counts.REJECTED}
                tone="red"
              />
            </div>
          </div>

          {/* Bulk action bar */}
          {selected.size > 0 && (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-primary/30 bg-primary/5 px-4 py-2.5">
              <p className="text-sm font-medium text-foreground">
                {selected.size} {c.selected}
              </p>
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleBulkApprove}
                  disabled={isPending}
                  className="gap-1.5"
                >
                  <Check className="h-3.5 w-3.5" />
                  {c.approveSelected}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleBulkReject}
                  disabled={isPending}
                  className="gap-1.5 text-destructive hover:text-destructive"
                >
                  <X className="h-3.5 w-3.5" />
                  {c.rejectSelected}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setSelected(new Set())}
                >
                  {c.clearSelection}
                </Button>
              </div>
            </div>
          )}

          {/* Select-all + count header */}
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
                  onCheckedChange={(v) => toggleAllFiltered(v === true)}
                  aria-label={c.selectAll}
                />
                {filtered.length} {c.commentsCount}
              </label>
            </div>
          )}

          {/* Body */}
          {filtered.length === 0 ? (
            <EmptyState
              hasComments={comments.length > 0}
              hasQuery={!!query.trim()}
              hasFilter={filter !== "all"}
            />
          ) : (
            <div className="space-y-3">
              {filtered.map((comment) => (
                <CommentRow
                  key={comment.id}
                  comment={comment}
                  selected={selected.has(comment.id)}
                  toggleSelect={(v) => toggleOne(comment.id, v)}
                  onOpenDetails={() => setOpenComment(comment)}
                  isWorking={isPending && actionId === comment.id}
                  onApprove={() => handleApprove(comment.id)}
                  onReject={() => handleReject(comment.id)}
                  onDelete={() => handleDelete(comment.id)}
                  onRestore={() => handleRestore(comment.id)}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <CommentDetailSheet
        comment={openComment}
        onClose={() => setOpenComment(null)}
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

function CommentRow({
  comment,
  selected,
  toggleSelect,
  onOpenDetails,
  isWorking,
  onApprove,
  onReject,
  onDelete,
  onRestore,
}: {
  comment: CommentWithDetails;
  selected: boolean;
  toggleSelect: (v: boolean) => void;
  onOpenDetails: () => void;
  isWorking: boolean;
  onApprove: () => void;
  onReject: () => void;
  onDelete: () => void;
  onRestore: () => void;
}) {
  const c = ar.comments;
  const status = statusMeta(comment.status);
  const isPending = comment.status === "PENDING";
  const isApproved = comment.status === "APPROVED";
  const isRejected = comment.status === "REJECTED";
  const isDeleted = comment.status === "DELETED";

  const borderClass = isPending
    ? "border-amber-200"
    : isApproved
      ? "border-emerald-200"
      : isRejected
        ? "border-red-200"
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
          onCheckedChange={(v) => toggleSelect(v === true)}
          aria-label={comment.content.slice(0, 30)}
          className="mt-1"
        />
        <UserCircle2 className="h-9 w-9 shrink-0 text-muted-foreground" />
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ${status.classes}`}
            >
              {status.label}
            </span>
            {comment.isEdited && (
              <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                {c.editedBadge}
              </span>
            )}
            <span className="text-sm font-medium text-foreground">
              {comment.author?.name || c.anonymous}
            </span>
            {comment.author?.email && (
              <span className="text-[11px] text-muted-foreground">
                · {comment.author.email}
              </span>
            )}
          </div>

          {/* Article link */}
          <Link
            href={`/dashboard/articles/${comment.article.id}`}
            className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline"
          >
            {c.fromArticle}: {comment.article.title}
            <ExternalLink className="h-3 w-3" />
          </Link>

          {/* Comment content (clickable to open drawer) */}
          <button
            type="button"
            onClick={onOpenDetails}
            className="block w-full text-start text-sm leading-relaxed text-foreground hover:text-primary"
          >
            {comment.content}
          </button>

          {/* Parent reference */}
          {comment.parent && (
            <div className="rounded-md border-s-2 border-muted bg-muted/30 ps-3 pt-1">
              <p className="text-[10px] font-semibold uppercase text-muted-foreground">
                {c.replyTo}
              </p>
              <p className="line-clamp-1 text-xs italic text-muted-foreground">
                {comment.parent.content}
              </p>
            </div>
          )}

          {/* Footer: stats + actions */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            <div className="flex items-center gap-3 text-[11px] text-muted-foreground tabular-nums">
              <span className="flex items-center gap-1">
                <ThumbsUp className="h-3 w-3" />
                {comment._count.likes}
              </span>
              <span className="flex items-center gap-1">
                <ThumbsDown className="h-3 w-3" />
                {comment._count.dislikes}
              </span>
              <span className="flex items-center gap-1">
                <CornerDownLeft className="h-3 w-3" />
                {comment._count.replies}
              </span>
              <span>·</span>
              <span>{formatDateTime(comment.createdAt)}</span>
            </div>
            <RowActions
              isPending={isPending}
              isApproved={isApproved}
              isRejected={isRejected}
              isDeleted={isDeleted}
              isWorking={isWorking}
              onApprove={onApprove}
              onReject={onReject}
              onDelete={onDelete}
              onRestore={onRestore}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function RowActions({
  isPending,
  isApproved,
  isRejected,
  isDeleted,
  isWorking,
  onApprove,
  onReject,
  onDelete,
  onRestore,
}: {
  isPending: boolean;
  isApproved: boolean;
  isRejected: boolean;
  isDeleted: boolean;
  isWorking: boolean;
  onApprove: () => void;
  onReject: () => void;
  onDelete: () => void;
  onRestore: () => void;
}) {
  const c = ar.comments;

  if (isDeleted || isRejected) {
    return (
      <Button
        size="sm"
        variant="outline"
        onClick={onRestore}
        disabled={isWorking}
        className="gap-1.5"
      >
        <RotateCcw className="h-3.5 w-3.5" />
        {c.restoreComment}
      </Button>
    );
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {!isApproved && (
        <Button
          size="sm"
          onClick={onApprove}
          disabled={isWorking}
          className="gap-1.5 bg-emerald-600 text-white hover:bg-emerald-700"
        >
          <Check className="h-3.5 w-3.5" />
          {c.approveComment}
        </Button>
      )}
      {isPending && (
        <Button
          size="sm"
          variant="outline"
          onClick={onReject}
          disabled={isWorking}
          className="gap-1.5 border-destructive text-destructive hover:bg-destructive/10"
        >
          <X className="h-3.5 w-3.5" />
          {c.rejectComment}
        </Button>
      )}
      <Button
        size="icon"
        variant="ghost"
        onClick={onDelete}
        disabled={isWorking}
        title={c.deleteComment}
        aria-label={c.deleteComment}
        className="h-8 w-8 text-destructive hover:bg-destructive/10"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}

function EmptyState({
  hasComments,
  hasQuery,
  hasFilter,
}: {
  hasComments: boolean;
  hasQuery: boolean;
  hasFilter: boolean;
}) {
  const c = ar.comments;
  if (!hasComments) {
    return (
      <div className="py-16 text-center">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-primary/10">
          <MessageSquare className="h-8 w-8 text-primary" />
        </div>
        <h3 className="mt-4 text-base font-semibold text-foreground">
          {c.noCommentsFound}
        </h3>
        <p className="mt-1 max-w-sm mx-auto text-sm text-muted-foreground">
          {c.noCommentsHint}
        </p>
      </div>
    );
  }
  if (hasQuery) {
    return (
      <div className="py-12 text-center">
        <SearchIcon className="mx-auto h-10 w-10 text-muted-foreground" />
        <p className="mt-3 text-sm font-medium">{c.noSearchResults}</p>
      </div>
    );
  }
  if (hasFilter) {
    return (
      <div className="py-12 text-center">
        <MessageSquare className="mx-auto h-10 w-10 text-muted-foreground" />
        <p className="mt-3 text-sm font-medium">{c.noFilterResults}</p>
      </div>
    );
  }
  return null;
}

// ─── Detail Sheet ────────────────────────────────────────────────────

function CommentDetailSheet({
  comment,
  onClose,
}: {
  comment: CommentWithDetails | null;
  onClose: () => void;
}) {
  const c = ar.comments;
  if (!comment) return null;
  const email = comment.author?.email;

  return (
    <Sheet open={!!comment} onOpenChange={(o) => !o && onClose()}>
      <SheetContent
        side="left"
        className="w-full sm:max-w-md overflow-y-auto"
      >
        <SheetHeader>
          <SheetTitle>{c.detailsTitle}</SheetTitle>
          <SheetDescription className="text-foreground/90">
            {comment.author?.name || c.anonymous}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-5">
          {/* Author */}
          <Section title={c.authorSection}>
            <Field
              label={c.authorName}
              value={comment.author?.name || c.anonymous}
            />
            {email && <Field label={c.authorEmail} value={email} mono />}
            {email && (
              <Button asChild size="sm" variant="outline" className="gap-2">
                <a href={`mailto:${email}`}>
                  <Mail className="h-3.5 w-3.5" />
                  {c.contactCta}
                  <ExternalLink className="h-3 w-3" />
                </a>
              </Button>
            )}
          </Section>

          {/* Article */}
          <Section title={c.fromArticle}>
            <Button asChild size="sm" variant="outline" className="gap-2">
              <Link href={`/dashboard/articles/${comment.article.id}`}>
                {comment.article.title}
                <ExternalLink className="h-3 w-3" />
              </Link>
            </Button>
          </Section>

          {/* Comment content */}
          <Section title={c.commentSection}>
            <div className="rounded-md border bg-muted/30 p-3">
              <p className="text-sm leading-relaxed text-foreground">
                {comment.content}
              </p>
            </div>
          </Section>

          {/* Parent (if reply) */}
          {comment.parent && (
            <Section title={c.parentSection}>
              <div className="rounded-md border-s-2 border-muted bg-muted/30 ps-3">
                <p className="text-xs italic text-muted-foreground">
                  {comment.parent.content}
                </p>
              </div>
            </Section>
          )}

          {/* Stats */}
          <Section title={c.statsSection}>
            <div className="grid grid-cols-3 gap-3">
              <Mini
                icon={ThumbsUp}
                label={c.likesLabel}
                value={comment._count.likes}
              />
              <Mini
                icon={ThumbsDown}
                label={c.dislikesLabel}
                value={comment._count.dislikes}
              />
              <Mini
                icon={CornerDownLeft}
                label={c.repliesLabel}
                value={comment._count.replies}
              />
            </div>
          </Section>

          {/* Timeline */}
          <Section title={c.timelineSection}>
            <Field
              label={c.createdAt}
              value={formatDateTime(comment.createdAt)}
              mono
            />
            <Field
              label={c.updatedAt}
              value={formatDateTime(comment.updatedAt)}
              mono
            />
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

function Mini({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-lg border bg-card p-3 text-center">
      <Icon className="mx-auto h-4 w-4 text-muted-foreground" />
      <p className="mt-1 text-base font-bold tabular-nums text-foreground">
        {value}
      </p>
      <p className="text-[10px] text-muted-foreground">{label}</p>
    </div>
  );
}
