"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw, Loader2 } from "lucide-react";

import { useToast } from "@/hooks/use-toast";

import { recheckIndexingStatusAction } from "../actions/removal-tracking-actions";

interface Props {
  url: string;
  /** When openedAt is recent (< 24h), the button warns the user before consuming a quota call. */
  openedAt: Date | null;
}

const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;

export function IndexingRecheckButton({ url, openedAt }: Props) {
  const { toast } = useToast();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [confirming, setConfirming] = useState(false);

  const tooSoon = openedAt
    ? Date.now() - new Date(openedAt).getTime() < TWENTY_FOUR_HOURS_MS
    : false;

  const run = () => {
    startTransition(async () => {
      const res = await recheckIndexingStatusAction(url);
      setConfirming(false);
      if (!res.ok) {
        toast({ title: "Re-check failed", description: res.error, variant: "destructive" });
        return;
      }
      const verdict = res.inspection?.verdict ?? "unknown";
      const friendly = (() => {
        switch (verdict) {
          case "PASS":
            return { title: "✅ Indexed by Google", description: "This page is in search results." };
          case "NEUTRAL":
            return {
              title: "⏳ Not yet indexed",
              description: res.inspection?.coverageState ?? "Google hasn't visited yet.",
            };
          case "FAIL":
            return {
              title: "❌ Google rejected this page",
              description: res.inspection?.coverageState ?? "Google found a problem.",
            };
          default:
            return { title: "Re-check complete", description: "Status updated." };
        }
      })();
      toast(friendly);
      router.refresh();
    });
  };

  if (confirming) {
    return (
      <div className="inline-flex items-center gap-1.5">
        <button
          type="button"
          onClick={run}
          disabled={isPending}
          className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-amber-600 hover:bg-amber-700 text-white text-[11px] font-medium disabled:opacity-50"
        >
          {isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
          Yes, use 1 quota
        </button>
        <button
          type="button"
          onClick={() => setConfirming(false)}
          disabled={isPending}
          className="px-2 py-1 rounded-md border text-[11px] hover:bg-muted disabled:opacity-50"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => (tooSoon ? setConfirming(true) : run())}
      disabled={isPending}
      title={tooSoon ? "Less than 24h since request — Google may not have crawled yet" : "Ask Google for current indexing status (uses 1 of 2,000/day quota)"}
      className="inline-flex items-center gap-1 px-2 py-1 rounded-md border border-blue-500/30 text-blue-600 dark:text-blue-400 hover:bg-blue-500/10 text-[11px] font-medium disabled:opacity-50"
    >
      {isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
      Re-check
    </button>
  );
}
