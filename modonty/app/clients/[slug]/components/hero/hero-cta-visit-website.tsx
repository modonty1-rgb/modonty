"use client";

import Link from "@/components/link";
import { Button } from "@/components/ui/button";
import { Globe } from "lucide-react";
import { trackCtaClick } from "@/lib/cta-tracking";

export function CtaVisitWebsite({ url, clientId }: { url: string; clientId: string }) {
  return (
    <Link
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex-1 md:flex-none"
      onClick={() => {
        trackCtaClick({
          type: "LINK",
          label: "زيارة الموقع",
          targetUrl: url,
          clientId,
        });
      }}
    >
      <Button size="default" className="gap-2 w-full md:w-auto">
        <Globe className="h-4 w-4" />
        زيارة الموقع
      </Button>
    </Link>
  );
}
