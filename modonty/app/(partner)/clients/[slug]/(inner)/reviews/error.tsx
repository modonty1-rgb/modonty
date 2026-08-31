"use client";

import { RouteError } from "@/components/shared/route-error/RouteError";

export default function PartnerReviewsError({
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
      what="تقييمات الشريك"
      back={{ href: "/clients", label: "كل الشركاء" }}
    />
  );
}
