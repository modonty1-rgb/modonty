"use client";

import { useState, useTransition } from "react";
import { Loader2, ExternalLink, Check, RotateCcw, CheckCircle2 } from "lucide-react";

import { useToast } from "@/hooks/use-toast";
import {
  markManualOpenedAction,
  markManualDoneAction,
  unmarkManualDoneAction,
  type ManualTrackState,
  type GscRequestType,
} from "../actions/removal-tracking-actions";

type Action = "delete" | "index";

interface SeoRowActionProps {
  url: string;
  action: Action;
  size?: "sm" | "md";
  trackState?: ManualTrackState | null;
}

const GSC_REMOVALS_URL =
  "https://search.google.com/search-console/removals?resource_id=sc-domain%3Amodonty.com";
const GSC_INSPECT_URL = (encodedUrl: string) =>
  `https://search.google.com/search-console/inspect?resource_id=sc-domain%3Amodonty.com&id=${encodeURIComponent(encodedUrl)}`;

const formatDate = (d: Date) =>
  new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric" }).format(
    new Date(d),
  );

function actionToType(action: Action): GscRequestType {
  return action === "delete" ? "REMOVAL" : "INDEXING";
}

function actionToLabels(action: Action) {
  if (action === "delete") {
    return {
      newButton: "Remove in GSC",
      newColor: "border-red-500/30 text-red-600 dark:text-red-400 hover:bg-red-500/10",
      doneLabel: "Done",
      toastOpenTitle: "Opened GSC Removals",
      toastOpenDesc: "URL copied — paste in 'New Request', then Submit.",
      toastDoneTitle: "Marked as done",
      toastDoneDesc: "Removal request confirmed in your records.",
    };
  }
  return {
    newButton: "Request indexing in GSC",
    newColor: "border-blue-500/30 text-blue-600 dark:text-blue-400 hover:bg-blue-500/10",
    doneLabel: "Indexing requested",
    toastOpenTitle: "Opened GSC URL Inspection",
    toastOpenDesc: "Click 'Request Indexing' in Google, then come back and Mark done.",
    toastDoneTitle: "Marked as requested",
    toastDoneDesc: "Indexing request confirmed in your records.",
  };
}

function buildGscUrl(action: Action, url: string): string {
  const canonical = (() => {
    try { return new URL(url).href; } catch { return url; }
  })();
  return action === "delete" ? GSC_REMOVALS_URL : GSC_INSPECT_URL(canonical);
}

export function SeoRowAction({ url, action, size = "sm", trackState }: SeoRowActionProps) {
  const { toast } = useToast();
  const [pending, startTransition] = useTransition();
  const [localState, setLocalState] = useState<ManualTrackState | null | undefined>(undefined);

  const type = actionToType(action);
  const labels = actionToLabels(action);
  const current = localState !== undefined ? localState : trackState ?? null;

  const handleOpen = () => {
    const canonical = (() => {
      try { return new URL(url).href; } catch { return url; }
    })();
    void navigator.clipboard.writeText(canonical).catch(() => {});
    window.open(buildGscUrl(action, url), "_blank", "noopener,noreferrer");
    toast({ title: labels.toastOpenTitle, description: labels.toastOpenDesc });
    startTransition(async () => {
      const res = await markManualOpenedAction(url, type);
      if (res.ok) {
        setLocalState({ url, type, openedAt: new Date(), doneAt: current?.doneAt ?? null });
      }
    });
  };

  const handleMarkDone = () => {
    startTransition(async () => {
      const res = await markManualDoneAction(url, type);
      if (res.ok) {
        setLocalState({ url, type, openedAt: current?.openedAt ?? new Date(), doneAt: new Date() });
        toast({ title: labels.toastDoneTitle, description: labels.toastDoneDesc });
      } else {
        toast({ title: "Failed", description: res.error ?? "Unknown error", variant: "destructive" });
      }
    });
  };

  const handleUndo = () => {
    startTransition(async () => {
      const res = await unmarkManualDoneAction(url, type);
      if (res.ok) {
        setLocalState({ url, type, openedAt: current?.openedAt ?? new Date(), doneAt: null });
        toast({ title: "Undone", description: "Reverted to 'awaiting submit'." });
      } else {
        toast({ title: "Failed", description: res.error ?? "Unknown error", variant: "destructive" });
      }
    });
  };

  // ── State 3: DONE ─────────────────────────────────────────────
  if (current?.doneAt) {
    return (
      <div className="flex items-center gap-2">
        <span
          className="inline-flex items-center gap-1 px-2 py-1 rounded-md border border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs font-medium"
          title={`Marked done on ${formatDate(current.doneAt)}`}
        >
          <CheckCircle2 className="h-3 w-3" />
          {labels.doneLabel} · {formatDate(current.doneAt)}
        </span>
        <button
          type="button"
          onClick={handleUndo}
          disabled={pending}
          className="text-[10px] text-muted-foreground hover:text-foreground inline-flex items-center gap-1 disabled:opacity-50"
          title="Undo — revert to 'awaiting submit'"
        >
          <RotateCcw className="h-3 w-3" />
          undo
        </button>
      </div>
    );
  }

  // ── State 2: OPENED but not yet marked done ──────────────────
  if (current?.openedAt) {
    return (
      <div className="flex items-center gap-1.5 flex-wrap">
        <span
          className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded border border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400 text-[10px] font-medium"
          title={`Opened in GSC on ${formatDate(current.openedAt)}`}
        >
          opened · {formatDate(current.openedAt)}
        </span>
        <button
          type="button"
          onClick={handleMarkDone}
          disabled={pending}
          className={`inline-flex items-center gap-1 rounded-md border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/10 ${size === "sm" ? "px-2 py-1 text-xs" : "px-3 py-2 text-sm"} disabled:opacity-50 transition-colors`}
        >
          {pending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
          Mark done
        </button>
        <button
          type="button"
          onClick={handleOpen}
          className="text-[10px] text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-0.5"
          title="Open GSC again"
        >
          <ExternalLink className="h-2.5 w-2.5" />
          open again
        </button>
      </div>
    );
  }

  // ── State 1: NEW (never clicked) ─────────────────────────────
  return (
    <button
      type="button"
      onClick={handleOpen}
      className={`inline-flex items-center gap-1 rounded-md border ${labels.newColor} ${size === "sm" ? "px-2 py-1 text-xs" : "px-3 py-2 text-sm"} transition-colors`}
      title={action === "delete" ? "Open GSC Removals tool" : "Open GSC URL Inspection to request indexing"}
    >
      <ExternalLink className="h-3 w-3" />
      {labels.newButton}
    </button>
  );
}
