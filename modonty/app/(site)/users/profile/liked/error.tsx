"use client";

import { RouteError } from "@/components/shared/route-error/RouteError";

export default function ProfileLikedError({
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
      what="إعجاباتك"
      back={{ href: "/users/profile", label: "حسابي" }}
    />
  );
}
