"use client";

import { PageError } from "@/components/admin/page-error";

/** كل شاشة في التقويم تقرأ القاعدة عند الفتح — فقد تفشل، وهذا الحدّ المشترك لها. */
export default function SocialCalendarError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <PageError error={error} reset={reset} title="تعذّر تحميل تقويم السوشيال" />;
}
