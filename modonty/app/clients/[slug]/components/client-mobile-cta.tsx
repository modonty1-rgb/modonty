"use client";

import { useEffect, useState } from "react";
import Link from "@/components/link";
import { IconMessage } from "@/lib/icons";
import { cn } from "@/lib/utils";

interface ClientMobileCtaProps {
  clientSlug: string;
}

export function ClientMobileCta({ clientSlug }: ClientMobileCtaProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Show FAB only after hero section scrolls out of view (~300px from top)
    const onScroll = () => setVisible(window.scrollY > 300);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className={cn(
        "fixed bottom-16 inset-x-0 z-40 flex justify-center px-4 pb-2 lg:hidden pointer-events-none transition-all duration-300",
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
      )}
    >
      <Link
        href={`/clients/${encodeURIComponent(clientSlug)}/contact`}
        className="pointer-events-auto inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/30 hover:bg-primary/90 transition-colors active:scale-95"
        aria-label="اسأل العميل"
      >
        <IconMessage className="h-4 w-4" aria-hidden />
        اسأل العميل
      </Link>
    </div>
  );
}
