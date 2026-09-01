"use client";

import { RouteError } from "@/components/shared/route-error/RouteError";

export default function PartnerMentionsError({
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
      what="قائمة الإشارات"
      back={{ href: "/clients", label: "كل الشركاء" }}
    />
  );
}
