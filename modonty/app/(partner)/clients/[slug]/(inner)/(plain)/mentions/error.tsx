"use client";

import { RouteError } from "@/components/shared/route-error/RouteError";

export default function PartnerMentionsError({
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
      what="قائمة الإشارات"
      back={{ href: "/clients", label: "كل الشركاء" }}
    />
  );
}
