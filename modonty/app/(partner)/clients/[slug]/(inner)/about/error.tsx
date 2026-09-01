"use client";

import { RouteError } from "@/components/shared/route-error/RouteError";

export default function PartnerAboutError({
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
      what="صفحة «عن الشريك»"
      back={{ href: "/clients", label: "كل الشركاء" }}
    />
  );
}
