"use client";

import { RouteError } from "@/components/shared/route-error/RouteError";

export default function HomepageError({
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
      what="الصفحة الرئيسية"
    />
  );
}
