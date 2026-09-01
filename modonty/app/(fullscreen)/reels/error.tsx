"use client";

import { RouteError } from "@/components/shared/route-error/RouteError";

export default function ReelsError({
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
      what="صفحة الطلّات"
    />
  );
}
