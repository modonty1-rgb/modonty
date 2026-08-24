"use client";

import { RouteError } from "@/components/shared/route-error/RouteError";

export default function TagError({
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
      what="صفحة الوسم"
      back={{ href: "/tags", label: "كل الوسوم" }}
    />
  );
}
