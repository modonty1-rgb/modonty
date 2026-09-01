"use client";

import { RouteError } from "@/components/shared/route-error/RouteError";

export default function PartnerBookError({
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
      what="صفحة الحجز"
      back={{ href: "/clients", label: "كل الشركاء" }}
    />
  );
}
