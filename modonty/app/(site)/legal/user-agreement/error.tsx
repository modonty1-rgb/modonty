"use client";

import { RouteError } from "@/components/shared/route-error/RouteError";

export default function UserAgreementError({
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
      what="اتفاقية المستخدم"
      back={{ href: "/legal", label: "الصفحات القانونية" }}
    />
  );
}
