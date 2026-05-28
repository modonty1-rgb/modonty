"use client";

import { ReactNode, useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, CheckCircle2 } from "lucide-react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

import { SyncButton } from "../../subscription-tiers/components/sync-button";
import { SubscribersTable } from "../../subscription-tiers/components/subscribers-table";
import type { JbrseoSubscriberRow } from "../../subscription-tiers/helpers/jbrseo-queries";
import { syncJbrseoSubscribersAction } from "../../subscription-tiers/actions/sync-subscribers";

interface Props {
  clientsCount: number;
  signupsCount: number;
  signupsRows: JbrseoSubscriberRow[];
  clientsSlot: ReactNode;
  distributionSlot?: ReactNode;
}

export function ClientsTabs({
  clientsCount,
  signupsCount,
  signupsRows,
  clientsSlot,
  distributionSlot,
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

      <TabsContent value="clients" className="mt-4">
        <div>{clientsSlot}</div>
      </TabsContent>

      <TabsContent value="signups" className="mt-4">
        <div className="space-y-4">
          {autoSyncState === "running" ? (
            <div className="rounded-md border border-blue-500/30 bg-blue-500/10 px-4 py-3 flex items-center gap-3">
              <Loader2 className="h-4 w-4 animate-spin text-blue-600 dark:text-blue-400" />
              <div className="flex-1">
                <div className="text-sm font-medium text-blue-700 dark:text-blue-400">Auto-syncing from jbrseo...</div>
                <div className="text-xs text-blue-600/70 dark:text-blue-400/70">Pulling latest subscribers — usually 1–3 seconds</div>
              </div>
            </div>
          ) : autoSyncState === "done" && syncSummary ? (
            <div className="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 flex items-center gap-3">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <div className="flex-1">
                <div className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
                  {syncSummary.created > 0 || syncSummary.updated > 0
                    ? `Synced — pulled ${syncSummary.created} new and updated ${syncSummary.updated}`
                    : "Synced — already up to date with jbrseo"}
                </div>
                <div className="text-xs text-emerald-600/70 dark:text-emerald-400/70">
                  {syncSummary.total} total subscribers · finished in {syncSummary.durationMs}ms
                </div>
              </div>
            </div>
          ) : autoSyncState === "failed" ? (
            <div className="rounded-md border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-700 dark:text-red-400">
              Auto-sync failed. Use the manual Sync button.
            </div>
          ) : null}

          {distributionSlot}

          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div>
              <h2 className="text-sm font-semibold">jbrseo Signups</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                People who signed up via jbrseo&apos;s pricing page · auto-synced on tab open
              </p>
            </div>
            <SyncButton />
          </div>
          <Card>
            <CardContent className="pt-6">
              <SubscribersTable rows={signupsRows} />
            </CardContent>
          </Card>
        </div>
      </TabsContent>
    </Tabs>
  );
}
