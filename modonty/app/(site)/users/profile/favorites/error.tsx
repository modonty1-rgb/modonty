"use client";

import { RouteError } from "@/components/shared/route-error/RouteError";

export default function ProfileFavoritesError({
  error,
  unstable_retry: retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  return (
    <RouteError
      error={error}
      retry={retry}
      what="محفوظاتك"
      back={{ href: "/users/profile", label: "حسابي" }}
    />
  );
}
