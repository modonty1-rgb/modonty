"use client";

import { RouteError } from "@/components/shared/route-error/RouteError";

export default function ForgotPasswordError({
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
      what="صفحة استعادة كلمة المرور"
      back={{ href: "/users/login", label: "تسجيل الدخول" }}
    />
  );
}
