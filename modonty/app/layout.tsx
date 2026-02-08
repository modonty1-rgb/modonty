import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import "./globals.css";
import { SessionWrapper } from "@/components/providers/SessionWrapper";
import { ChatSheetProvider } from "@/components/chatbot/ChatSheetProvider";
import { GTMContainer } from "@/components/gtm/GTMContainer";
import { TopNav } from "@/components/TopNav";
import { Footer } from "@/components/Footer";
import { MobileFooter } from "@/components/MobileFooter";

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
      <body className="bg-background">
        <Suspense fallback={null}>
          <GTMContainer />
        </Suspense>
        <Suspense
          fallback={
            <div className="min-h-screen flex flex-col">
              <header className="h-14 border-b bg-white" />
              <main className="flex-1" />
            </div>
          }
        >
          <SessionWrapper>
            <ChatSheetProvider>
              <div className="min-h-screen flex flex-col">
                <TopNav />
                <main className="flex-1">{children}</main>
                <Footer />
                <MobileFooter />
              </div>
            </ChatSheetProvider>
          </SessionWrapper>
        </Suspense>
      </body>
    </html>
  );
}

