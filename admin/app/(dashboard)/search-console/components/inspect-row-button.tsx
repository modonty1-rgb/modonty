"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, RefreshCw } from "lucide-react";

import { useToast } from "@/hooks/use-toast";
import { inspectUrlAction } from "../actions/seo-actions";

export function InspectRowButton({ url }: { url: string }) {
  const { toast } = useToast();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [done, setDone] = useState(false);

  const run = () => {
    startTransition(async () => {
      const res = await inspectUrlAction(url, { forceRefresh: true });
      if (res.ok) {
        setDone(true);
        toast({
          title: "Inspection refreshed",
          description: res.record?.verdict ?? "OK",
        });
        router.refresh();
      } else {
        toast({
          title: "Inspection failed",
          description: res.error ?? "Unknown error",
          variant: "destructive",
        });
      }
    });
  };

  return (
    <button
      type="button"
      onClick={run}
      disabled={pending}
      className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium border border-blue-500/30 text-blue-600 dark:text-blue-400 hover:bg-blue-500/10 disabled:opacity-50 transition-colors shrink-0"
      title="Refresh inspection from Google"
    >
      {pending ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
      {done ? "Inspected" : "Inspect"}
    </button>
  );
}
