import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./components/providers/providers";
import { Toaster } from "@/components/ui/toaster";
import { GTMContainer } from "@/components/gtm/GTMContainer";

export const metadata: Metadata = {
  title: "Modonty Admin - Dashboard",
  description: "Admin dashboard for Modonty blog platform",
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full overflow-hidden" suppressHydrationWarning>
      <body className="bg-background h-full overflow-hidden ">
        <GTMContainer />
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
