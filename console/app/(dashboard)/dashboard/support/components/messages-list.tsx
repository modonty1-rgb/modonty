"use client";

import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import { ar } from "@/lib/ar";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Mail,
  MailOpen,
  CheckCheck,
  Archive,
  Trash2,
  Send,
  Search as SearchIcon,
  RotateCcw,
  Inbox,
  ExternalLink,
  UserCircle2,
} from "lucide-react";
import type {
  ContactMessageWithDetails,
  ContactStatus,
} from "../helpers/support-queries-enhanced";
import {
  updateMessageStatus,
  deleteMessage,
  bulkUpdateMessages,
  bulkDeleteMessages,
  sendReply,
} from "../actions/support-actions";

interface Props {
  messages: ContactMessageWithDetails[];
}

type FilterKey = "all" | ContactStatus;

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

function decodeReferrer(url: string): string {
  try {
    return decodeURIComponent(url);
  } catch {
    return url;
  }
}

function statusMeta(status: string) {
  const s = ar.support.statusBadge;
  if (status === "new") {
    return { label: s.new, classes: "bg-primary/10 text-primary ring-primary/30" };
  }
  if (status === "read") {
    return { label: s.read, classes: "bg-amber-50 text-amber-700 ring-amber-200" };
  }
  if (status === "replied") {
    return {
      label: s.replied,
      classes: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    };
  }
  return { label: s.archived, classes: "bg-slate-100 text-slate-600 ring-slate-200" };
}

