"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, CheckCircle2 } from "lucide-react";

import { useToast } from "@/hooks/use-toast";
import { bulkInspectAction } from "../actions/seo-actions";

interface Props {
  /** URLs that need fresh inspection (no cache OR cache > 24h old). */
  staleUrls: string[];
}

/**
 * Auto-inspects stale URLs in background on page mount.
 * Cached data renders instantly; this fills in fresh data without blocking.
 * Renders nothing when `staleUrls` is empty.
 */
export function BackgroundInspector({ staleUrls }: Props) {
  const router = useRouter();
  const { toast } = useToast();
  const [status, setStatus] = useState<"idle" | "running" | "done" | "error">("idle");
  const [count, setCount] = useState({ inspected: 0, errors: 0 });
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current || staleUrls.length === 0) return;
    fired.current = true;

    setStatus("running");

    // Cap at 200 to respect quota; rest will refresh on next page load
    const batch = staleUrls.slice(0, 200);

    bulkInspectAction({ urls: batch, forceRefresh: false })
      .then((res) => {
        if (res.ok) {
          setStatus("done");
          setCount({ inspected: res.inspectedCount ?? 0, errors: res.errorCount ?? 0 });
          if ((res.inspectedCount ?? 0) > 0) {
            toast({
              title: "Background refresh complete",
              description: `${res.inspectedCount} URL inspected · ${res.errorCount ?? 0} failed`,
            });
            // Refresh page to show new data
            router.refresh();
          }
        } else {
          setStatus("error");
          toast({
            title: "Background refresh failed",
            description: res.error ?? "Unknown error",
            variant: "destructive",
          });
        }
      })
      .catch((e) => {
        setStatus("error");
        toast({
          title: "Background refresh failed",
          description: e instanceof Error ? e.message : "Unknown error",
          variant: "destructive",
        });
      });
  }, [staleUrls, router, toast]);

  if (staleUrls.length === 0) return null;

  return (
    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-blue-500/10 border border-blue-500/20 text-xs text-blue-700 dark:text-blue-400">
      {status === "running" && (
        <>
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          <span>Refreshing {staleUrls.length} URLs from Google (background)...</span>
        </>
      )}
      {status === "done" && (
        <>
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
          <span>
            Refreshed {count.inspected} URLs{count.errors > 0 ? ` · ${count.errors} failed` : ""}
          </span>
        </>
      )}
      {status === "error" && (
        <span className="text-red-600">Background refresh failed (see toast)</span>
      )}
      {status === "idle" && (
        <>
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          <span>Queueing {staleUrls.length} URLs for refresh...</span>
        </>
      )}
    </div>
  );
}
