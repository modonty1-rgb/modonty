"use client";

import { PageError } from "@/components/admin/page-error";

export default function ArticlesError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <PageError error={error} reset={reset} title="Could not load articles" />;
}
