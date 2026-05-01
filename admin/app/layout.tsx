import type { Metadata } from "next";
import { Tajawal, Montserrat } from "next/font/google";
import "./globals.css";
import { auth } from "@/lib/auth";
import { Providers } from "./components/providers/providers";
import { Toaster } from "@/components/ui/toaster";
import { GTMContainer } from "@/components/gtm/GTMContainer";

// Brand fonts (per modonty Brand Guidelines): Tajawal for Arabic + Montserrat for Latin.
const tajawal = Tajawal({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "700", "800"],
  variable: "--font-tajawal",
  display: "swap",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-montserrat",
  display: "swap",
});

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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Pre-hydrate the client SessionProvider so useSession() returns the session
  // immediately on first render — eliminates the "header appears 1s after sidebar" flash.
  // auth() returns null on public routes (e.g. /login) — that's fine.
  const session = await auth().catch(() => null);

  return (
    <html lang="en" className={`h-full overflow-hidden ${tajawal.variable} ${montserrat.variable}`} suppressHydrationWarning>
      <body className="bg-background h-full overflow-hidden font-sans">
        <GTMContainer />
        <Providers session={session}>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
