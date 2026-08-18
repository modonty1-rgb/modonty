"use client";

import { useState } from "react";

import { IconLike, IconDislike } from "@/lib/icons";
import { cn } from "@/lib/utils";
import { rateAnswer } from "../../data/rate-answer";

/**
 * 👍/👎 under one answer.
 *
 * This is the only human judgment Modo receives, and everything measurable rests on it: the five
 * reranker thresholds are tuned against questions with known-good answers, and until now that set
 * was written by hand — my own guess about what Modo should and should not answer.
 *
 * Deliberately quiet and one-shot. A rating bar that competes with the answer gets clicked at
 * random, and random data is worse than none; the ask is small, and it disappears once given.
 */
export function RateAnswer({ messageId }: { messageId: string }) {
  const [rated, setRated] = useState<null | boolean>(null);
  const [busy, setBusy] = useState(false);

  const send = async (isHelpful: boolean) => {
    if (busy || rated !== null) return;
    setBusy(true);
    const res = await rateAnswer(messageId, isHelpful);
    if (res.success) setRated(isHelpful);
    setBusy(false);
  };

  if (rated !== null) {
    return (
      <p className="mt-1.5 me-10 text-xs text-muted-foreground" dir="rtl" role="status">
        {rated ? "شكراً — يفيدنا." : "شكراً — نراجعها."}
      </p>
    );
  }

  return (
    <div className="mt-1.5 me-10 flex items-center gap-1" dir="rtl">
      <span className="text-xs text-muted-foreground">الجواب أفادك؟</span>
      {[
        { helpful: true, Icon: IconLike, label: "أفادني" },
        { helpful: false, Icon: IconDislike, label: "ما أفادني" },
      ].map(({ helpful, Icon, label }) => (
        <button
          key={label}
          type="button"
          onClick={() => send(helpful)}
          disabled={busy}
          aria-label={label}
          title={label}
          className={cn(
            "flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors",
            "hover:bg-muted hover:text-foreground disabled:opacity-50",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          )}
        >
          <Icon className="h-3.5 w-3.5" aria-hidden />
        </button>
      ))}
    </div>
  );
}
