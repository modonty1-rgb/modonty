"use client";

import { useState, useTransition } from "react";
import { Loader2, Trash2, RefreshCw, AlertTriangle } from "lucide-react";

import { useToast } from "@/hooks/use-toast";
import {
  notifyGoogleDeletedBulkAction,
  requestIndexingBulkAction,
} from "../actions/seo-actions";

interface SeoBulkActionsProps {
  missingUrls: string[];
  unindexedUrls: string[];
}

export function SeoBulkActions({ missingUrls, unindexedUrls }: SeoBulkActionsProps) {
  const { toast } = useToast();
  const [pending, startTransition] = useTransition();
  const [confirm, setConfirm] = useState<"delete" | "index" | null>(null);

  const runBulk = (kind: "delete" | "index") => {
    const urls = kind === "delete" ? missingUrls : unindexedUrls;
    if (urls.length === 0) return;

    startTransition(async () => {
      const fn = kind === "delete" ? notifyGoogleDeletedBulkAction : requestIndexingBulkAction;
      const res = await fn(urls);
      setConfirm(null);
      if (res.ok && res.results) {
        const ok = res.results.filter((r) => r.success).length;
        const failed = res.results.length - ok;
        toast({
          title: kind === "delete" ? "Bulk delete sent" : "Bulk indexing sent",
          description: `${ok} succeeded${failed > 0 ? ` · ${failed} failed` : ""}`,
        });
      } else {
        toast({
          title: "Bulk action failed",
          description: res.error ?? "Unknown error",
          variant: "destructive",
        });
      }
    });
  };

  if (missingUrls.length === 0 && unindexedUrls.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 px-5 py-3 bg-muted/30 border-b">
      <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground me-2">
        Bulk actions
      </span>

      {missingUrls.length > 0 && (
        <button
          type="button"
          onClick={() => setConfirm("delete")}
          disabled={pending}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-red-500/30 text-red-600 dark:text-red-400 hover:bg-red-500/10 text-xs font-medium disabled:opacity-50 transition-colors"
        >
          <Trash2 className="h-3.5 w-3.5" />
          Notify Google: {missingUrls.length} deleted
        </button>
      )}

      {unindexedUrls.length > 0 && (
        <button
          type="button"
          onClick={() => setConfirm("index")}
          disabled={pending}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-blue-500/30 text-blue-600 dark:text-blue-400 hover:bg-blue-500/10 text-xs font-medium disabled:opacity-50 transition-colors"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Request indexing: {unindexedUrls.length} URL{unindexedUrls.length === 1 ? "" : "s"}
        </button>
      )}

      {confirm && (
        <ConfirmDialog
          kind={confirm}
          count={confirm === "delete" ? missingUrls.length : unindexedUrls.length}
          pending={pending}
          onConfirm={() => runBulk(confirm)}
          onCancel={() => setConfirm(null)}
        />
      )}
    </div>
  );
}

function ConfirmDialog({
  kind,
  count,
  pending,
  onConfirm,
  onCancel,
}: {
  kind: "delete" | "index";
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
              {kind === "delete" ? "Notify Google of deletions" : "Request indexing"}
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              {kind === "delete"
                ? `Send URL_REMOVED to Google for ${count} URL${count === 1 ? "" : "s"}. This signals Google to remove them from search results. Pages should already return 404/410 on the live site.`
                : `Send URL_UPDATED to Google for ${count} URL${count === 1 ? "" : "s"}. This requests crawl & indexing of fresh content.`}
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Indexing API quota: ~200/day default.
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
            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium text-white disabled:opacity-50 ${
              kind === "delete" ? "bg-red-600 hover:bg-red-700" : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {pending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
