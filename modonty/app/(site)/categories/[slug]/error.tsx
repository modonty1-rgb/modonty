"use client";

import { RouteError } from "@/components/shared/route-error/RouteError";

export default function CategoryError({
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
      what="صفحة التصنيف"
      back={{ href: "/categories", label: "كل التصنيفات" }}
    />
  );
}
