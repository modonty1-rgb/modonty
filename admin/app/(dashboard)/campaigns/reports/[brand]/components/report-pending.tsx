"use client";

import { createContext, useContext, useTransition, type ReactNode, type TransitionStartFunction } from "react";

/**
 * One transition for the whole report (Khalid, 29 Sep 2026: «أحدد التوجل اعرض سكيلتون»). A filter
 * re-reads Meta for ~10 s; a navigation inside a transition keeps the old page on screen, so the old
 * numbers would sit there looking current. Every filter starts this one transition, and every data
 * block swaps to its skeleton while it runs.
 */
const PendingContext = createContext<{ isPending: boolean; start: TransitionStartFunction } | null>(null);

export function ReportPendingProvider({ children }: { children: ReactNode }) {
  const [isPending, start] = useTransition();
  return <PendingContext.Provider value={{ isPending, start }}>{children}</PendingContext.Provider>;
}

export function useReportTransition() {
  const ctx = useContext(PendingContext);
  if (!ctx) throw new Error("useReportTransition outside ReportPendingProvider");
  return ctx;
}

export function PendingSwap({ skeleton, children }: { skeleton: ReactNode; children: ReactNode }) {
  const { isPending } = useReportTransition();
  return isPending ? (
    <div role="status" aria-label="يحدّث من ميتا">
      {skeleton}
    </div>
  ) : (
    <>{children}</>
  );
}
