import type { Metadata, Viewport } from "next";
import { Tajawal, Montserrat } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { SessionProviderWrapper } from "@/components/providers/SessionProviderWrapper";
import { GTMContainer } from "@/components/gtm/GTMContainer";
import { HotjarScript } from "@/components/hotjar/HotjarScript";
import { Footer } from "@/components/layout/Footer";
import { TopNavWithFavorites } from "@/components/navigatore/TopNavWithFavorites";
import { MobileFooterWithFavorites } from "@/components/navigatore/MobileFooterWithFavorites";
import { AnnouncementBar } from "@/components/navigatore/AnnouncementBar";
import { BRAND_AR, SITE_URL } from "@/lib/brand";

const tajawal = Tajawal({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "700"],
  variable: "--font-tajawal",
  display: "swap",
  preload: true,
});

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-montserrat",
  display: "swap",
  preload: true,
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${BRAND_AR} - منصة المدونات متعددة العملاء`,
    template: `%s | ${BRAND_AR}`,
  },
  description: "منصة مدونات احترافية لإدارة المحتوى عبر عملاء متعددين",
  // Site-wide hreflang signals to AI search engines + Google geo-targeting.
  // Mariam audit 2026-05-27: site had ZERO hreflang on homepage; only ar+x-default on articles.
  // Per-page generateMetadata can override `alternates.canonical` but inherits these languages.
  alternates: {
    languages: {
      "ar-SA": "/",
      "ar-EG": "/",
      ar: "/",
      "x-default": "/",
    },
  },
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
    <html
      lang="ar-SA"
      dir="rtl"
      suppressHydrationWarning
      className={`${tajawal.variable} ${montserrat.variable}`}
    >
       <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://res.cloudinary.com" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://static.hotjar.com" />
        <link rel="dns-prefetch" href="https://script.hotjar.com" />
        <link rel="dns-prefetch" href="https://connect.facebook.net" />
         
      </head>
      <body className="bg-background font-sans overflow-x-hidden">
        <GTMContainer />
        <HotjarScript />
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Suspense fallback={null}>
            <SessionProviderWrapper>
              <div className="min-h-screen flex flex-col">
                <AnnouncementBar />
                <Suspense fallback={<header className="h-14 border-b bg-card" />}>
                  <TopNavWithFavorites />
                </Suspense>
                <main id="main-content" className="flex-1 pb-16 md:pb-0">{children}</main>
                <Footer />
                <Suspense fallback={<footer className="md:hidden h-16 border-t bg-card" />}>
                  <MobileFooterWithFavorites />
                </Suspense>
              </div>
            </SessionProviderWrapper>
          </Suspense>
        </ThemeProvider>
      </body>
    </html>
  );
}

