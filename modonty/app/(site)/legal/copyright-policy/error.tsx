"use client";

import { RouteError } from "@/components/shared/route-error/RouteError";

export default function CopyrightPolicyError({
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
      what="سياسة حقوق النشر"
      back={{ href: "/legal", label: "الصفحات القانونية" }}
    />
  );
}
