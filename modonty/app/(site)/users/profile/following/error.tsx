"use client";

import { RouteError } from "@/components/shared/route-error/RouteError";

export default function ProfileFollowingError({
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
      what="اللي تتابعه"
      back={{ href: "/users/profile", label: "حسابي" }}
    />
  );
}
