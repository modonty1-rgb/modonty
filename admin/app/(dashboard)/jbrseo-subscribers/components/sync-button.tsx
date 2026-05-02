"use client";

import { useState, useTransition } from "react";
import { RefreshCw, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { syncJbrseoSubscribersAction } from "../actions/sync-subscribers";

export function SyncButton() {
  const [isPending, startTransition] = useTransition();
  const [lastResult, setLastResult] = useState<string | null>(null);
  const { toast } = useToast();

  function handleSync() {
    startTransition(async () => {
      const result = await syncJbrseoSubscribersAction();

      if (result.ok) {
        const msg = `Synced ${result.total} subscribers · ${result.created} new · ${result.updated} updated`;
        setLastResult(`${result.total} total`);
        toast({
          title: "Sync complete",
          description: `${msg} (${result.durationMs}ms)`,
          variant: "default",
        });
      } else {
        toast({
          title: "Sync failed",
          description: result.error,
          variant: "destructive",
        });
        setLastResult("Failed");
      }
    });
  }

  return (
    <div className="flex items-center gap-3">
      <Button
        onClick={handleSync}
        disabled={isPending}
        variant="default"
        className="gap-2"
      >
        {isPending ? (
          <>
            <RefreshCw className="h-4 w-4 animate-spin" />
            Syncing...
          </>
        ) : (
          <>
            <RefreshCw className="h-4 w-4" />
            Sync from jbrseo
          </>
        )}
      </Button>
      {lastResult && (
        <span className="text-muted-foreground flex items-center gap-1 text-sm">
          {lastResult === "Failed" ? (
            <AlertCircle className="h-4 w-4 text-red-500" />
          ) : (
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          )}
          {lastResult}
        </span>
      )}
    </div>
  );
}
