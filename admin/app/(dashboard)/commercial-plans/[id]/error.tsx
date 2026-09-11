"use client";

import { PageError } from "@/components/admin/page-error";

export default function CommercialPlanDetailError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <PageError error={error} reset={reset} title="تعذّر تحميل تفاصيل الباقة" />;
}
