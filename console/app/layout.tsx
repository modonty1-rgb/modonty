import type { Metadata } from "next";
import "./globals.css";
import { GTMContainer } from "@/components/gtm/GTMContainer";
import { Providers } from "@/app/components/providers/providers";

export const metadata: Metadata = {
  title: "Client Portal - Modonty",
  description: "Modonty client portal. Sign in to access your dashboard.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-background">
        <GTMContainer />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
