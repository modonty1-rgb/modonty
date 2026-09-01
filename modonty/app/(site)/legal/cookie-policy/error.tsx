"use client";

import { RouteError } from "@/components/shared/route-error/RouteError";

export default function CookiePolicyError({
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
      what="سياسة ملفات تعريف الارتباط"
      back={{ href: "/legal", label: "الصفحات القانونية" }}
    />
  );
}
