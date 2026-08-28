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
import { SITE_URL } from "@/constants";
import { getSiteLanguage } from "@/lib/settings/get-site-language";
import { getPageSeoDefaults } from "@/lib/settings/get-page-seo-defaults";
import { textDirection } from "@modonty/shared/lib/seo/text-direction";

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

// كانت `export const metadata` ثابتة، فاسم الماركة في قالب العنوان — وهو الذي يُلحَق
// بعنوان **كل صفحة** على الموقع — مكتوبٌ في الكود. صارت دالّة كي تقرأه من الإعدادات:
// نداءٌ واحد مخزَّن (`"use cache"` + وسم `settings`)، وهو نفس الوسم الذي يفرّغه كل حفظ أدمن.
// وبغياب العمود لا يُلحَق شيء — العنوان يُشحن كما كتبته الصفحة، لا بماركة قديمة.
export async function generateMetadata(): Promise<Metadata> {
  const { siteName } = await getPageSeoDefaults();

  return {
    metadataBase: new URL(SITE_URL),
    // `TemplateString` يشترط `template` نصّاً لا اختيارياً، فالفرع كله يُبدَّل: بوجود الاسم
    // قالبٌ يُلحقه، وبغيابه `default` وحده — والعنوان يُشحن كما كتبته الصفحة.
    title: siteName
      ? { default: `${siteName} - منصة المدونات متعددة الشركاء`, template: `%s | ${siteName}` }
      : "منصة المدونات متعددة الشركاء",
    description: "منصة مدونات احترافية لإدارة المحتوى عبر شركاء متعددين",
    // No `languages` here on purpose. This block used to declare four locales all pointing at
    // "/", and any page that did not define its own inherited them — so ~25 paths told Google
    // "the Saudi version of this page is the homepage", which is false for every one of them
    // except the homepage. Google's rule is the opposite: "Each language version must list
    // itself as well as all other language versions"
    // (developers.google.com/search/docs/specialty/international/localized-versions).
    //
    // Every page now builds its own set from `Settings.defaultAlternateLanguages`, pointing at
    // its OWN canonical — nine locales, one source, no copy in code.
    alternates: {
      // RSS auto-discovery (<link rel="alternate" type="application/rss+xml">) —
      // feed readers and AI aggregators find /feed.xml through this.
      types: {
        "application/rss+xml": "/feed.xml",
      },
    },
  };
}

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
      // Derived, not written. `dir` was the literal "rtl" while `lang` came from Settings —
      // the two describe the same thing, so switching Content Language to English produced
      // `lang="en" dir="rtl"`. Today it is Arabic and both agree; the point is that they
      // cannot disagree any more.
      dir={textDirection(siteLanguage)}
      // Next 16 stopped overriding `scroll-behavior` during navigation; without this attribute a
      // route change animates the whole scroll distance instead of jumping. We keep smooth
      // scrolling for in-page anchors, so we opt back into the override (version-16 upgrade guide).
      data-scroll-behavior="smooth"
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

