"use client";

import { RouteError } from "@/components/shared/route-error/RouteError";

export default function NewsSubscribeError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <RouteError
      error={error}
      reset={reset}
      what="صفحة الاشتراك في النشرة"
      back={{ href: "/news", label: "النشرة" }}
    />
  );
}
