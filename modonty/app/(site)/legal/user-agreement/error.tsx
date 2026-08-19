"use client";

import { RouteError } from "@/components/shared/route-error/RouteError";

export default function UserAgreementError({
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
      what="اتفاقية المستخدم"
      back={{ href: "/legal", label: "الصفحات القانونية" }}
    />
  );
}
