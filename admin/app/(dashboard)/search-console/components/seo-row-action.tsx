"use client";

import { useState, useTransition } from "react";
import { Loader2, Trash2, RefreshCw, Check } from "lucide-react";

import { useToast } from "@/hooks/use-toast";
import {
  notifyGoogleDeletedAction,
  requestIndexingAction,
} from "../actions/seo-actions";

type Action = "delete" | "index";

interface SeoRowActionProps {
  url: string;
  action: Action;
  size?: "sm" | "md";
}

export function SeoRowAction({ url, action, size = "sm" }: SeoRowActionProps) {
  const { toast } = useToast();
  const [pending, startTransition] = useTransition();
  const [done, setDone] = useState(false);

  const isDelete = action === "delete";
  const label = isDelete ? "Notify deleted" : "Request indexing";
  const Icon = isDelete ? Trash2 : RefreshCw;

  const handleClick = () => {
    startTransition(async () => {
      const fn = isDelete ? notifyGoogleDeletedAction : requestIndexingAction;
      const res = await fn(url);
      if (res.ok) {
        setDone(true);
        toast({
          title: isDelete ? "Marked as deleted" : "Indexing requested",
          description: `Google notified for ${url.slice(0, 60)}${url.length > 60 ? "…" : ""}`,
        });
      } else {
        toast({
          title: "Failed",
          description: res.error ?? "Unknown error",
          variant: "destructive",
        });
      }
    });
  };

  if (done) {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-emerald-500">
        <Check className="h-3.5 w-3.5" /> Sent
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={pending}
      className={`inline-flex items-center gap-1 rounded-md border ${
        isDelete
          ? "border-red-500/30 text-red-600 dark:text-red-400 hover:bg-red-500/10"
          : "border-blue-500/30 text-blue-600 dark:text-blue-400 hover:bg-blue-500/10"
      } ${size === "sm" ? "px-2 py-1 text-xs" : "px-3 py-2 text-sm"} disabled:opacity-50 transition-colors`}
    >
      {pending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Icon className="h-3 w-3" />}
      {label}
    </button>
  );
}
