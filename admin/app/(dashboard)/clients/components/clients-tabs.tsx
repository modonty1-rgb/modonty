"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, CheckCircle2 } from "lucide-react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

import { SyncButton } from "../../subscription-tiers/components/sync-button";
import { SubscribersTable } from "../../subscription-tiers/components/subscribers-table";
import { ClientsPageClient } from "./clients-page-client";
import { TierDistribution } from "../../subscription-tiers/components/tier-distribution";
import type { ClientForList } from "../actions/clients-actions/types";
import type { JbrseoSubscriberRow, WelcomeEmailStatus } from "../../subscription-tiers/helpers/jbrseo-queries";
import { syncJbrseoSubscribersAction } from "../../subscription-tiers/actions/sync-subscribers";

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
  const [autoSyncState, setAutoSyncState] = useState<"idle" | "running" | "done" | "failed">("idle");
  const [syncSummary, setSyncSummary] = useState<{ total: number; created: number; updated: number; durationMs: number } | null>(null);
  const firedOnce = useRef(false);
  const [, startTransition] = useTransition();

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
        <div>
          <ClientsPageClient clients={clients} defaultLogoUrl={defaultLogoUrl} />
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
