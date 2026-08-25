"use client";

import "./globals.css";
import { RouteError } from "@/components/shared/route-error/RouteError";

export default function GlobalError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <title>تعذّر فتح مدونتي</title>
      </head>
      <body className="bg-background font-sans overflow-x-hidden">
        <RouteError error={error} reset={unstable_retry} what="الموقع" />
      </body>
    </html>
  );
}
