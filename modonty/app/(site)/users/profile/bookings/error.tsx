"use client";

import { RouteError } from "@/components/shared/route-error/RouteError";

export default function ProfileBookingsError({
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
      what="حجوزاتك"
      back={{ href: "/users/profile", label: "حسابي" }}
    />
  );
}
