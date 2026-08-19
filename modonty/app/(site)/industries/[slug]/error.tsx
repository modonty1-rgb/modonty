"use client";

import { RouteError } from "@/components/shared/route-error/RouteError";

export default function IndustryError({
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
      what="صفحة المجال"
      back={{ href: "/industries", label: "كل المجالات" }}
    />
  );
}
