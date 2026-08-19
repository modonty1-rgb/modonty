"use client";

import { RouteError } from "@/components/shared/route-error/RouteError";

export default function PrivacyPolicyError({
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
      what="سياسة الخصوصية"
      back={{ href: "/legal", label: "الصفحات القانونية" }}
    />
  );
}
