import type { Metadata } from "next";
import "./globals.css";
import { GTMContainer } from "@/components/gtm/GTMContainer";
import { Providers } from "@/app/components/providers/providers";
import { ThemeProvider } from "@/app/components/providers/theme-provider";
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
  // suppressHydrationWarning: next-themes sets `class="dark"` on <html> before hydration
  // (its docs require it in app/ — the mismatch is intentional).
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
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
        {/* Mounted straight from the root layout (a server component), like modonty — next-themes
            injects its no-flash <script> here; nested inside a client Providers tree it warns. */}
        <ThemeProvider>
          <Providers>{children}</Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}
