import type { Metadata } from "next";
import "./globals.css";
import { GTMContainer } from "@/components/gtm/GTMContainer";
import { Providers } from "@/app/components/providers/providers";
import { ar } from "@/lib/ar";

export const metadata: Metadata = {
  title: ar.meta.title,
  description: ar.meta.description,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-background">
        <GTMContainer />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
