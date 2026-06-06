"use client";

import { useMemo, useState, useTransition } from "react";
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
  CalendarClock,
  PhoneCall,
  CheckCheck,
  Archive,
  Trash2,
  Search as SearchIcon,
  RotateCcw,
  Inbox,
  Phone,
  Mail,
  MessageSquare,
} from "lucide-react";
import type { BookingWithDetails, BookingStatus } from "../helpers/booking-queries";
import {
  updateBookingStatus,
  deleteBooking,
  bulkUpdateBookings,
  bulkDeleteBookings,
} from "../actions/booking-actions";

interface Props {
  bookings: BookingWithDetails[];
}

type FilterKey = "all" | BookingStatus;

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

function waNumber(phone: string): string {
  return phone.replace(/\D/g, "");
}

function sourceLabel(source: string): string {
  const m = ar.bookings.sourceMap as Record<string, string>;
  return m[source] ?? source;
}

function statusMeta(status: string) {
  const s = ar.bookings.statusBadge;
  if (status === "new") return { label: s.new, classes: "bg-primary/10 text-primary ring-primary/30" };
  if (status === "contacted") return { label: s.contacted, classes: "bg-amber-50 text-amber-700 ring-amber-200" };
  if (status === "done") return { label: s.done, classes: "bg-emerald-50 text-emerald-700 ring-emerald-200" };
  return { label: s.archived, classes: "bg-slate-100 text-slate-600 ring-slate-200" };
}

