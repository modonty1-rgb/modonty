"use client";

import { RouteError } from "@/components/shared/route-error/RouteError";

export default function PartnerLikesError({
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
      what="قائمة الإعجابات"
      back={{ href: "/clients", label: "كل الشركاء" }}
    />
  );
}
