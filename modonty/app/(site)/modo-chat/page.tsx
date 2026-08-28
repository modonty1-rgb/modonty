import { Suspense } from "react";

import type { Metadata } from "next";

import { PageLayout } from "./components/page-layout/PageLayout";
import { PageSkeleton } from "./components/page-layout/PageSkeleton";
import { messages } from "@/lib/i18n/messages";

export const metadata: Metadata = {
  title: messages.seo.modoChat.title,
  description: messages.seo.modoChat.description,
  robots: { index: false, follow: true },
};

export default function ModoChatPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <PageLayout />
    </Suspense>
  );
}
