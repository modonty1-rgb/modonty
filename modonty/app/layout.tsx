import type { Metadata } from "next";
import "./globals.css";
import { SessionProvider } from "@/components/providers/SessionProvider";
import { GTMContainer } from "@/components/gtm/GTMContainer";
import { TopNav } from "@/components/TopNav";
import { Footer } from "@/components/Footer";
import { MobileFooter } from "@/components/MobileFooter";
import { auth } from "@/lib/auth";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://modonty.com"
  ),
  title: "مودونتي - منصة المدونات متعددة العملاء",
  description: "منصة مدونات احترافية لإدارة المحتوى عبر عملاء متعددين",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let session = null;

  try {
    // Treat invalid JWT session as logged-out user
    session = await auth();
  } catch (error) {
    const err = error as { type?: string; name?: string; code?: string };
    const isJwtSessionError =
      err?.type === "JWTSessionError" ||
      err?.name === "JWTSessionError" ||
      err?.code === "JWT_SESSION_ERROR";

    if (isJwtSessionError) {
      if (process.env.NODE_ENV === "development") {
        console.error(
          "[auth] JWTSessionError in RootLayout – treating as logged out."
        );
      }
      session = null;
    } else {
      throw error;
    }
  }

  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body className="bg-background">
        <GTMContainer />
        <SessionProvider session={session}>
          <div className="min-h-screen flex flex-col">
            <TopNav />
            <main className="flex-1">{children}</main>
            <Footer />
            <MobileFooter />
          </div>
        </SessionProvider>
      </body>
    </html>
  );
}

