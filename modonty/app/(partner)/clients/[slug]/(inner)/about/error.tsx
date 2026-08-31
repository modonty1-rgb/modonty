"use client";

import { RouteError } from "@/components/shared/route-error/RouteError";

export default function PartnerAboutError({
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
      what="صفحة «عن الشريك»"
      back={{ href: "/clients", label: "كل الشركاء" }}
    />
  );
}
