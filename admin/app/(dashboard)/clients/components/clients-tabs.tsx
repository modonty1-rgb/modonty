"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, CheckCircle2 } from "lucide-react";
import { SubscriptionStatus } from "@prisma/client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

import { SyncButton } from "../../subscription-tiers/components/sync-button";
import { SubscribersTable } from "../../subscription-tiers/components/subscribers-table";
import { ClientsPageClient } from "./clients-page-client";
import { TierDistribution } from "../../subscription-tiers/components/tier-distribution";
import type { ClientForList } from "../actions/clients-actions/types";
import type { StatusFilterKey } from "./client-table";
import type { JbrseoSubscriberRow, WelcomeEmailStatus } from "../../subscription-tiers/helpers/jbrseo-queries";
import { syncJbrseoSubscribersAction } from "../../subscription-tiers/actions/sync-subscribers";

/** Status tab split into two segments: label | count, divided by a splitter.
 *  Same shape as the Articles status tabs. Count inverts colour when active. */
function CountTab({
  label,
  count,
  active,
  onClick,
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center overflow-hidden rounded-full border text-xs font-medium transition-colors",
        active ? "border-primary" : "border-border hover:bg-accent",
      )}
    >
      <span className={cn("px-2.5 py-1", active ? "bg-primary text-primary-foreground" : "text-foreground")}>
        {label}
      </span>
      <span
        className={cn(
          "border-s px-2 py-1 font-bold tabular-nums",
          active
            ? "border-primary-foreground/30 bg-primary-foreground text-primary"
            : "border-border bg-muted text-muted-foreground",
        )}
      >
        {count}
      </span>
    </button>
  );
}

const STATUS_TABS: Array<{ key: StatusFilterKey; label: string }> = [
  { key: "ALL", label: "All" },
  { key: SubscriptionStatus.ACTIVE, label: "Active" },
  { key: SubscriptionStatus.PENDING, label: "Pending" },
  { key: SubscriptionStatus.EXPIRED, label: "Expired" },
  { key: SubscriptionStatus.CANCELLED, label: "Cancelled" },
];

interface Props {
  clientsCount: number;
  signupsCount: number;
  signupsRows: JbrseoSubscriberRow[];
  emailStatuses: Record<string, WelcomeEmailStatus>;
  clients: ClientForList[];
  // email (lowercased) → client id, for ALL clients (filter-independent) — used to
  // hide signups that are already clients from the to-convert list.
  clientByEmail: Record<string, string>;
  defaultLogoUrl?: string | null;
  tiers: React.ComponentProps<typeof TierDistribution>["tiers"];
}

