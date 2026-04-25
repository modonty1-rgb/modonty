"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Search, AlertTriangle } from "lucide-react";

import { useToast } from "@/hooks/use-toast";
import { bulkInspectAction } from "../actions/seo-actions";

export function InspectBulkButton({ totalArticles }: { totalArticles: number }) {
  const { toast } = useToast();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [confirm, setConfirm] = useState(false);
  const [forceRefresh, setForceRefresh] = useState(false);

  const run = () => {
    startTransition(async () => {
      const res = await bulkInspectAction({ forceRefresh });
      setConfirm(false);
      if (res.ok) {
        toast({
          title: "Bulk inspection complete",
          description: `${res.inspectedCount} inspected · ${res.errorCount ?? 0} failed`,
        });
        router.refresh();
      } else {
        toast({
          title: "Bulk inspection failed",
          description: res.error ?? "Unknown error",
          variant: "destructive",
        });
      }
    });
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setConfirm(true)}
        disabled={pending}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-blue-500/30 text-blue-600 dark:text-blue-400 hover:bg-blue-500/10 text-xs font-medium disabled:opacity-50 transition-colors"
      >
        {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Search className="h-3.5 w-3.5" />}
        Inspect all PUBLISHED ({totalArticles})
      </button>

      {confirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-background rounded-lg shadow-xl max-w-md w-full p-5 space-y-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-bold">Bulk inspect URLs</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Inspect {totalArticles} PUBLISHED article{totalArticles === 1 ? "" : "s"}.
                  Each call counts toward the 2,000/day URL Inspection quota. Cached results (&lt; 7 days) are reused.
                </p>
                <label className="flex items-center gap-2 mt-3 text-xs">
                  <input
                    type="checkbox"
                    checked={forceRefresh}
                    onChange={(e) => setForceRefresh(e.target.checked)}
                    disabled={pending}
                  />
                  <span>Force refresh (ignore cache)</span>
                </label>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirm(false)}
                disabled={pending}
                className="px-3 py-2 rounded-md border text-sm hover:bg-muted disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={run}
                disabled={pending}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
              >
                {pending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                Run inspection
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
