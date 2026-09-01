"use client";

import { ErrorView } from "@/components/error-view";

/**
 * Root boundary — the one that catches a failing `(dashboard)/layout.tsx`.
 *
 * That layout runs thirteen parallel queries before a single page renders, so when the
 * database hands back something Prisma refuses (a row pointing at a parent that no longer
 * exists, for instance), the throw happens ABOVE the dashboard boundary and only this file
 * is left to catch it. Without it the client got Next's raw white screen.
 */
export default function ConsoleError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return <ErrorView error={error} retry={ retry } />;
}
