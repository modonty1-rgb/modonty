import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import "./globals.css";
import { SessionProviderWrapper } from "@/components/providers/SessionProviderWrapper";
import { GTMContainer } from "@/components/gtm/GTMContainer";
import { Footer } from "@/components/layout/Footer";
import { TopNavWithFavorites } from "@/components/navigatore/TopNavWithFavorites";
import { MobileFooterWithFavorites } from "@/components/navigatore/MobileFooterWithFavorites";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://modonty.com"
  ),
  title: {
    default: "مودونتي - منصة المدونات متعددة العملاء",
    template: "%s | مودونتي",
  },
  description: "منصة مدونات احترافية لإدارة المحتوى عبر عملاء متعددين",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0E065A",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
       <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://res.cloudinary.com" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://static.hotjar.com" />
        <link rel="dns-prefetch" href="https://script.hotjar.com" />
        <link rel="dns-prefetch" href="https://connect.facebook.net" />
         
      </head>
      <body className="bg-background">
        <Suspense fallback={null}>
          <SessionProviderWrapper>
            <div className="min-h-screen flex flex-col">
              <Suspense fallback={<header className="h-14 border-b bg-white" />}>
                <TopNavWithFavorites />
              </Suspense>
              <main className="flex-1">{children}</main>
              <Footer />
              <Suspense fallback={<footer className="md:hidden h-16 border-t bg-white" />}>
                <MobileFooterWithFavorites />
              </Suspense>
            </div>
          </SessionProviderWrapper>
        </Suspense>
      </body>
    </html>
  );
}

