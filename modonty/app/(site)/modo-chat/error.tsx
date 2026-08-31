"use client";

import { RouteError } from "@/components/shared/route-error/RouteError";

export default function ModoChatError({
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
      what="محادثة مودو"
      back={{ href: "/modo-chat", label: "محادثة جديدة" }}
    />
  );
}
