"use client";

import { ErrorView } from "@/components/error-view";

/**
 * Dashboard boundary — a page failed, the shell did not.
 *
 * Rendering inline keeps the sidebar and header alive, so the client can walk to another
 * section instead of being dumped on a blank screen and assuming the whole console is down.
 */
export default function DashboardError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return <ErrorView error={error} retry={ retry } layout="inline" />;
}
