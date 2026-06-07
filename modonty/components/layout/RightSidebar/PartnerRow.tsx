"use client";

import { useSearchParams } from "next/navigation";
import type { ReactNode } from "react";

interface PartnerRowProps {
  slug: string;
  children: ReactNode;
}

// Tiny client boundary — highlights the partner whose feed filter is currently active.
// Reads the URL param only; the row content stays server-rendered.
export function PartnerRow({ slug, children }: PartnerRowProps) {
  const isActive = useSearchParams().get("client") === slug;

  return (
    <div
      className={`group flex items-start gap-1 rounded transition-colors ${
        isActive
          ? "bg-primary/10 ring-1 ring-inset ring-primary/40"
          : "hover:bg-muted/50"
      }`}
    >
      {children}
    </div>
  );
}
