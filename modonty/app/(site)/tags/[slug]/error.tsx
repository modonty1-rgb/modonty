"use client";

import { RouteError } from "@/components/shared/route-error/RouteError";

export default function TagError({
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
      what="صفحة الوسم"
      back={{ href: "/tags", label: "كل الوسوم" }}
    />
  );
}
