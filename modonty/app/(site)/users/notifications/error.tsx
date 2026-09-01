"use client";

import { RouteError } from "@/components/shared/route-error/RouteError";

export default function NotificationsError({
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
      what="صفحة الإشعارات"
      back={{ href: "/users/profile", label: "حسابي" }}
    />
  );
}
