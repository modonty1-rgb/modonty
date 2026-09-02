"use client";

import { PageError } from "@/components/admin/page-error";

/**
 * The board reads the database on every open, so it can realistically fail —
 * which is the test for whether a route gets an `error.tsx` at all.
 *
 * `PageError` is the shared boundary every other admin route uses; a bespoke one
 * here would drift from them the first time that component changes.
 */
export default function TasksError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <PageError error={error} reset={reset} title="Could not load the board" />;
}
