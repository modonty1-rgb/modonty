"use client";

import { RouteError } from "@/components/shared/route-error/RouteError";

export default function ProfileFollowingError({
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
      what="اللي تتابعه"
      back={{ href: "/users/profile", label: "حسابي" }}
    />
  );
}
