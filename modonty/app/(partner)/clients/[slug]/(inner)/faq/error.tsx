"use client";

import { RouteError } from "@/components/shared/route-error/RouteError";

export default function PartnerFaqError({
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
      what="الأسئلة الشائعة"
      back={{ href: "/clients", label: "كل الشركاء" }}
    />
  );
}
