import type { Metadata, Viewport } from "next";
import { Tajawal, Montserrat } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";
import { ThemeProvider } from "@/app/layout/components/theme-provider";
import { SessionProviderWrapper } from "@/app/layout/components/SessionProviderWrapper";
import { GTMContainer } from "@/app/layout/components/gtm/GTMContainer";
import { WebVitals } from "@/app/layout/components/gtm/WebVitals";
import { PageViewTracker } from "@/app/layout/components/analytics/PageViewTracker";
import { ClarityScript } from "@/app/layout/components/analytics/clarity-script";
import { BRAND_AR, SITE_URL } from "@/constants";
import { getSiteLanguage } from "@/lib/settings/get-site-language";

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
    default: `${BRAND_AR} - منصة المدونات متعددة الشركاء`,
    template: `%s | ${BRAND_AR}`,
  },
  description: "منصة مدونات احترافية لإدارة المحتوى عبر شركاء متعددين",
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
    // RSS auto-discovery (<link rel="alternate" type="application/rss+xml">) —
    // feed readers and AI aggregators find /feed.xml through this.
    types: {
      "application/rss+xml": "/feed.xml",
    },
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0E065A",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Content Language comes from Settings — the field admin has always shown was ignored here.
  const siteLanguage = await getSiteLanguage();

  return (
    <html
      lang={siteLanguage}
      dir="rtl"
      suppressHydrationWarning
      className={`${tajawal.variable} ${montserrat.variable}`}
    >
       <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://www.clarity.ms" />
        <link rel="dns-prefetch" href="https://connect.facebook.net" />
         
      </head>
      <body className="bg-background font-sans overflow-x-hidden">
        <GTMContainer />
        {/* WebVitals reads current-time via useReportWebVitals → must sit under a
            Suspense boundary (Next 16 cacheComponents). Renders null, so fallback=null. */}
        <Suspense fallback={null}>
          <WebVitals />
        </Suspense>
        {/* Counts views on every page Article/Client trackers don't cover. */}
        <Suspense fallback={null}>
          <PageViewTracker />
        </Suspense>
        <ClarityScript />
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {/* The provider hands down an unresolved session promise, so nothing here
              blocks the prerender. Only the components that read the session suspend,
              each behind its own boundary. */}
          {/* No chrome here on purpose: `app/(site)/layout.tsx` mounts modonty's
              header/footer, `app/(partner)/…` mounts the partner's own. */}
          <SessionProviderWrapper>{children}</SessionProviderWrapper>
        </ThemeProvider>
      </body>
    </html>
  );
}

