"use client";

import "./globals.css";
import { ErrorView } from "@/components/error-view";

/**
 * Last resort — the root layout itself failed, so this file REPLACES it and has to bring
 * its own `<html>`, `<body>`, styles and font. Rare, but the alternative is Next's raw
 * fallback screen: English, left-to-right, and unreadable for the client.
 */
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
        <title>صار خلل — مُدَوَّنَتِي</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-background">
        <ErrorView error={error} retry={unstable_retry} />
      </body>
    </html>
  );
}
