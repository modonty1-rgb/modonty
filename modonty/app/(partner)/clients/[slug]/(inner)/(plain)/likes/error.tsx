"use client";

import { RouteError } from "@/components/shared/route-error/RouteError";

export default function PartnerLikesError({
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
      what="قائمة الإعجابات"
      back={{ href: "/clients", label: "كل الشركاء" }}
    />
  );
}
