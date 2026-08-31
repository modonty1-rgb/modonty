"use client";

import { RouteError } from "@/components/shared/route-error/RouteError";

export default function TagError({
  error,
  unstable_retry: retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  return (
    <RouteError
      error={error}
      retry={retry}
      what="صفحة الوسم"
      back={{ href: "/tags", label: "كل الوسوم" }}
    />
  );
}
