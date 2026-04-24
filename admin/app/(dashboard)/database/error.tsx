"use client";

import { PageError } from "@/components/admin/page-error";

export default function DatabaseError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <PageError error={error} reset={reset} title="Could not load database info" />;
}
