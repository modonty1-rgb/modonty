"use client";

import { RouteError } from "@/components/shared/route-error/RouteError";

export default function ProfileDislikedError({
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
      what="اللي ما عجبك"
      back={{ href: "/users/profile", label: "حسابي" }}
    />
  );
}
