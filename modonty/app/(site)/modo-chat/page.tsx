import { Suspense } from "react";

import type { Metadata } from "next";

import { PageLayout } from "./components/page-layout/PageLayout";
import { PageSkeleton } from "./components/page-layout/PageSkeleton";

export const metadata: Metadata = {
  title: "مودو شات — مساعدك الذكي في مدونتي",
  description:
    "اسأل مودو عن أي مقال أو فئة في مدونتي، واحصل على إجابة مبنية على محتوى المنصة مع روابط المصادر.",
  robots: { index: false, follow: true },
};

export default function ModoChatPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <PageLayout />
    </Suspense>
  );
}
