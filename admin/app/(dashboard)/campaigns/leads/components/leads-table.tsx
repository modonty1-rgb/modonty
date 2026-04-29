"use client";

import { useMemo, useState, useTransition } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Megaphone,
  Sparkles,
  CheckCircle2,
  XCircle,
  Search as SearchIcon,
  ExternalLink,
  Mail,
  Phone,
  MessageCircle,
  Clock,
  Loader2,
} from "lucide-react";
import { CampaignInterestStatus, CampaignReach } from "@prisma/client";
import { CampaignLead, updateCampaignLeadStatusAction, appendCampaignLeadNoteAction } from "../actions/leads-actions";

interface Props {
  leads: CampaignLead[];
}

const STATUS_TABS: Array<{ key: "ALL" | CampaignInterestStatus; label: string }> = [
  { key: "ALL", label: "All" },
  { key: "NEW", label: "New" },
  { key: "CONTACTED", label: "Contacted" },
  { key: "CONVERTED", label: "Converted" },
  { key: "CANCELLED", label: "Cancelled" },
];

const REACH_LABELS: Record<CampaignReach, string> = {
  OWN: "Own subscribers",
  INDUSTRY: "Industry reach",
  FULL: "Full DB reach",
};

const REACH_TONE: Record<CampaignReach, string> = {
  OWN: "bg-emerald-50 text-emerald-700 border-emerald-200",
  INDUSTRY: "bg-primary/10 text-primary border-primary/20",
  FULL: "bg-violet-50 text-violet-700 border-violet-200",
};

const SOURCE_LABELS: Record<string, string> = {
  hero: "Hero CTA",
  "tier-own": "Tier — Own",
  "tier-industry": "Tier — Industry",
  "tier-full": "Tier — Full DB",
  "final-cta": "Final CTA",
};

function formatDate(d: Date | string | null) {
  if (!d) return "—";
  return new Intl.DateTimeFormat("en-GB", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(d));
}

