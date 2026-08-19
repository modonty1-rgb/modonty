"use client";

import { RouteError } from "@/components/shared/route-error/RouteError";

export default function PartnerReviewsError({
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
      what="تقييمات الشريك"
      back={{ href: "/clients", label: "كل الشركاء" }}
    />
  );
}
