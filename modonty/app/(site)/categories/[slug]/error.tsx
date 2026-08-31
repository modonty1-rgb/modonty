"use client";

import { RouteError } from "@/components/shared/route-error/RouteError";

export default function CategoryError({
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
      what="صفحة التصنيف"
      back={{ href: "/categories", label: "كل التصنيفات" }}
    />
  );
}
