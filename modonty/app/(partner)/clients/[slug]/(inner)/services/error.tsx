"use client";

import { RouteError } from "@/components/shared/route-error/RouteError";

export default function PartnerServicesError({
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
      what="خدمات الشريك"
      back={{ href: "/clients", label: "كل الشركاء" }}
    />
  );
}
