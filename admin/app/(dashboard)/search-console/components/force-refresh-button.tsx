"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw, AlertTriangle } from "lucide-react";

import { useToast } from "@/hooks/use-toast";
import { bulkInspectAction } from "../actions/seo-actions";

interface Props {
  urls: string[];
}

/**
 * Force-refresh ALL sitemap URLs from Google — ignores cache.
 * Uses ~5% of daily Google URL Inspection quota per click (102 URLs out of 2000/day).
 */
export function ForceRefreshButton({ urls }: Props) {
  const router = useRouter();
  const { toast } = useToast();
  const [confirm, setConfirm] = useState(false);
  const [running, setRunning] = useState(false);

  const total = urls.length;

  const run = async () => {
    setRunning(true);
    try {
      const res = await bulkInspectAction({ urls, forceRefresh: true });
      if (res.ok) {
        toast({
          title: "Forced refresh complete",
          description: `${res.inspectedCount ?? 0} URL re-checked with Google · ${res.errorCount ?? 0} failed`,
        });
        router.refresh();
      } else {
        toast({
          title: "Forced refresh failed",
          description: res.error ?? "Unknown error",
          variant: "destructive",
        });
      }
    } catch (e) {
      toast({
        title: "Forced refresh failed",
        description: e instanceof Error ? e.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setRunning(false);
      setConfirm(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setConfirm(true)}
        disabled={running || total === 0}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-blue-500/30 text-blue-600 dark:text-blue-400 hover:bg-blue-500/10 text-xs font-medium disabled:opacity-50 transition-colors"
      >
        <RefreshCw className={`h-3.5 w-3.5 ${running ? "animate-spin" : ""}`} />
        Force refresh ({total})
      </button>

      {confirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-background rounded-lg shadow-xl max-w-md w-full p-5 space-y-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-bold">Force refresh all URLs?</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Re-check all <strong>{total}</strong> URLs against Google&apos;s URL Inspection API right now, ignoring cache.
                </p>
                <p className="text-xs text-amber-600 mt-2">
                  Burns ~{Math.round((total / 2000) * 100)}% of today&apos;s quota ({total}/2000). Takes ~{Math.ceil(total / 20)} min.
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirm(false)}
                disabled={running}
                className="px-3 py-2 rounded-md border text-sm hover:bg-muted disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={run}
                disabled={running}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${running ? "animate-spin" : ""}`} />
                {running ? "Refreshing..." : "Run refresh"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
