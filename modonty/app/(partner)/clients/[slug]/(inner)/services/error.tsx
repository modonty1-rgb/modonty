"use client";

import { RouteError } from "@/components/shared/route-error/RouteError";

export default function PartnerServicesError({
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
      what="خدمات الشريك"
      back={{ href: "/clients", label: "كل الشركاء" }}
    />
  );
}
