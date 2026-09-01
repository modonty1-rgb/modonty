"use client";

import { RouteError } from "@/components/shared/route-error/RouteError";

export default function ProfileSettingsError({
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
      what="الإعدادات"
      back={{ href: "/users/profile", label: "ملفك الشخصي" }}
    />
  );
}
