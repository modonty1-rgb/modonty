"use client";

import { RouteError } from "@/components/shared/route-error/RouteError";

export default function RegisterError({
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
      what="صفحة التسجيل"
      back={{ href: "/users/login", label: "تسجيل الدخول" }}
    />
  );
}
