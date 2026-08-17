import { Suspense } from "react";

import type { Metadata } from "next";

import { ModoChatClient } from "./components/modo-chat-client";
import { ModoChatSkeleton } from "./components/modo-chat-skeleton";

export const metadata: Metadata = {
  title: "مودو شات — مساعدك الذكي في مدونتي",
  description:
    "اسأل مودو عن أي مقال أو فئة في مدونتي، واحصل على إجابة مبنية على محتوى المنصة مع روابط المصادر.",
  robots: { index: false, follow: true },
};

export default function ModoChatPage() {
  return (
    <Suspense fallback={<ModoChatSkeleton />}>
      <ModoChatClient />
    </Suspense>
  );
}
