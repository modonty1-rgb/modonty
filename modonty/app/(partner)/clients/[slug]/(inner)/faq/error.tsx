"use client";

import { RouteError } from "@/components/shared/route-error/RouteError";

export default function PartnerFaqError({
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
      what="الأسئلة الشائعة"
      back={{ href: "/clients", label: "كل الشركاء" }}
    />
  );
}
