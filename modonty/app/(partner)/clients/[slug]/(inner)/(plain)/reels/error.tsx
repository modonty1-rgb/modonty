"use client";

import { RouteError } from "@/components/shared/route-error/RouteError";

export default function PartnerReelsError({
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
      what="طلّات الشريك"
      back={{ href: "/clients", label: "كل الشركاء" }}
    />
  );
}