export function MessagesList({ messages }: Props) {
  const s = ar.support;
  const [filter, setFilter] = useState<FilterKey>("all");
  const [query, setQuery] = useState("");
  const [openMessage, setOpenMessage] = useState<ContactMessageWithDetails | null>(
    null
  );
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [actionId, setActionId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const filtered = useMemo(() => {
    let result = messages;
    if (filter !== "all") result = result.filter((m) => m.status === filter);
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      result = result.filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          m.email.toLowerCase().includes(q) ||
          m.subject.toLowerCase().includes(q) ||
          m.message.toLowerCase().includes(q)
      );
    }
    return result;
  }, [messages, filter, query]);

  const counts = useMemo(
    () => ({
      all: messages.length,
      new: messages.filter((m) => m.status === "new").length,
      read: messages.filter((m) => m.status === "read").length,
      replied: messages.filter((m) => m.status === "replied").length,
      archived: messages.filter((m) => m.status === "archived").length,
    }),
    [messages]
  );

  const allFilteredSelected =
    filtered.length > 0 && filtered.every((m) => selected.has(m.id));
  const someSelected = filtered.some((m) => selected.has(m.id));
  const indeterminate = someSelected && !allFilteredSelected;

  function toggleAllFiltered(checked: boolean) {
    setSelected((prev) => {
      const next = new Set(prev);
      filtered.forEach((m) => (checked ? next.add(m.id) : next.delete(m.id)));
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
      action: { label: s.markReplied, onClick: onConfirm },
      cancel: { label: s.clearSelection, onClick: () => {} },
    });
  }

  function handleStatusChange(id: string, status: ContactStatus) {
    setActionId(id);
    startTransition(async () => {
      const res = await updateMessageStatus(id, status);
      if (res.success) toast.success(s.updateSuccess);
      else toast.error(res.error || s.updateFailed);
      setActionId(null);
    });
  }

  function handleDelete(id: string) {
    confirmThen(s.deleteConfirm, () => {
      setActionId(id);
      startTransition(async () => {
        const res = await deleteMessage(id);
        if (res.success) {
          toast.success(s.deleteSuccess);
          setSelected((prev) => {
            const next = new Set(prev);
            next.delete(id);
            return next;
          });
          if (openMessage?.id === id) setOpenMessage(null);
        } else toast.error(res.error || s.deleteFailed);
        setActionId(null);
      });
    });
  }

  function handleBulkStatus(status: ContactStatus) {
    const ids = Array.from(selected);
    if (ids.length === 0) return;
    startTransition(async () => {
      const res = await bulkUpdateMessages(ids, status);
      if (res.success) {
        toast.success(s.bulkUpdateSuccess);
        setSelected(new Set());
      } else toast.error(res.error || s.updateFailed);
    });
  }

  function handleBulkDelete() {
    const ids = Array.from(selected);
    if (ids.length === 0) return;
    confirmThen(s.bulkDeleteConfirm, () => {
      startTransition(async () => {
        const res = await bulkDeleteMessages(ids);
        if (res.success) {
          toast.success(s.bulkDeleteSuccess);
          setSelected(new Set());
        } else toast.error(res.error || s.deleteFailed);
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
                placeholder={s.searchPlaceholder}
                className="ps-9"
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <FilterPill
                active={filter === "all"}
                onClick={() => setFilter("all")}
                label={s.all}
                count={counts.all}
              />
              <FilterPill
                active={filter === "new"}
                onClick={() => setFilter("new")}
                label={s.new}
                count={counts.new}
                tone="primary"
              />
              <FilterPill
                active={filter === "read"}
                onClick={() => setFilter("read")}
                label={s.read}
                count={counts.read}
                tone="amber"
              />
              <FilterPill
                active={filter === "replied"}
                onClick={() => setFilter("replied")}
                label={s.replied}
                count={counts.replied}
                tone="emerald"
              />
              <FilterPill
                active={filter === "archived"}
                onClick={() => setFilter("archived")}
                label={s.archived}
                count={counts.archived}
                tone="slate"
              />
            </div>
          </div>

          {/* Bulk action bar */}
          {selected.size > 0 && (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-primary/30 bg-primary/5 px-4 py-2.5">
              <p className="text-sm font-medium text-foreground">
                {selected.size} {s.selected}
              </p>
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleBulkStatus("read")}
                  disabled={isPending}
                  className="gap-1.5"
                >
                  <MailOpen className="h-3.5 w-3.5" />
                  {s.bulkMarkRead}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleBulkStatus("archived")}
                  disabled={isPending}
                  className="gap-1.5"
                >
                  <Archive className="h-3.5 w-3.5" />
                  {s.bulkArchive}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleBulkDelete}
                  disabled={isPending}
                  className="gap-1.5 text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  {s.bulkDelete}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setSelected(new Set())}
                >
                  {s.clearSelection}
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
                  aria-label={s.selectAll}
                />
                {s.showing} {filtered.length} {s.of} {messages.length}
              </label>
            </div>
          )}

          {/* Body */}
          {filtered.length === 0 ? (
            <EmptyState
              hasMessages={messages.length > 0}
              hasQuery={!!query.trim()}
              hasFilter={filter !== "all"}
            />
          ) : (
            <div className="space-y-3">
              {filtered.map((message) => (
                <MessageRow
                  key={message.id}
                  message={message}
                  selected={selected.has(message.id)}
                  toggleSelect={(v) => toggleOne(message.id, v)}
                  onOpenDetails={() => {
                    setOpenMessage(message);
                    if (message.status === "new") {
                      handleStatusChange(message.id, "read");
                    }
                  }}
                  isWorking={isPending && actionId === message.id}
                  onMarkRead={() => handleStatusChange(message.id, "read")}
                  onMarkReplied={() => handleStatusChange(message.id, "replied")}
                  onArchive={() => handleStatusChange(message.id, "archived")}
                  onRestoreNew={() => handleStatusChange(message.id, "new")}
                  onDelete={() => handleDelete(message.id)}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <MessageDetailSheet
        message={openMessage}
        onClose={() => setOpenMessage(null)}
        onSent={() => setOpenMessage(null)}
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
  tone?: "primary" | "amber" | "emerald" | "slate";
}) {
  const accent =
    !active && tone
      ? {
          primary: "border-primary/30 text-primary",
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

function MessageRow({
  message,
  selected,
  toggleSelect,
  onOpenDetails,
  isWorking,
  onMarkRead,
  onMarkReplied,
  onArchive,
  onRestoreNew,
  onDelete,
}: {
  message: ContactMessageWithDetails;
  selected: boolean;
  toggleSelect: (v: boolean) => void;
  onOpenDetails: () => void;
  isWorking: boolean;
  onMarkRead: () => void;
  onMarkReplied: () => void;
  onArchive: () => void;
  onRestoreNew: () => void;
  onDelete: () => void;
}) {
  const status = statusMeta(message.status);
  const isNew = message.status === "new";
  const isArchived = message.status === "archived";

  const borderClass = isNew
    ? "border-primary/30"
    : message.status === "read"
      ? "border-amber-200"
      : message.status === "replied"
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
          onCheckedChange={(v) => toggleSelect(v === true)}
          aria-label={message.subject}
          className="mt-1"
        />
        {isNew ? (
          <Mail className="h-9 w-9 shrink-0 rounded-md bg-primary/10 p-2 text-primary" />
        ) : (
          <UserCircle2 className="h-9 w-9 shrink-0 text-muted-foreground" />
        )}
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ${status.classes}`}
            >
              {status.label}
            </span>
            <span
              className={`text-sm font-medium text-foreground ${
                isNew ? "font-semibold" : ""
              }`}
            >
              {message.name}
            </span>
            <span className="text-[11px] text-muted-foreground">
              · {message.email}
            </span>
          </div>

          <button
            type="button"
            onClick={onOpenDetails}
            className="block w-full text-start"
          >
            <p
              className={`text-sm text-foreground hover:text-primary ${
                isNew ? "font-semibold" : ""
              }`}
            >
              {message.subject}
            </p>
            <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
              {message.message}
            </p>
          </button>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            <span className="text-[11px] text-muted-foreground tabular-nums">
              {formatDateTime(message.createdAt)}
            </span>
            <RowActions
              isNew={isNew}
              isReplied={message.status === "replied"}
              isArchived={isArchived}
              isWorking={isWorking}
              onMarkRead={onMarkRead}
              onMarkReplied={onMarkReplied}
              onArchive={onArchive}
              onRestoreNew={onRestoreNew}
              onDelete={onDelete}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function RowActions({
  isNew,
  isReplied,
  isArchived,
  isWorking,
  onMarkRead,
  onMarkReplied,
  onArchive,
  onRestoreNew,
  onDelete,
}: {
  isNew: boolean;
  isReplied: boolean;
  isArchived: boolean;
  isWorking: boolean;
  onMarkRead: () => void;
  onMarkReplied: () => void;
  onArchive: () => void;
  onRestoreNew: () => void;
  onDelete: () => void;
}) {
  const s = ar.support;

  if (isArchived) {
    return (
      <div className="flex flex-wrap gap-1.5">
        <Button
          size="sm"
          variant="outline"
          onClick={onRestoreNew}
          disabled={isWorking}
          className="gap-1.5"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          {s.markNew}
        </Button>
        <Button
          size="icon"
          variant="ghost"
          onClick={onDelete}
          disabled={isWorking}
          title={s.delete}
          aria-label={s.delete}
          className="h-8 w-8 text-destructive hover:bg-destructive/10"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {isNew && (
        <Button
          size="sm"
          variant="outline"
          onClick={onMarkRead}
          disabled={isWorking}
          className="gap-1.5"
        >
          <MailOpen className="h-3.5 w-3.5" />
          {s.markRead}
        </Button>
      )}
      {!isReplied && (
        <Button
          size="sm"
          variant="outline"
          onClick={onMarkReplied}
          disabled={isWorking}
          className="gap-1.5 border-emerald-200 text-emerald-700 hover:bg-emerald-50"
        >
          <CheckCheck className="h-3.5 w-3.5" />
          {s.markReplied}
        </Button>
      )}
      <Button
        size="sm"
        variant="outline"
        onClick={onArchive}
        disabled={isWorking}
        className="gap-1.5"
      >
        <Archive className="h-3.5 w-3.5" />
        {s.markArchived}
      </Button>
      <Button
        size="icon"
        variant="ghost"
        onClick={onDelete}
        disabled={isWorking}
        title={s.delete}
        aria-label={s.delete}
        className="h-8 w-8 text-destructive hover:bg-destructive/10"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}

function EmptyState({
  hasMessages,
  hasQuery,
  hasFilter,
}: {
  hasMessages: boolean;
  hasQuery: boolean;
  hasFilter: boolean;
}) {
  const s = ar.support;
  if (!hasMessages) {
    return (
      <div className="py-16 text-center">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-primary/10">
          <Inbox className="h-8 w-8 text-primary" />
        </div>
        <h3 className="mt-4 text-base font-semibold text-foreground">
          {s.noMessagesFound}
        </h3>
      </div>
    );
  }
  if (hasQuery) {
    return (
      <div className="py-12 text-center">
        <SearchIcon className="mx-auto h-10 w-10 text-muted-foreground" />
        <p className="mt-3 text-sm font-medium">{s.noMatchSearch}</p>
      </div>
    );
  }
  if (hasFilter) {
    return (
      <div className="py-12 text-center">
        <Inbox className="mx-auto h-10 w-10 text-muted-foreground" />
        <p className="mt-3 text-sm font-medium">{s.noMessagesFound}</p>
      </div>
    );
  }
  return null;
}

// ─── Detail Sheet ────────────────────────────────────────────────────

function MessageDetailSheet({
  message,
  onClose,
  onSent,
}: {
  message: ContactMessageWithDetails | null;
  onClose: () => void;
  onSent: () => void;
}) {
  const s = ar.support;
  const [replyBody, setReplyBody] = useState("");
  const [replyViaEmail, setReplyViaEmail] = useState(true);
  const [sending, setSending] = useState(false);

  if (!message) return null;

  async function handleSend() {
    if (!message) return;
    const trimmed = replyBody.trim();
    if (!trimmed) return;
    setSending(true);
    const res = await sendReply(message.id, trimmed, replyViaEmail);
    setSending(false);
    if (res.success) {
      if (res.emailFailed) toast.warning(s.replySavedEmailFailed);
      else toast.success(s.replySuccess);
      setReplyBody("");
      onSent();
    } else {
      toast.error(res.error || s.replyFailed);
    }
  }

  return (
    <Sheet
      open={!!message}
      onOpenChange={(o) => {
        if (!o) {
          setReplyBody("");
          onClose();
        }
      }}
    >
      <SheetContent
        side="left"
        className="w-full sm:max-w-lg overflow-y-auto"
      >
        <SheetHeader>
          <SheetTitle>{s.messageDetails}</SheetTitle>
          <SheetDescription className="text-foreground/90">
            {message.subject}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-5">
          {/* Sender */}
          <Section title={s.from}>
            <Field label={s.from} value={message.name} />
            <Field label="Email" value={message.email} mono />
            <Button asChild size="sm" variant="outline" className="gap-2">
              <a href={`mailto:${message.email}`}>
                <Mail className="h-3.5 w-3.5" />
                {s.from}
                <ExternalLink className="h-3 w-3" />
              </a>
            </Button>
          </Section>

          {/* Message body */}
          <Section title={s.message}>
            <div className="rounded-md border bg-muted/30 p-3">
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
                {message.message}
              </p>
            </div>
          </Section>

          {/* Existing reply */}
          {message.replyBody && (
            <Section title={s.yourReply}>
              <div className="rounded-md border-s-2 border-emerald-300 bg-emerald-50/50 p-3">
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
                  {message.replyBody}
                </p>
              </div>
            </Section>
          )}

          {/* Reply form */}
          <Section title={s.reply}>
            <Textarea
              value={replyBody}
              onChange={(e) => setReplyBody(e.target.value)}
              placeholder={s.replyPlaceholder}
              rows={5}
              className="resize-none"
            />
            <div className="flex items-center gap-2">
              <Checkbox
                id="reply-via-email"
                checked={replyViaEmail}
                onCheckedChange={(v) => setReplyViaEmail(v === true)}
              />
              <Label
                htmlFor="reply-via-email"
                className="cursor-pointer text-sm font-normal"
              >
                {s.replyViaEmail}
              </Label>
            </div>
            <Button
              onClick={handleSend}
              disabled={sending || !replyBody.trim()}
              size="sm"
              className="gap-1.5"
            >
              <Send className="h-3.5 w-3.5" />
              {sending ? "…" : s.sendReply}
            </Button>
          </Section>

          {/* Timeline */}
          <Section title={s.metaSection}>
            <Field
              label={s.sentAt}
              value={formatDateTime(message.createdAt)}
              mono
            />
            {message.readAt && (
              <Field
                label={s.readAt}
                value={formatDateTime(message.readAt)}
                mono
              />
            )}
            {message.repliedAt && (
              <Field
                label={s.repliedAt}
                value={formatDateTime(message.repliedAt)}
                mono
              />
            )}
            {message.referrer && (
              <Field
                label={s.referrer}
                value={decodeReferrer(message.referrer)}
                mono
              />
            )}
            {message.ipAddress && (
              <Field label={s.ipAddress} value={message.ipAddress} mono />
            )}
            {message.userAgent && (
              <Field label={s.userAgent} value={message.userAgent} mono />
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
