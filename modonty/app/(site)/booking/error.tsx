"use client";

import { RouteError } from "@/components/shared/route-error/RouteError";

export default function BookingError({
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
      what="صفحة الحجز"
      back={{ href: "/clients", label: "كل الشركاء" }}
    />
  );
}