export function BookingsList({ bookings }: Props) {
  const s = ar.bookings;
  const [filter, setFilter] = useState<FilterKey>("all");
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState<BookingWithDetails | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [actionId, setActionId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const filtered = useMemo(() => {
    let result = bookings;
    if (filter !== "all") result = result.filter((b) => b.status === filter);
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      result = result.filter(
        (b) =>
          b.name.toLowerCase().includes(q) ||
          b.email.toLowerCase().includes(q) ||
          b.phone.toLowerCase().includes(q) ||
          (b.message?.toLowerCase().includes(q) ?? false) ||
          (b.article?.title.toLowerCase().includes(q) ?? false)
      );
    }
    return result;
  }, [bookings, filter, query]);

  const counts = useMemo(
    () => ({
      all: bookings.length,
      new: bookings.filter((b) => b.status === "new").length,
      contacted: bookings.filter((b) => b.status === "contacted").length,
      done: bookings.filter((b) => b.status === "done").length,
      archived: bookings.filter((b) => b.status === "archived").length,
    }),
    [bookings]
  );

  const allFilteredSelected = filtered.length > 0 && filtered.every((b) => selected.has(b.id));
  const someSelected = filtered.some((b) => selected.has(b.id));
  const indeterminate = someSelected && !allFilteredSelected;

  function toggleAllFiltered(checked: boolean) {
    setSelected((prev) => {
      const next = new Set(prev);
      filtered.forEach((b) => (checked ? next.add(b.id) : next.delete(b.id)));
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
      action: { label: s.confirm, onClick: onConfirm },
      cancel: { label: s.cancel, onClick: () => {} },
    });
  }

  function handleStatusChange(id: string, status: BookingStatus) {
    setActionId(id);
    startTransition(async () => {
      const res = await updateBookingStatus(id, status);
      if (res.success) toast.success(s.updateSuccess);
      else toast.error(res.error || s.updateFailed);
      setActionId(null);
    });
  }

  function handleDelete(id: string) {
    confirmThen(s.deleteConfirm, () => {
      setActionId(id);
      startTransition(async () => {
        const res = await deleteBooking(id);
        if (res.success) {
          toast.success(s.deleteSuccess);
          setSelected((prev) => {
            const next = new Set(prev);
            next.delete(id);
            return next;
          });
          if (open?.id === id) setOpen(null);
        } else toast.error(res.error || s.deleteFailed);
        setActionId(null);
      });
    });
  }

  function handleBulkStatus(status: BookingStatus) {
    const ids = Array.from(selected);
    if (ids.length === 0) return;
    startTransition(async () => {
      const res = await bulkUpdateBookings(ids, status);
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
        const res = await bulkDeleteBookings(ids);
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
              <FilterPill active={filter === "all"} onClick={() => setFilter("all")} label={s.all} count={counts.all} />
              <FilterPill active={filter === "new"} onClick={() => setFilter("new")} label={s.new} count={counts.new} tone="primary" />
              <FilterPill active={filter === "contacted"} onClick={() => setFilter("contacted")} label={s.contacted} count={counts.contacted} tone="amber" />
              <FilterPill active={filter === "done"} onClick={() => setFilter("done")} label={s.done} count={counts.done} tone="emerald" />
              <FilterPill active={filter === "archived"} onClick={() => setFilter("archived")} label={s.archived} count={counts.archived} tone="slate" />
            </div>
          </div>

          {/* Bulk action bar */}
          {selected.size > 0 && (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-primary/30 bg-primary/5 px-4 py-2.5">
              <p className="text-sm font-medium text-foreground">{selected.size} {s.selected}</p>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="outline" onClick={() => handleBulkStatus("contacted")} disabled={isPending} className="gap-1.5">
                  <PhoneCall className="h-3.5 w-3.5" />
                  {s.bulkContacted}
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleBulkStatus("archived")} disabled={isPending} className="gap-1.5">
                  <Archive className="h-3.5 w-3.5" />
                  {s.bulkArchive}
                </Button>
                <Button size="sm" variant="outline" onClick={handleBulkDelete} disabled={isPending} className="gap-1.5 text-destructive hover:text-destructive">
                  <Trash2 className="h-3.5 w-3.5" />
                  {s.bulkDelete}
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setSelected(new Set())}>{s.clearSelection}</Button>
              </div>
            </div>
          )}

          {/* Select-all header */}
          {filtered.length > 0 && (
            <div className="flex items-center justify-between border-b pb-2">
              <label className="flex items-center gap-2 text-xs text-muted-foreground">
                <Checkbox
                  checked={allFilteredSelected ? true : indeterminate ? "indeterminate" : false}
                  onCheckedChange={(v) => toggleAllFiltered(v === true)}
                  aria-label={s.selectAll}
                />
                {s.showing} {filtered.length} {s.of} {bookings.length}
              </label>
            </div>
          )}

          {/* Body */}
          {filtered.length === 0 ? (
            <EmptyState hasBookings={bookings.length > 0} hasQuery={!!query.trim()} hasFilter={filter !== "all"} />
          ) : (
            <div className="space-y-3">
              {filtered.map((booking) => (
                <BookingRow
                  key={booking.id}
                  booking={booking}
                  selected={selected.has(booking.id)}
                  toggleSelect={(v) => toggleOne(booking.id, v)}
                  onOpenDetails={() => {
                    setOpen(booking);
                    if (booking.status === "new") handleStatusChange(booking.id, "contacted");
                  }}
                  isWorking={isPending && actionId === booking.id}
                  onMarkContacted={() => handleStatusChange(booking.id, "contacted")}
                  onMarkDone={() => handleStatusChange(booking.id, "done")}
                  onArchive={() => handleStatusChange(booking.id, "archived")}
                  onRestoreNew={() => handleStatusChange(booking.id, "new")}
                  onDelete={() => handleDelete(booking.id)}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <BookingDetailSheet booking={open} onClose={() => setOpen(null)} />
    </>
  );
}

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
    <Button variant={active ? "default" : "outline"} size="sm" onClick={onClick} className={`gap-2 whitespace-nowrap ${accent}`}>
      {label}
      <span
        className={`inline-flex h-5 min-w-[1.25rem] shrink-0 items-center justify-center rounded-full px-1.5 text-[11px] font-bold tabular-nums ${
          active ? "bg-background/20 text-primary-foreground" : "bg-muted text-muted-foreground"
        }`}
      >
        {count}
      </span>
    </Button>
  );
}

function BookingRow({
  booking,
  selected,
  toggleSelect,
  onOpenDetails,
  isWorking,
  onMarkContacted,
  onMarkDone,
  onArchive,
  onRestoreNew,
  onDelete,
}: {
  booking: BookingWithDetails;
  selected: boolean;
  toggleSelect: (v: boolean) => void;
  onOpenDetails: () => void;
  isWorking: boolean;
  onMarkContacted: () => void;
  onMarkDone: () => void;
  onArchive: () => void;
  onRestoreNew: () => void;
  onDelete: () => void;
}) {
  const s = ar.bookings;
  const status = statusMeta(booking.status);
  const isNew = booking.status === "new";
  const isArchived = booking.status === "archived";
  const borderClass = isNew
    ? "border-primary/30"
    : booking.status === "contacted"
      ? "border-amber-200"
      : booking.status === "done"
        ? "border-emerald-200"
        : "border-slate-200";

  return (
    <div className={cn("rounded-lg border bg-card p-4 transition-colors", selected ? "ring-2 ring-primary/40 bg-primary/5" : borderClass)}>
      <div className="flex items-start gap-3">
        <Checkbox checked={selected} onCheckedChange={(v) => toggleSelect(v === true)} aria-label={booking.name} className="mt-1" />
        <CalendarClock className={cn("h-9 w-9 shrink-0 rounded-md p-2", isNew ? "bg-primary/10 text-primary" : "text-muted-foreground")} />
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ${status.classes}`}>{status.label}</span>
            <span className={`text-sm font-medium text-foreground ${isNew ? "font-semibold" : ""}`}>{booking.name || "—"}</span>
            <span className="text-[11px] text-muted-foreground tabular-nums" dir="ltr">· {booking.phone}</span>
          </div>

          <button type="button" onClick={onOpenDetails} className="block w-full text-start">
            <p className="text-xs text-muted-foreground">
              {sourceLabel(booking.source)}
              {booking.article?.title ? ` · ${booking.article.title}` : ""}
            </p>
            {booking.message && <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{booking.message}</p>}
          </button>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            <span className="text-[11px] text-muted-foreground tabular-nums">{formatDateTime(booking.createdAt)}</span>
            <div className="flex flex-wrap gap-1.5">
              {isArchived ? (
                <Button size="sm" variant="outline" onClick={onRestoreNew} disabled={isWorking} className="gap-1.5">
                  <RotateCcw className="h-3.5 w-3.5" />
                  {s.restoreNew}
                </Button>
              ) : (
                <>
                  {booking.status !== "contacted" && booking.status !== "done" && (
                    <Button size="sm" variant="outline" onClick={onMarkContacted} disabled={isWorking} className="gap-1.5 border-amber-200 text-amber-700 hover:bg-amber-50">
                      <PhoneCall className="h-3.5 w-3.5" />
                      {s.markContacted}
                    </Button>
                  )}
                  {booking.status !== "done" && (
                    <Button size="sm" variant="outline" onClick={onMarkDone} disabled={isWorking} className="gap-1.5 border-emerald-200 text-emerald-700 hover:bg-emerald-50">
                      <CheckCheck className="h-3.5 w-3.5" />
                      {s.markDone}
                    </Button>
                  )}
                  <Button size="sm" variant="outline" onClick={onArchive} disabled={isWorking} className="gap-1.5">
                    <Archive className="h-3.5 w-3.5" />
                    {s.markArchived}
                  </Button>
                </>
              )}
              <Button size="icon" variant="ghost" onClick={onDelete} disabled={isWorking} title={s.delete} aria-label={s.delete} className="h-8 w-8 text-destructive hover:bg-destructive/10">
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function EmptyState({ hasBookings, hasQuery, hasFilter }: { hasBookings: boolean; hasQuery: boolean; hasFilter: boolean }) {
  const s = ar.bookings;
  if (!hasBookings) {
    return (
      <div className="py-16 text-center">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-primary/10">
          <Inbox className="h-8 w-8 text-primary" />
        </div>
        <h3 className="mt-4 text-base font-semibold text-foreground">{s.noBookings}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{s.emptyHint}</p>
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
        <p className="mt-3 text-sm font-medium">{s.noBookingsFiltered}</p>
      </div>
    );
  }
  return null;
}

function BookingDetailSheet({ booking, onClose }: { booking: BookingWithDetails | null; onClose: () => void }) {
  const s = ar.bookings;
  if (!booking) return null;

  return (
    <Sheet open={!!booking} onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="left" className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{s.details}</SheetTitle>
          <SheetDescription className="text-foreground/90">{booking.name}</SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-5">
          <Section title={s.contactSection}>
            <Field label={s.phone} value={booking.phone} mono />
            <Field label={s.email} value={booking.email} mono />
            <div className="flex flex-wrap gap-2 pt-1">
              <Button asChild size="sm" className="gap-2 bg-[#25D366] text-white hover:bg-[#25D366]/90">
                <a href={`https://wa.me/${waNumber(booking.phone)}`} target="_blank" rel="noopener noreferrer">
                  <MessageSquare className="h-3.5 w-3.5" />
                  {s.whatsappBtn}
                </a>
              </Button>
              <Button asChild size="sm" variant="outline" className="gap-2">
                <a href={`tel:${booking.phone}`}>
                  <Phone className="h-3.5 w-3.5" />
                  {s.callBtn}
                </a>
              </Button>
              <Button asChild size="sm" variant="outline" className="gap-2">
                <a href={`mailto:${booking.email}`}>
                  <Mail className="h-3.5 w-3.5" />
                  {s.mailBtn}
                </a>
              </Button>
            </div>
          </Section>

          <Section title={s.preferredAt}>
            <p className="text-sm text-foreground tabular-nums">
              {booking.preferredAt ? formatDateTime(booking.preferredAt) : s.noPreferred}
            </p>
          </Section>

          <Section title={s.messageLabel}>
            <div className="rounded-md border bg-muted/30 p-3">
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
                {booking.message || s.noMessage}
              </p>
            </div>
          </Section>

          <Section title={s.sourceLabel}>
            <Field label={s.sourceLabel} value={sourceLabel(booking.source)} />
            {booking.article?.title && <Field label={s.articleLabel} value={booking.article.title} />}
          </Section>

          <Section title={s.timeline}>
            <Field label={s.createdAt} value={formatDateTime(booking.createdAt)} mono />
            {booking.ipAddress && <Field label={s.ipAddress} value={booking.ipAddress} mono />}
            {booking.userAgent && <Field label={s.userAgent} value={booking.userAgent} mono />}
          </Section>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-2">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{title}</h3>
      <div className="space-y-2">{children}</div>
    </section>
  );
}

function Field({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="space-y-0.5">
      <p className="text-[11px] text-muted-foreground">{label}</p>
      <p className={`break-all text-sm text-foreground ${mono ? "tabular-nums" : ""}`} dir={mono ? "ltr" : undefined}>
        {value}
      </p>
    </div>
  );
}
