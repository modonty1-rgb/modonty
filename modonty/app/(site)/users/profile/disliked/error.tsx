"use client";

import { RouteError } from "@/components/shared/route-error/RouteError";

export default function ProfileDislikedError({
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
      what="اللي ما عجبك"
      back={{ href: "/users/profile", label: "حسابي" }}
    />
  );
}