function statusBadge(status: CampaignInterestStatus) {
  const map: Record<CampaignInterestStatus, { label: string; className: string }> = {
    NEW: { label: "New", className: "bg-primary/10 text-primary border-primary/20" },
    CONTACTED: { label: "Contacted", className: "bg-amber-50 text-amber-700 border-amber-200" },
    CONVERTED: { label: "Converted", className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    CANCELLED: { label: "Cancelled", className: "bg-slate-100 text-slate-600 border-slate-200" },
  };
  const cfg = map[status];
  return <Badge variant="outline" className={cfg.className}>{cfg.label}</Badge>;
}

function whatsappLink(phone: string | null, clientName: string) {
  if (!phone) return null;
  const cleaned = phone.replace(/[^\d+]/g, "");
  const text = encodeURIComponent(
    `مرحباً ${clientName}، شكراً لاهتمامك بحملات مودونتي البريدية. أتواصل معك من فريق الحملات لأناقش معك التفاصيل.`
  );
  return `https://wa.me/${cleaned}?text=${text}`;
}

export function LeadsTable({ leads }: Props) {
  const [tab, setTab] = useState<"ALL" | CampaignInterestStatus>("ALL");
  const [query, setQuery] = useState("");
  const [openLead, setOpenLead] = useState<CampaignLead | null>(null);

  const filtered = useMemo(() => {
    let result = leads;
    if (tab !== "ALL") result = result.filter((l) => l.status === tab);
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      result = result.filter(
        (l) =>
          l.clientName.toLowerCase().includes(q) ||
          (l.clientEmail ?? "").toLowerCase().includes(q) ||
          (l.clientPhone ?? "").includes(q)
      );
    }
    return result;
  }, [leads, tab, query]);

  return (
    <>
      <Card>
        <CardHeader className="space-y-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <CardTitle className="text-lg">Leads</CardTitle>
            <div className="relative max-w-xs">
              <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search client name / email / phone…"
                className="pl-9"
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {STATUS_TABS.map((t) => {
              const count =
                t.key === "ALL"
                  ? leads.length
                  : leads.filter((l) => l.status === t.key).length;
              return (
                <Button
                  key={t.key}
                  variant={tab === t.key ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTab(t.key)}
                  className="gap-2"
                >
                  {t.label}
                  <span
                    className={`inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full px-1.5 text-[11px] font-bold tabular-nums ${
                      tab === t.key
                        ? "bg-background/20 text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {count}
                  </span>
                </Button>
              );
            })}
          </div>
        </CardHeader>
        <CardContent>
          {filtered.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-muted-foreground">
                    <th className="px-2 py-3 font-medium">#</th>
                    <th className="px-2 py-3 font-medium">Client</th>
                    <th className="px-2 py-3 font-medium">Reach</th>
                    <th className="px-2 py-3 font-medium">Source</th>
                    <th className="px-2 py-3 font-medium">Status</th>
                    <th className="px-2 py-3 font-medium">Submitted</th>
                    <th className="px-2 py-3 text-end font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((l, i) => (
                    <tr
                      key={l.id}
                      className="border-b border-border last:border-0 hover:bg-muted/40"
                    >
                      <td className="px-2 py-3 text-muted-foreground tabular-nums">{i + 1}</td>
                      <td className="px-2 py-3">
                        <div>
                          <p className="font-medium text-foreground">{l.clientName}</p>
                          <p className="text-xs text-muted-foreground">
                            {l.clientEmail ?? l.clientPhone ?? l.clientSlug}
                          </p>
                        </div>
                      </td>
                      <td className="px-2 py-3">
                        <Badge variant="outline" className={REACH_TONE[l.reach]}>
                          {REACH_LABELS[l.reach]}
                        </Badge>
                      </td>
                      <td className="px-2 py-3 text-xs text-muted-foreground">
                        {l.source ? SOURCE_LABELS[l.source] ?? l.source : "—"}
                      </td>
                      <td className="px-2 py-3">{statusBadge(l.status)}</td>
                      <td className="px-2 py-3 text-xs text-muted-foreground tabular-nums">
                        {formatDate(l.createdAt)}
                      </td>
                      <td className="px-2 py-3 text-end">
                        <Button size="sm" variant="outline" onClick={() => setOpenLead(l)}>
                          Open
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <LeadDetailDialog
        lead={openLead}
        onClose={() => setOpenLead(null)}
      />
    </>
  );
}

function EmptyState() {
  return (
    <div className="py-12 text-center">
      <Megaphone className="mx-auto h-10 w-10 text-muted-foreground" />
      <p className="mt-3 text-sm font-medium">No leads yet.</p>
      <p className="mt-1 text-xs text-muted-foreground">
        Leads appear here as soon as a client clicks &quot;I&apos;m interested&quot; on the campaigns teaser.
      </p>
    </div>
  );
}

// ─── Detail dialog ──────────────────────────────────────────────────

function LeadDetailDialog({
  lead,
  onClose,
}: {
  lead: CampaignLead | null;
  onClose: () => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [note, setNote] = useState("");
  const [cancelReason, setCancelReason] = useState("");

  if (!lead) return null;

  const wa = whatsappLink(lead.clientPhone, lead.clientName);

  function setStatus(status: CampaignInterestStatus) {
    if (!lead) return;
    startTransition(async () => {
      await updateCampaignLeadStatusAction({
        id: lead.id,
        status,
        ...(status === "CANCELLED" && cancelReason.trim() ? { cancelReason } : {}),
      });
      onClose();
    });
  }

  function addNote() {
    if (!lead || !note.trim()) return;
    startTransition(async () => {
      await appendCampaignLeadNoteAction(lead.id, note);
      setNote("");
      onClose();
    });
  }

  return (
    <Dialog open={!!lead} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Megaphone className="h-5 w-5 text-primary" />
            {lead.clientName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          {/* Identity strip */}
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {lead.clientEmail && (
              <ContactPill icon={Mail} label={lead.clientEmail} href={`mailto:${lead.clientEmail}`} />
            )}
            {lead.clientPhone && (
              <ContactPill icon={Phone} label={lead.clientPhone} href={`tel:${lead.clientPhone}`} />
            )}
          </div>

          {/* Lead summary */}
          <div className="grid grid-cols-2 gap-3 rounded-lg border bg-muted/30 p-3">
            <Field label="Reach" value={REACH_LABELS[lead.reach]} />
            <Field label="Source" value={lead.source ? SOURCE_LABELS[lead.source] ?? lead.source : "—"} />
            <Field label="Submitted" value={formatDate(lead.createdAt)} />
            <Field label="Last update" value={formatDate(lead.updatedAt)} />
            {lead.contactedAt && (
              <Field label="Contacted" value={formatDate(lead.contactedAt)} />
            )}
            {lead.convertedAt && (
              <Field label="Converted" value={formatDate(lead.convertedAt)} />
            )}
            {lead.cancelledAt && (
              <Field label="Cancelled" value={formatDate(lead.cancelledAt)} />
            )}
          </div>

          {/* Status actions */}
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Move to status
            </p>
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant={lead.status === "NEW" ? "default" : "outline"}
                disabled={isPending || lead.status === "NEW"}
                onClick={() => setStatus("NEW")}
                className="gap-1.5"
              >
                <Sparkles className="h-3.5 w-3.5" />
                New
              </Button>
              <Button
                size="sm"
                variant={lead.status === "CONTACTED" ? "default" : "outline"}
                disabled={isPending || lead.status === "CONTACTED"}
                onClick={() => setStatus("CONTACTED")}
                className="gap-1.5"
              >
                <Clock className="h-3.5 w-3.5" />
                Contacted
              </Button>
              <Button
                size="sm"
                variant={lead.status === "CONVERTED" ? "default" : "outline"}
                disabled={isPending || lead.status === "CONVERTED"}
                onClick={() => setStatus("CONVERTED")}
                className="gap-1.5 bg-emerald-600 text-white hover:bg-emerald-700 disabled:bg-emerald-100 disabled:text-emerald-700"
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                Converted
              </Button>
              <Button
                size="sm"
                variant={lead.status === "CANCELLED" ? "default" : "outline"}
                disabled={isPending || lead.status === "CANCELLED"}
                onClick={() => setStatus("CANCELLED")}
                className="gap-1.5"
              >
                <XCircle className="h-3.5 w-3.5" />
                Cancelled
              </Button>
            </div>
            {lead.status !== "CANCELLED" && (
              <Input
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Optional cancel reason (only used if you click Cancelled)"
                className="text-xs"
              />
            )}
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Notes & history
            </p>
            {lead.notes ? (
              <pre className="max-h-48 overflow-auto rounded-lg border bg-muted/20 p-3 text-xs leading-relaxed whitespace-pre-wrap font-sans">
                {lead.notes}
              </pre>
            ) : (
              <p className="text-xs text-muted-foreground">No notes yet.</p>
            )}
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add a note (e.g., &quot;called, will decide tomorrow&quot;)"
              rows={2}
            />
            <Button
              size="sm"
              variant="outline"
              disabled={isPending || !note.trim()}
              onClick={addNote}
              className="gap-1.5"
            >
              {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
              Add note
            </Button>
          </div>
        </div>

        <DialogFooter className="flex flex-col gap-2 sm:flex-row sm:justify-between">
          {wa && (
            <Button asChild className="gap-2 bg-emerald-600 hover:bg-emerald-700">
              <a href={wa} target="_blank" rel="noopener noreferrer">
                <MessageCircle className="h-4 w-4" />
                WhatsApp
                <ExternalLink className="h-3 w-3" />
              </a>
            </Button>
          )}
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ContactPill({
  icon: Icon,
  label,
  href,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  href: string;
}) {
  return (
    <a
      href={href}
      className="inline-flex items-center gap-2 rounded-md border bg-card px-3 py-2 text-sm transition hover:bg-muted"
    >
      <Icon className="h-4 w-4 text-muted-foreground" />
      <span className="truncate">{label}</span>
    </a>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="text-sm font-medium text-foreground">{value}</p>
    </div>
  );
}
