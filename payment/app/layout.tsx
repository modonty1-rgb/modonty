import type { Metadata, Viewport } from "next";
import { Tajawal, Montserrat } from "next/font/google";

import "./globals.css";
import { ThemeProvider } from "./theme-provider";

/**
 * تخطيط جذر حزمة الدفع.
 *
 * ما ليس فيه هو أهمّ ما فيه: لا ترويسة موقع · لا تذييل · لا قائمة · **ولا مصادقة**.
 * صفحة الدفع يزورها مشترٍ غير مسجَّل (خالد ١٤ سبتمبر ٢٠٢٦: «صفحة الدفع المفروض تكون خارج
 * الأوثنتيكيشن»)، وكان جرس إشعارات مدونتي يُنفَّذ عليها عبر `app/not-found.tsx` فيملأ سجلّ
 * الخادم بأخطاء JWT ويوقف التهيئة بـ`crypto.getRandomValues()`. هنا لا يوجد ما يُنفَّذ أصلاً.
 */

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
  title: "الباقات والدفع",
  // لا فهرسة لمسار الدفع: صفحات النتيجة والطلب لا مكان لها في نتائج البحث.
  // صفحة الباقات وحدها تصرّح بعكس ذلك في `generateMetadata` الخاصّ بها.
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0E065A",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="ar"
      dir="rtl"
      suppressHydrationWarning
      className={`${tajawal.variable} ${montserrat.variable}`}
    >
      <body className="bg-background font-sans">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
