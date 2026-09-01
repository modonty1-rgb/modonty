"use client";

import { RouteError } from "@/components/shared/route-error/RouteError";

export default function ClientPageError({
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
      what="صفحة الشريك"
      back={{ href: "/clients", label: "كل الشركاء" }}
    />
  );
}
