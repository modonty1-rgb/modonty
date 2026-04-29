"use client";

import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import { ar } from "@/lib/ar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  UserX,
  UserCheck,
  Trash2,
  Download,
  Shield,
  ShieldOff,
  Search as SearchIcon,
  Mail,
  Users as UsersIcon,
  Loader2,
} from "lucide-react";
import { SubscriberWithDetails } from "../helpers/subscriber-queries";
import {
  unsubscribeUser,
  resubscribeUser,
  deleteSubscriber,
  exportSubscribers,
  bulkUnsubscribeAction,
  bulkDeleteAction,
} from "../actions/subscriber-actions";

interface Props {
  subscribers: SubscriberWithDetails[];
}

type FilterKey = "all" | "active" | "unsubscribed" | "consent";

const PAGE_LIMIT = 200;

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

export function SubscribersTable({ subscribers }: Props) {
  const s = ar.subscribers;
  const [filter, setFilter] = useState<FilterKey>("all");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [openSubscriber, setOpenSubscriber] = useState<SubscriberWithDetails | null>(null);
  const [isPending, startTransition] = useTransition();
  const [exporting, setExporting] = useState(false);

  const filtered = useMemo(() => {
    let result = subscribers;
    if (filter === "active") result = result.filter((x) => x.subscribed);
    else if (filter === "unsubscribed") result = result.filter((x) => !x.subscribed);
    else if (filter === "consent") result = result.filter((x) => x.consentGiven);

    if (query.trim()) {
      const q = query.trim().toLowerCase();
      result = result.filter(
        (x) =>
          x.email.toLowerCase().includes(q) ||
          (x.name ?? "").toLowerCase().includes(q)
      );
    }
    return result;
  }, [subscribers, filter, query]);

  const counts = useMemo(
    () => ({
      all: subscribers.length,
      active: subscribers.filter((x) => x.subscribed).length,
      unsubscribed: subscribers.filter((x) => !x.subscribed).length,
      consent: subscribers.filter((x) => x.consentGiven).length,
    }),
    [subscribers]
  );

  const allFilteredSelected =
    filtered.length > 0 && filtered.every((x) => selected.has(x.id));
  const someFilteredSelected = filtered.some((x) => selected.has(x.id));
  const indeterminate = someFilteredSelected && !allFilteredSelected;

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

  function clearSelection() {
    setSelected(new Set());
  }

  // ─── Confirm helper using sonner ─────────────────────────────────
  function confirmThen(message: string, onConfirm: () => void) {
    toast(message, {
      duration: 8000,
      action: { label: s.confirmYes, onClick: onConfirm },
      cancel: { label: s.cancel, onClick: () => {} },
    });
  }

  // ─── Single-row actions ──────────────────────────────────────────
  function handleUnsubscribe(id: string) {
    confirmThen(s.confirmUnsubscribeOne, () => {
      startTransition(async () => {
        const res = await unsubscribeUser(id);
        if (res.success) toast.success(s.unsubscribed_toast);
        else toast.error(res.error || s.unsubscribeFailed);
      });
    });
  }

  function handleResubscribe(id: string) {
    startTransition(async () => {
      const res = await resubscribeUser(id);
      if (res.success) toast.success(s.resubscribed_toast);
      else toast.error(res.error || s.resubscribeFailed);
    });
  }

  function handleDelete(id: string) {
    confirmThen(s.confirmDeleteOne, () => {
      startTransition(async () => {
        const res = await deleteSubscriber(id);
        if (res.success) {
          toast.success(s.deleted_toast);
          setSelected((prev) => {
            const next = new Set(prev);
            next.delete(id);
            return next;
          });
        } else toast.error(res.error || s.deleteFailed);
      });
    });
  }

  // ─── Bulk actions ────────────────────────────────────────────────
  function handleBulkUnsubscribe() {
    const ids = Array.from(selected);
    confirmThen(
      s.confirmBulkUnsubscribe.replace("{n}", String(ids.length)),
      () => {
        startTransition(async () => {
          const res = await bulkUnsubscribeAction(ids);
          if (res.success) {
            toast.success(s.bulkUnsubscribed_toast.replace("{n}", String(res.count)));
            clearSelection();
          } else toast.error(res.error || s.bulkFailed);
        });
      }
    );
  }

  function handleBulkDelete() {
    const ids = Array.from(selected);
    confirmThen(s.confirmBulkDelete.replace("{n}", String(ids.length)), () => {
      startTransition(async () => {
        const res = await bulkDeleteAction(ids);
        if (res.success) {
          toast.success(s.bulkDeleted_toast.replace("{n}", String(res.count)));
          clearSelection();
        } else toast.error(res.error || s.bulkFailed);
      });
    });
  }

  // ─── Export ──────────────────────────────────────────────────────
  async function handleExport() {
    setExporting(true);
    const res = await exportSubscribers();
    if (res.success && res.data) {
      const blob = new Blob([res.data], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `subscribers-${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success(s.exported_toast);
    } else {
      toast.error((res as { error?: string }).error || s.exportFailed);
    }
    setExporting(false);
  }

  const showPagedHint = subscribers.length >= PAGE_LIMIT;

  return (
    <>
      <Card className="shadow-sm">
        <CardContent className="space-y-4 p-6">
          {/* Toolbar: search + filters + export */}
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
                active={filter === "active"}
                onClick={() => setFilter("active")}
                label={s.active}
                count={counts.active}
              />
              <FilterPill
                active={filter === "unsubscribed"}
                onClick={() => setFilter("unsubscribed")}
                label={s.unsubscribed}
                count={counts.unsubscribed}
              />
              <FilterPill
                active={filter === "consent"}
                onClick={() => setFilter("consent")}
                label={s.withConsentOnly}
                count={counts.consent}
              />
              <Button
                size="sm"
                variant="outline"
                onClick={handleExport}
                disabled={exporting}
                className="gap-2"
              >
                <Download className="h-3.5 w-3.5" />
                {exporting ? s.exporting : s.exportCsv}
              </Button>
            </div>
          </div>

          {/* Bulk actions bar (visible only when something selected) */}
          {selected.size > 0 && (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-primary/30 bg-primary/5 px-4 py-2.5">
              <p className="text-sm font-medium text-foreground">
                {selected.size} {s.selected}
              </p>
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleBulkUnsubscribe}
                  disabled={isPending}
                  className="gap-1.5"
                >
                  <UserX className="h-3.5 w-3.5" />
                  {s.bulkUnsubscribe}
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
                <Button size="sm" variant="ghost" onClick={clearSelection}>
                  {s.clearSelection}
                </Button>
              </div>
            </div>
          )}

          {/* Showing-paged hint */}
          {showPagedHint && (
            <p className="text-xs text-muted-foreground">
              {s.showingPagedHint.replace("{n}", String(PAGE_LIMIT))}
            </p>
          )}

          {/* Body */}
          {filtered.length === 0 ? (
            <EmptyState
              hasSubscribers={subscribers.length > 0}
              hasQuery={!!query.trim()}
              hasFilter={filter !== "all"}
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-start text-muted-foreground">
                    <th className="w-10 px-2 py-3">
                      <Checkbox
                        checked={
                          allFilteredSelected
                            ? true
                            : indeterminate
                              ? "indeterminate"
                              : false
                        }
                        onCheckedChange={(c) => toggleAllFiltered(c === true)}
                        aria-label={s.selectAll}
                      />
                    </th>
                    <th className="text-start py-3 px-2 font-medium">{s.email}</th>
                    <th className="text-start py-3 px-2 font-medium">{s.name}</th>
                    <th className="text-start py-3 px-2 font-medium">{s.status}</th>
                    <th className="text-start py-3 px-2 font-medium">{s.consent}</th>
                    <th className="text-start py-3 px-2 font-medium">{s.subscribedAt}</th>
                    <th className="text-end py-3 px-2 font-medium">{s.actions}</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((sub) => (
                    <tr
                      key={sub.id}
                      className={`border-b border-border last:border-0 transition-colors ${
                        selected.has(sub.id) ? "bg-primary/5" : "hover:bg-muted/50"
                      }`}
                    >
                      <td className="px-2 py-3">
                        <Checkbox
                          checked={selected.has(sub.id)}
                          onCheckedChange={(c) => toggleOne(sub.id, c === true)}
                          aria-label={sub.email}
                        />
                      </td>
                      <td className="px-2 py-3">
                        <button
                          type="button"
                          onClick={() => setOpenSubscriber(sub)}
                          className="text-start text-foreground hover:text-primary hover:underline"
                        >
                          {sub.email}
                        </button>
                      </td>
                      <td className="px-2 py-3 text-foreground">
                        {sub.name ?? "—"}
                      </td>
                      <td className="px-2 py-3">
                        <StatusBadge subscribed={sub.subscribed} />
                      </td>
                      <td className="px-2 py-3">
                        <ConsentBadge consentGiven={sub.consentGiven} />
                      </td>
                      <td className="px-2 py-3 text-xs text-muted-foreground tabular-nums">
                        {formatDate(sub.subscribedAt)}
                      </td>
                      <td className="px-2 py-3">
                        <div className="flex justify-end gap-1">
                          {sub.subscribed ? (
                            <IconButton
                              icon={UserX}
                              label={s.actionUnsubscribe}
                              onClick={() => handleUnsubscribe(sub.id)}
                              disabled={isPending}
                            />
                          ) : (
                            <IconButton
                              icon={UserCheck}
                              label={s.actionResubscribe}
                              onClick={() => handleResubscribe(sub.id)}
                              disabled={isPending}
                              tone="primary"
                            />
                          )}
                          <span className="mx-0.5 inline-block h-5 w-px bg-border" />
                          <IconButton
                            icon={Trash2}
                            label={s.actionDelete}
                            onClick={() => handleDelete(sub.id)}
                            disabled={isPending}
                            tone="destructive"
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <SubscriberDetailSheet
        subscriber={openSubscriber}
        onClose={() => setOpenSubscriber(null)}
        onUnsubscribe={(id) => {
          setOpenSubscriber(null);
          handleUnsubscribe(id);
        }}
        onResubscribe={(id) => {
          setOpenSubscriber(null);
          handleResubscribe(id);
        }}
        onDelete={(id) => {
          setOpenSubscriber(null);
          handleDelete(id);
        }}
        isPending={isPending}
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
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  count: number;
}) {
  return (
    <Button
      variant={active ? "default" : "outline"}
      size="sm"
      onClick={onClick}
      className="gap-2"
    >
      {label}
      <span
        className={`inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full px-1.5 text-[11px] font-bold tabular-nums ${
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

function StatusBadge({ subscribed }: { subscribed: boolean }) {
  const s = ar.subscribers;
  if (subscribed) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700 ring-1 ring-emerald-200">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
        {s.active}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600 ring-1 ring-slate-200">
      <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
      {s.unsubscribed}
    </span>
  );
}

function ConsentBadge({ consentGiven }: { consentGiven: boolean }) {
  const s = ar.subscribers;
  if (consentGiven) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs text-emerald-700">
        <Shield className="h-3.5 w-3.5" />
        {s.yesConsent}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
      <ShieldOff className="h-3.5 w-3.5" />
      {s.noConsent}
    </span>
  );
}

function IconButton({
  icon: Icon,
  label,
  onClick,
  disabled,
  tone = "default",
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  tone?: "default" | "primary" | "destructive";
}) {
  const toneClass =
    tone === "destructive"
      ? "text-destructive hover:text-destructive hover:bg-destructive/10"
      : tone === "primary"
        ? "text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50"
        : "";
  return (
    <Button
      size="icon"
      variant="ghost"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={`h-8 w-8 ${toneClass}`}
    >
      <Icon className="h-4 w-4" />
    </Button>
  );
}

function EmptyState({
  hasSubscribers,
  hasQuery,
  hasFilter,
}: {
  hasSubscribers: boolean;
  hasQuery: boolean;
  hasFilter: boolean;
}) {
  const s = ar.subscribers;
  // No subscribers at all
  if (!hasSubscribers) {
    return (
      <div className="py-16 text-center">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-primary/10">
          <Mail className="h-8 w-8 text-primary" />
        </div>
        <h3 className="mt-4 text-base font-semibold text-foreground">
          {s.noSubscribers}
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">{s.noSubscribersHint}</p>
      </div>
    );
  }
  // Search returned nothing
  if (hasQuery) {
    return (
      <div className="py-12 text-center">
        <SearchIcon className="mx-auto h-10 w-10 text-muted-foreground" />
        <p className="mt-3 text-sm font-medium">{s.noSearchResults}</p>
        <p className="mt-1 text-xs text-muted-foreground">{s.noSearchHint}</p>
      </div>
    );
  }
  // Filter returned nothing
  if (hasFilter) {
    return (
      <div className="py-12 text-center">
        <UsersIcon className="mx-auto h-10 w-10 text-muted-foreground" />
        <p className="mt-3 text-sm font-medium">{s.noFilterResults}</p>
      </div>
    );
  }
  return null;
}

// ─── Detail Sheet ────────────────────────────────────────────────────

function SubscriberDetailSheet({
  subscriber,
  onClose,
  onUnsubscribe,
  onResubscribe,
  onDelete,
  isPending,
}: {
  subscriber: SubscriberWithDetails | null;
  onClose: () => void;
  onUnsubscribe: (id: string) => void;
  onResubscribe: (id: string) => void;
  onDelete: (id: string) => void;
  isPending: boolean;
}) {
  const s = ar.subscribers;
  if (!subscriber) return null;

  return (
    <Sheet open={!!subscriber} onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="left" className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>{s.detailsTitle}</SheetTitle>
          <SheetDescription className="break-all text-foreground/90">
            {subscriber.email}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Identity */}
          <Section title={s.contactInfo}>
            <Field label={s.email} value={subscriber.email} mono />
            {subscriber.name && <Field label={s.name} value={subscriber.name} />}
          </Section>

          {/* Status + consent */}
          <Section title={s.consentInfo}>
            <div className="flex items-center gap-2">
              <StatusBadge subscribed={subscriber.subscribed} />
              <ConsentBadge consentGiven={subscriber.consentGiven} />
            </div>
            {subscriber.consentGiven && subscriber.consentDate && (
              <Field
                label={s.consentGivenAt}
                value={formatDateTime(subscriber.consentDate)}
                mono
              />
            )}
          </Section>

          {/* Timeline */}
          <Section title={s.timeline}>
            <Field
              label={s.subscribedSince}
              value={formatDateTime(subscriber.subscribedAt)}
              mono
            />
            {subscriber.unsubscribedAt && (
              <Field
                label={s.unsubscribedAt}
                value={formatDateTime(subscriber.unsubscribedAt)}
                mono
              />
            )}
          </Section>

          {/* Preferences */}
          <Section title={s.preferencesLabel}>
            {subscriber.preferences ? (
              <pre className="overflow-auto rounded-md border bg-muted/40 p-3 text-xs leading-relaxed">
                {JSON.stringify(subscriber.preferences, null, 2)}
              </pre>
            ) : (
              <p className="text-sm text-muted-foreground">{s.noPreferences}</p>
            )}
          </Section>

          {/* Actions */}
          <div className="flex flex-wrap gap-2 border-t pt-4">
            {subscriber.subscribed ? (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onUnsubscribe(subscriber.id)}
                disabled={isPending}
                className="gap-2"
              >
                {isPending ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <UserX className="h-3.5 w-3.5" />
                )}
                {s.actionUnsubscribe}
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={() => onResubscribe(subscriber.id)}
                disabled={isPending}
                className="gap-2 bg-emerald-600 hover:bg-emerald-700"
              >
                <UserCheck className="h-3.5 w-3.5" />
                {s.actionResubscribe}
              </Button>
            )}
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onDelete(subscriber.id)}
              disabled={isPending}
              className="gap-2 text-destructive hover:bg-destructive/10 hover:text-destructive"
            >
              <Trash2 className="h-3.5 w-3.5" />
              {s.actionDelete}
            </Button>
          </div>
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
