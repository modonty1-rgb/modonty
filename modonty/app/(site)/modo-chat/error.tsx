"use client";

import { RouteError } from "@/components/shared/route-error/RouteError";

export default function ModoChatError({
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
      what="محادثة مودو"
      back={{ href: "/modo-chat", label: "محادثة جديدة" }}
    />
  );
}