export function ClientsTabs({
  clientsCount,
  signupsCount,
  signupsRows,
  emailStatuses,
  clients,
  clientByEmail,
  defaultLogoUrl,
  tiers,
}: Props) {
  const router = useRouter();
  const { toast } = useToast();
  const [tab, setTab] = useState("clients");
  const [statusFilter, setStatusFilter] = useState<StatusFilterKey>("ALL");
  const [isFiltering, startFilter] = useTransition();
  const [autoSyncState, setAutoSyncState] = useState<"idle" | "running" | "done" | "failed">("idle");
  const [syncSummary, setSyncSummary] = useState<{ total: number; created: number; updated: number; durationMs: number } | null>(null);
  const firedOnce = useRef(false);
  const [, startTransition] = useTransition();

  // Status counts over ALL clients (search-independent, like the Articles status tabs).
  const statusCounts = useMemo(() => {
    const counts: Record<StatusFilterKey, number> = {
      ALL: clients.length,
      [SubscriptionStatus.ACTIVE]: 0,
      [SubscriptionStatus.PENDING]: 0,
      [SubscriptionStatus.EXPIRED]: 0,
      [SubscriptionStatus.CANCELLED]: 0,
    };
    for (const c of clients) counts[c.subscriptionStatus] += 1;
    return counts;
  }, [clients]);

  const handleStatusFilter = (key: StatusFilterKey) => {
    startFilter(() => setStatusFilter(key));
  };

  // Auto-fire sync the FIRST time the jbrseo Subscribers tab is opened (per page load)
  useEffect(() => {
    if (tab !== "signups" || firedOnce.current) return;
    firedOnce.current = true;
    setAutoSyncState("running");
    startTransition(async () => {
      const res = await syncJbrseoSubscribersAction();
      if (res.ok) {
        setAutoSyncState("done");
        setSyncSummary({ total: res.total, created: res.created, updated: res.updated, durationMs: res.durationMs });
        // ALWAYS show a toast so user knows sync ran, even when there are zero changes
        toast({
          title: res.created > 0 || res.updated > 0 ? "Auto-synced — new data pulled" : "Auto-synced — already up to date",
          description: `${res.total} total · ${res.created} new · ${res.updated} updated · ${res.durationMs}ms`,
        });
        if (res.created > 0 || res.updated > 0) {
          router.refresh();
        }
      } else {
        setAutoSyncState("failed");
        toast({
          title: "Auto-sync failed",
          description: res.error,
          variant: "destructive",
        });
      }
    });
  }, [tab, router, toast]);

  return (
    <Tabs value={tab} onValueChange={setTab} className="w-full">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <TabsList className="h-auto p-1 bg-muted/40 border">
          <TabsTrigger value="clients" className="gap-2">
            Clients
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted-foreground/15 tabular-nums font-bold">
              {clientsCount}
            </span>
          </TabsTrigger>
          <TabsTrigger value="signups" className="gap-2">
            jbrseo Subscribers
            {signupsCount > 0 && (
              <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold leading-none bg-pink-500/20 text-pink-600 dark:text-pink-400">
                {signupsCount}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Status filter tabs — same row as the top tabs (clients tab only) */}
        {tab === "clients" && (
          <div className="flex items-center gap-1.5 flex-wrap">
            {STATUS_TABS.map((s) => (
              <CountTab
                key={s.key}
                label={s.label}
                count={statusCounts[s.key]}
                active={statusFilter === s.key}
                onClick={() => handleStatusFilter(s.key)}
              />
            ))}
          </div>
        )}

        {/* Distribution bar lives on the tab row (signups tab only) to save vertical space */}
        {tab === "signups" && (
          <div className="flex-1 min-w-[240px]">
            <TierDistribution tiers={tiers} />
          </div>
        )}

        {/* Compact inline sync status — sits on the tab row, no extra vertical space */}
        {autoSyncState === "running" ? (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-600 dark:text-blue-400">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Syncing from jbrseo…
          </span>
        ) : autoSyncState === "done" && syncSummary ? (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="h-3.5 w-3.5" />
            {syncSummary.created > 0 || syncSummary.updated > 0
              ? `+${syncSummary.created} new · ${syncSummary.updated} updated`
              : "Up to date"}
            <span className="text-muted-foreground font-normal">
              · {syncSummary.total} subs · {syncSummary.durationMs}ms
            </span>
          </span>
        ) : autoSyncState === "failed" ? (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-red-600 dark:text-red-400">
            Sync failed — use manual Sync
          </span>
        ) : null}
      </div>

      <TabsContent value="clients" className="mt-3">
        <div className="relative">
          {isFiltering && (
            <div className="absolute inset-0 z-10 flex items-start justify-center rounded-lg bg-background/50 pt-20 backdrop-blur-[1px]">
              <span className="flex items-center gap-2 rounded-full border bg-card px-3 py-1.5 text-xs font-semibold text-muted-foreground shadow-sm">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                جارٍ التحميل…
              </span>
            </div>
          )}
          <div className={isFiltering ? "pointer-events-none opacity-50 transition-opacity" : "transition-opacity"}>
            <ClientsPageClient clients={clients} defaultLogoUrl={defaultLogoUrl} statusFilter={statusFilter} />
          </div>
        </div>
      </TabsContent>

      <TabsContent value="signups" className="mt-3">
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div>
              <h2 className="text-sm font-semibold">jbrseo Signups</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                People who signed up via jbrseo&apos;s pricing page · auto-synced on tab open
              </p>
            </div>
            <div className="flex items-center gap-2">
              <SyncButton />
            </div>
          </div>
          <Card>
            <CardContent className="pt-4">
              <SubscribersTable rows={signupsRows} emailStatuses={emailStatuses} clientByEmail={clientByEmail} />
            </CardContent>
          </Card>
        </div>
      </TabsContent>
    </Tabs>
  );
}
