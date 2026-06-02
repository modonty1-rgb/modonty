"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Search, Inbox, UserPlus, CheckCircle2, ExternalLink, Mail, Phone, CalendarDays, Send, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import type { JbrseoSubscriberRow, WelcomeEmailStatus } from "../helpers/jbrseo-queries";
import { ConvertSubscriberDialog } from "../../clients/components/convert-subscriber-dialog";
import { sendClientWelcome } from "../../clients/actions/clients-actions/send-client-welcome";

interface Props {
  rows: JbrseoSubscriberRow[];
  emailStatuses?: Record<string, WelcomeEmailStatus>;
  // email (lowercased) → existing client id. A signup whose email is already a
  // client is treated as "already a client" and dropped from the to-convert list.
  clientByEmail?: Record<string, string>;
}

const dateFmt = new Intl.DateTimeFormat("en-GB", {
  year: "numeric",
  month: "short",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

// Resend the welcome email (login credentials) to an already-created client.
// Reuses the same server action used on client creation/conversion.
function ResendWelcomeButton({ clientId }: { clientId: string }) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const handleResend = () => {
    startTransition(async () => {
      const res = await sendClientWelcome(clientId);
      if (res.success) {
        toast({
          title: "تم إرسال إيميل الترحيب",
          description: "أُعيد إرسال بيانات الدخول للعميل على إيميله.",
        });
      } else {
        toast({
          title: "فشل الإرسال",
          description: res.error,
          variant: "destructive",
        });
      }
    });
  };

  return (
    <Button
      size="icon"
      variant="ghost"
      className="h-7 w-7 shrink-0 text-muted-foreground hover:text-foreground"
      onClick={handleResend}
      disabled={isPending}
      aria-label="إعادة إرسال إيميل الترحيب للعميل"
      title="إعادة إرسال إيميل الترحيب (بيانات الدخول) للعميل"
    >
      {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
    </Button>
  );
}

function SubscriberCard({
  r,
  clientId,
  emailStatuses,
  onConvert,
}: {
  r: JbrseoSubscriberRow;
  clientId: string | null;
  emailStatuses: Record<string, WelcomeEmailStatus>;
  onConvert: (r: JbrseoSubscriberRow) => void;
}) {
  return (
    <div className="rounded-md border bg-card p-3 flex items-start justify-between gap-3">
      <div className="min-w-0 space-y-1.5">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-medium text-sm">{r.contactName ?? "—"}</span>
          {r.businessName && (
            <span className="text-xs text-muted-foreground">· {r.businessName}</span>
          )}
          <Badge variant="secondary">{r.planName}</Badge>
          <Badge variant="outline">{r.country}</Badge>
          <Badge variant={r.isAnnual ? "default" : "secondary"}>
            {r.isAnnual ? "Annual" : "Monthly"}
          </Badge>
        </div>
        <div className="flex items-center gap-x-4 gap-y-1 flex-wrap text-xs text-muted-foreground">
          <a
            href={`mailto:${r.email}`}
            className="inline-flex items-center gap-1 text-primary hover:underline"
          >
            <Mail className="h-3 w-3" />
            {r.email}
          </a>
          <a
            href={`https://wa.me/${r.phone.replace(/\D/g, "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-primary hover:underline"
          >
            <Phone className="h-3 w-3" />
            {r.phone}
          </a>
          <span className="inline-flex items-center gap-1">
            <CalendarDays className="h-3 w-3" />
            {dateFmt.format(new Date(r.jbrseoCreatedAt))}
          </span>
        </div>
      </div>

      <div className="shrink-0 flex flex-col items-end gap-1.5">
        {clientId ? (
          <>
            <div className="flex items-center gap-1.5">
              <Link
                href={`/clients/${clientId}`}
                className="inline-flex items-center gap-1.5 rounded-md bg-emerald-500/10 px-2.5 py-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/20 whitespace-nowrap"
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                {r.convertedToClientId ? "تم التحويل" : "عميل بالفعل"}
                <ExternalLink className="h-3 w-3 opacity-60" />
              </Link>
              <ResendWelcomeButton clientId={clientId} />
            </div>
            {r.convertedToClientId && (() => {
              const st = emailStatuses[r.convertedToClientId];
              return (
                <div className="flex items-center gap-1.5 text-[10px]">
                  <span
                    className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 ${st?.delivered ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-muted text-muted-foreground"}`}
                    title={st?.delivered ? "تم تسليم إيميل الترحيب" : "بانتظار تأكيد التسليم"}
                  >
                    📬 {st?.delivered ? "وصل" : "—"}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 ${st?.opened ? "bg-blue-500/10 text-blue-600 dark:text-blue-400" : "bg-muted text-muted-foreground"}`}
                    title={st?.opened ? "فتح العميل الإيميل" : "لم يُفتح بعد"}
                  >
                    👀 {st?.opened ? "فُتح" : "—"}
                  </span>
                </div>
              );
            })()}
          </>
        ) : (
          <Button
            size="sm"
            variant="outline"
            className="h-8 gap-1.5 whitespace-nowrap"
            onClick={() => onConvert(r)}
          >
            <UserPlus className="h-3.5 w-3.5" />
            تحويل إلى عميل
          </Button>
        )}
      </div>
    </div>
  );
}

export function SubscribersTable({ rows, emailStatuses = {}, clientByEmail = {} }: Props) {
  const [query, setQuery] = useState("");
  const [country, setCountry] = useState<"all" | "SA" | "EG">("all");
  const [billing, setBilling] = useState<"all" | "annual" | "monthly">("all");
  const [convertTarget, setConvertTarget] = useState<JbrseoSubscriberRow | null>(null);
  const [view, setView] = useState<"pending" | "converted">("pending");

  const filtered = rows.filter((r) => {
    if (country !== "all" && r.country !== country) return false;
    if (billing === "annual" && !r.isAnnual) return false;
    if (billing === "monthly" && r.isAnnual) return false;
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      r.email.toLowerCase().includes(q) ||
      r.phone.toLowerCase().includes(q) ||
      (r.contactName?.toLowerCase().includes(q) ?? false) ||
      (r.businessName?.toLowerCase().includes(q) ?? false)
    );
  });

  // A signup counts as "already a client" if it was converted via this tool OR
  // its email already exists as a client — both are excluded from "للتحويل".
  const clientIdFor = (r: JbrseoSubscriberRow): string | null =>
    r.convertedToClientId ?? clientByEmail[r.email.trim().toLowerCase()] ?? null;

  const pending = filtered.filter((r) => !clientIdFor(r));
  const converted = filtered.filter((r) => clientIdFor(r));
  const list = view === "converted" ? converted : pending;

  return (
    <div className="space-y-4">
      {/* Search + Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="text-muted-foreground absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2" />
          <Input
            placeholder="Search name, email, phone, business..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="ps-9"
          />
        </div>

        <div className="flex gap-1">
          {(["all", "SA", "EG"] as const).map((c) => (
            <button
              key={c}
              onClick={() => setCountry(c)}
              className={`rounded-md border px-3 py-1.5 text-sm ${
                country === c
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background hover:bg-accent"
              }`}
            >
              {c === "all" ? "All" : c}
            </button>
          ))}
        </div>

        <div className="flex gap-1">
          {(["all", "annual", "monthly"] as const).map((b) => (
            <button
              key={b}
              onClick={() => setBilling(b)}
              className={`rounded-md border px-3 py-1.5 text-sm ${
                billing === b
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background hover:bg-accent"
              }`}
            >
              {b === "all" ? "All" : b === "annual" ? "Annual" : "Monthly"}
            </button>
          ))}
        </div>
      </div>

      {/* Toggle: switch between pending and converted (no long scroll) */}
      <div className="flex gap-1">
        <button
          onClick={() => setView("pending")}
          className={`rounded-md border px-3 py-1.5 text-sm flex items-center gap-2 ${
            view === "pending" ? "bg-primary text-primary-foreground border-primary" : "bg-background hover:bg-accent"
          }`}
        >
          للتحويل
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-black/10 dark:bg-white/15 tabular-nums font-bold">
            {pending.length}
          </span>
        </button>
        <button
          onClick={() => setView("converted")}
          className={`rounded-md border px-3 py-1.5 text-sm flex items-center gap-2 ${
            view === "converted" ? "bg-emerald-600 text-white border-emerald-600" : "bg-background hover:bg-accent"
          }`}
        >
          تم تحويلهم
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-black/10 dark:bg-white/15 tabular-nums font-bold">
            {converted.length}
          </span>
        </button>
      </div>

      {/* Active list */}
      {list.length === 0 ? (
        <div className="rounded-md border py-12 text-center">
          <div className="text-muted-foreground flex flex-col items-center gap-2">
            <Inbox className="h-10 w-10 opacity-50" />
            <p className="text-sm">
              {rows.length === 0
                ? "No subscribers yet — click 'Sync from jbrseo' to import."
                : view === "pending"
                  ? "لا يوجد مشتركون بانتظار التحويل."
                  : "لا يوجد مشتركون محوّلون بعد."}
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {list.map((r) => (
            <SubscriberCard key={r.id} r={r} clientId={clientIdFor(r)} emailStatuses={emailStatuses} onConvert={setConvertTarget} />
          ))}
        </div>
      )}

      {/* Footer count */}
      <p className="text-muted-foreground text-xs">
        {pending.length} للتحويل · {converted.length} محوّل · {rows.length} إجمالي
      </p>

      <ConvertSubscriberDialog
        subscriber={
          convertTarget
            ? {
                id: convertTarget.id,
                name:
                  convertTarget.businessName ||
                  convertTarget.contactName ||
                  convertTarget.email,
                email: convertTarget.email,
                phone: convertTarget.phone,
                planName: convertTarget.planName,
                country: convertTarget.country,
              }
            : null
        }
        open={convertTarget !== null}
        onOpenChange={(open) => {
          if (!open) setConvertTarget(null);
        }}
      />
    </div>
  );
}
