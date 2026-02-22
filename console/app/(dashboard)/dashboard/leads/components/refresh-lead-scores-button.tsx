"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ar } from "@/lib/ar";
import { refreshLeadScores } from "../actions/refresh-lead-scores";
import { RefreshCw } from "lucide-react";

export function RefreshLeadScoresButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const l = ar.leads;

  function handleClick() {
    startTransition(async () => {
      const result = await refreshLeadScores();
      if (result.ok) {
        router.refresh();
      }
    });
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={handleClick}
      disabled={isPending}
      className="gap-2"
    >
      <RefreshCw className={`h-4 w-4 ${isPending ? "animate-spin" : ""}`} />
      {isPending ? l.refreshing : l.refreshScores}
    </Button>
  );
}
