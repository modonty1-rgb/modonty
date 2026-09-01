"use client";

import { RouteError } from "@/components/shared/route-error/RouteError";

export default function AnalyticsError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return (
    <RouteError
      error={error}
      retry={retry}
      what="صفحة الأرقام"
    />
  );
}
