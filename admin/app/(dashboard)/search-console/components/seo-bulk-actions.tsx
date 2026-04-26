"use client";

import { useState, useTransition } from "react";
import { Loader2, Trash2, AlertTriangle } from "lucide-react";

import { useToast } from "@/hooks/use-toast";
import { notifyGoogleDeletedBulkAction } from "../actions/seo-actions";

interface SeoBulkActionsProps {
  missingUrls: string[];
}

export function SeoBulkActions({ missingUrls }: SeoBulkActionsProps) {
  const { toast } = useToast();
  const [pending, startTransition] = useTransition();
  const [confirm, setConfirm] = useState(false);

  const runBulk = () => {
    if (missingUrls.length === 0) return;
    startTransition(async () => {
      const res = await notifyGoogleDeletedBulkAction(missingUrls);
      setConfirm(false);
      if (res.ok && res.results) {
        const ok = res.results.filter((r) => r.success).length;
        const failed = res.results.length - ok;
        toast({
          title: "Removal sent to Google",
          description: `${ok} URL${ok === 1 ? "" : "s"} marked for removal${failed > 0 ? ` · ${failed} failed` : ""}`,
        });
      } else {
        toast({
          title: "Bulk removal failed",
          description: res.error ?? "Unknown error",
          variant: "destructive",
        });
      }
    });
  };

  if (missingUrls.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 px-5 py-3 bg-muted/30 border-b">
      <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground me-2">
        Bulk action
      </span>

      <button
        type="button"
        onClick={() => setConfirm(true)}
        disabled={pending}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-red-500/30 text-red-600 dark:text-red-400 hover:bg-red-500/10 text-xs font-medium disabled:opacity-50 transition-colors"
      >
        <Trash2 className="h-3.5 w-3.5" />
        Remove {missingUrls.length} URL{missingUrls.length === 1 ? "" : "s"} from Google
      </button>

      {confirm && (
        <ConfirmDialog
          count={missingUrls.length}
          pending={pending}
          onConfirm={runBulk}
          onCancel={() => setConfirm(false)}
        />
      )}
    </div>
  );
}

function ConfirmDialog({
  count,
  pending,
  onConfirm,
  onCancel,
}: {
  count: number;
  pending: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-background rounded-lg shadow-xl max-w-md w-full p-5 space-y-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold">
              Remove {count} URL{count === 1 ? "" : "s"} from Google
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Sends URL_REMOVED to Google&apos;s Indexing API for {count} URL
              {count === 1 ? "" : "s"}. Google will drop them from search results. The pages should already return 404/410 on the live site.
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Indexing API quota: ~200/day (URL_UPDATED + URL_REMOVED combined).
            </p>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={pending}
            className="px-3 py-2 rounded-md border text-sm hover:bg-muted disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={pending}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-50"
          >
            {pending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            Confirm removal
          </button>
        </div>
      </div>
    </div>
  );
}
