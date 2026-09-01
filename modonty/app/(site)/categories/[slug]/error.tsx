"use client";

import { RouteError } from "@/components/shared/route-error/RouteError";

export default function CategoryError({
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
      what="صفحة التصنيف"
      back={{ href: "/categories", label: "كل التصنيفات" }}
    />
  );
}
