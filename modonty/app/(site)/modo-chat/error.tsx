"use client";

import { RouteError } from "@/components/shared/route-error/RouteError";

export default function ModoChatError({
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
      what="محادثة مودو"
      back={{ href: "/modo-chat", label: "محادثة جديدة" }}
    />
  );
}
