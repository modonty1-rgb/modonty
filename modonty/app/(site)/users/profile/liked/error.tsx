"use client";

import { RouteError } from "@/components/shared/route-error/RouteError";

export default function ProfileLikedError({
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
      what="إعجاباتك"
      back={{ href: "/users/profile", label: "حسابي" }}
    />
  );
}
